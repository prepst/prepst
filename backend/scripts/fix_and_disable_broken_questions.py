"""
Fix and Disable Broken Questions Script
1. Fixes questions where we can extract answers from rationale
2. Disables questions where we cannot extract answers (sets is_active = false)

Usage:
    # Dry run to see what would happen
    python scripts/fix_and_disable_broken_questions.py --dry-run

    # Actually fix and disable
    python scripts/fix_and_disable_broken_questions.py --fix
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
    """Extract numeric/text answer from rationale."""
    if not rationale_html:
        return []

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
            answer = answer.rstrip('.')
            return [answer]

    return []


def fix_and_disable(dry_run=True):
    """Fix questions where possible, disable the rest."""
    print("=" * 80)
    print("FIX AND DISABLE BROKEN QUESTIONS")
    print("=" * 80)
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE FIX'}\n")

    # Fetch all questions with empty correct_answer from database
    print("Fetching questions with empty correct_answer...")
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
    broken_questions = [q for q in all_questions if q.get('correct_answer') == []]

    print(f"Found {len(broken_questions)} questions with empty correct_answer")
    print(f"  - SPR: {sum(1 for q in broken_questions if q['question_type'] == 'spr')}")
    print(f"  - MC: {sum(1 for q in broken_questions if q['question_type'] == 'mc')}\n")

    # Try to fix each question
    to_fix = []
    to_disable = []

    for q in broken_questions:
        extracted = None

        if q.get('rationale'):
            extracted = extract_answer_from_rationale(q['rationale'])
            # Filter out empty strings
            if extracted:
                extracted = [a for a in extracted if a and a.strip()]

        if extracted and len(extracted) > 0:
            to_fix.append({
                'id': q['id'],
                'external_id': q['external_id'],
                'type': q['question_type'],
                'new_answer': extracted
            })
        else:
            to_disable.append({
                'id': q['id'],
                'external_id': q['external_id'],
                'type': q['question_type']
            })

    # Report findings
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total broken questions: {len(broken_questions)}")
    print(f"✅ Can fix (extract answer): {len(to_fix)}")
    print(f"⚠️  Will disable (cannot fix): {len(to_disable)}\n")

    if to_fix:
        print(f"Sample fixes (first 5):")
        for item in to_fix[:5]:
            print(f"  {item['external_id']} ({item['type']}): {item['new_answer']}")

    if to_disable:
        print(f"\nWill disable (first 10):")
        for item in to_disable[:10]:
            print(f"  {item['external_id']} ({item['type']})")

    # Apply changes if not dry run
    if not dry_run:
        print(f"\n{'=' * 80}")
        print("APPLYING CHANGES")
        print("=" * 80)

        # Fix questions
        if to_fix:
            print(f"\nFixing {len(to_fix)} questions...")
            success_count = 0
            for item in to_fix:
                try:
                    supabase.table('questions').update({
                        'correct_answer': item['new_answer']
                    }).eq('id', item['id']).execute()
                    success_count += 1
                    if success_count % 10 == 0:
                        print(f"  Fixed {success_count}/{len(to_fix)}...")
                except Exception as e:
                    print(f"  ❌ Failed to fix {item['external_id']}: {e}")

            print(f"✅ Fixed {success_count} questions!")

        # Disable unfixable questions
        if to_disable:
            print(f"\nDisabling {len(to_disable)} questions...")
            success_count = 0
            for item in to_disable:
                try:
                    supabase.table('questions').update({
                        'is_active': False
                    }).eq('id', item['id']).execute()
                    success_count += 1
                    if success_count % 10 == 0:
                        print(f"  Disabled {success_count}/{len(to_disable)}...")
                except Exception as e:
                    print(f"  ❌ Failed to disable {item['external_id']}: {e}")

            print(f"✅ Disabled {success_count} questions!")

        print(f"\n{'=' * 80}")
        print("COMPLETE")
        print("=" * 80)
        print(f"✅ Fixed: {len(to_fix)} questions")
        print(f"⚠️  Disabled: {len(to_disable)} questions")
        print(f"Total active questions remaining: {len(all_questions) - len(to_disable)}")
    else:
        print(f"\n💡 Run with --fix to apply these changes")


def main():
    parser = argparse.ArgumentParser(description='Fix and disable broken questions')
    parser.add_argument('--dry-run', action='store_true', help='Show what would happen')
    parser.add_argument('--fix', action='store_true', help='Actually apply changes')

    args = parser.parse_args()

    if not args.dry_run and not args.fix:
        print("Please specify either --dry-run or --fix")
        parser.print_help()
        return

    fix_and_disable(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
