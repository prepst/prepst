"""
Fix Missing Answers Script
Repairs questions in the database with empty correct_answer arrays by extracting
answers from rationale text or JSON source data.

Usage:
    # Dry run to see what would be fixed
    python scripts/fix_missing_answers.py --dry-run

    # Actually fix the questions
    python scripts/fix_missing_answers.py --fix
"""

import json
import re
import sys
import os
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv
import argparse

# Load environment variables
load_dotenv('.env.local')

# Initialize Supabase client with service role key (bypasses RLS)
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')
)


def extract_answer_from_rationale(rationale_html):
    """
    Extract numeric/text answer from 'The correct answer is X' pattern in rationale.

    Handles multiple patterns:
    - "The correct answer is 2.6"
    - "The correct answer is 28"
    - "The correct answer is either 0 or 3" (returns list)
    """
    if not rationale_html:
        return None

    # Remove HTML tags to get clean text
    text = re.sub(r'<[^>]+>', '', rationale_html)

    # Pattern 1: "either X or Y" for multiple valid answers
    either_pattern = r'correct answer is either\s+([0-9.,/\-]+)\s+or\s+([0-9.,/\-]+)'
    either_match = re.search(either_pattern, text, re.IGNORECASE)
    if either_match:
        return [either_match.group(1).strip(), either_match.group(2).strip()]

    # Pattern 2: "either X, Y, or Z" for three valid answers
    either_three_pattern = r'correct answer is either\s+([0-9.,/\-]+),\s+([0-9.,/\-]+),\s+or\s+([0-9.,/\-]+)'
    either_three_match = re.search(either_three_pattern, text, re.IGNORECASE)
    if either_three_match:
        return [either_three_match.group(1).strip(), either_three_match.group(2).strip(), either_three_match.group(3).strip()]

    # Pattern 3: Single answer "The correct answer is X"
    patterns = [
        r'The correct answer is\s+([0-9.,/\-]+)',
        r'correct answer is\s+([0-9.,/\-]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            answer = match.group(1).strip()
            # Remove trailing periods
            answer = answer.rstrip('.')
            return [answer]

    return None


def load_json_data():
    """Load the question bank JSON file."""
    json_path = Path(__file__).parent.parent / 'question_bank.json'

    if not json_path.exists():
        print(f"ERROR: question_bank.json not found at {json_path}")
        return None

    with open(json_path) as f:
        return json.load(f)


def fix_missing_answers(dry_run=True):
    """
    Find and fix questions with empty correct_answer arrays.

    Args:
        dry_run: If True, only report what would be fixed without updating DB
    """
    print("=" * 80)
    print("FIX MISSING ANSWERS SCRIPT")
    print("=" * 80)
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE FIX'}\n")

    # Load JSON data
    print("Loading question_bank.json...")
    json_data = load_json_data()
    if not json_data:
        return

    # Create lookup by source_uid
    json_lookup = {q['uId']: q for q in json_data.values() if 'uId' in q}
    print(f"Loaded {len(json_data)} questions from JSON\n")

    # Fetch all questions with empty correct_answer from database
    print("Fetching questions with empty correct_answer from database...")
    all_questions = []
    offset = 0
    page_size = 1000

    while True:
        result = supabase.table('questions').select('*').range(offset, offset + page_size - 1).execute()
        all_questions.extend(result.data)
        if len(result.data) < page_size:
            break
        offset += page_size

    # Filter to only questions with empty correct_answer
    empty_answer_questions = [q for q in all_questions if q.get('correct_answer') == []]

    print(f"Found {len(empty_answer_questions)} questions with empty correct_answer")
    print(f"  - SPR: {sum(1 for q in empty_answer_questions if q['question_type'] == 'spr')}")
    print(f"  - MC: {sum(1 for q in empty_answer_questions if q['question_type'] == 'mc')}")
    print()

    # Try to fix each question
    fixed_count = 0
    failed_count = 0
    fixes = []

    for db_question in empty_answer_questions:
        external_id = db_question['external_id']
        source_uid = db_question['source_uid']
        question_id = db_question['id']

        # Try to find in JSON and extract answer
        extracted_answer = None
        source = None

        # Method 1: Extract from rationale in DB
        if db_question.get('rationale'):
            extracted_answer = extract_answer_from_rationale(db_question['rationale'])
            if extracted_answer:
                source = "database rationale"

        # Method 2: Look up in JSON and extract from there
        if not extracted_answer and source_uid and source_uid in json_lookup:
            json_q = json_lookup[source_uid]
            content = json_q.get('content', {})

            # Try to get from answer object
            answer_obj = content.get('answer', {})
            if isinstance(answer_obj, dict):
                correct_choice = answer_obj.get('correct_choice')
                if correct_choice:
                    extracted_answer = [correct_choice]
                    source = "JSON answer.correct_choice"
                elif answer_obj.get('rationale'):
                    extracted_answer = extract_answer_from_rationale(answer_obj['rationale'])
                    if extracted_answer:
                        source = "JSON rationale"

        # Filter out empty strings from extracted answers
        if extracted_answer:
            extracted_answer = [a for a in extracted_answer if a and a.strip()]

        if extracted_answer and len(extracted_answer) > 0:
            fixes.append({
                'id': question_id,
                'external_id': external_id,
                'type': db_question['question_type'],
                'old_answer': db_question['correct_answer'],
                'new_answer': extracted_answer,
                'source': source
            })
            fixed_count += 1
        else:
            failed_count += 1
            if failed_count <= 5:  # Show first 5 failures
                print(f"⚠️  Could not fix: {external_id} ({db_question['question_type']})")

    # Report findings
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total questions with empty answers: {len(empty_answer_questions)}")
    print(f"✅ Can fix: {fixed_count}")
    print(f"❌ Cannot fix: {failed_count}")

    if fixes:
        print(f"\n--- Sample fixes (first 10) ---")
        for fix in fixes[:10]:
            print(f"\n{fix['external_id']} ({fix['type']}):")
            print(f"  Source: {fix['source']}")
            print(f"  Old: {fix['old_answer']}")
            print(f"  New: {fix['new_answer']}")

    # Apply fixes if not dry run
    if not dry_run and fixes:
        print(f"\n{'=' * 80}")
        print("APPLYING FIXES")
        print("=" * 80)

        success_count = 0
        for fix in fixes:
            try:
                supabase.table('questions').update({
                    'correct_answer': fix['new_answer']
                }).eq('id', fix['id']).execute()
                success_count += 1
                if success_count % 10 == 0:
                    print(f"Updated {success_count}/{len(fixes)} questions...")
            except Exception as e:
                print(f"❌ Failed to update {fix['external_id']}: {e}")

        print(f"\n✅ Successfully updated {success_count} questions!")
    elif not dry_run:
        print("\n⚠️  No fixes to apply")
    else:
        print(f"\n💡 Run with --fix to apply these {fixed_count} fixes")

    return fixes


def main():
    parser = argparse.ArgumentParser(description='Fix questions with missing answers')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be fixed without updating')
    parser.add_argument('--fix', action='store_true', help='Actually apply the fixes')

    args = parser.parse_args()

    if not args.dry_run and not args.fix:
        print("Please specify either --dry-run or --fix")
        parser.print_help()
        return

    fix_missing_answers(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
