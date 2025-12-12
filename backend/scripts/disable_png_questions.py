"""
Disable Questions with PNG Images in Answer Choices

This script identifies and disables all questions that have PNG images
embedded in their answer choices (base64 encoded images).

Usage:
    # Dry run (show what would be disabled)
    python scripts/disable_png_questions.py --dry-run

    # Actually disable the questions
    python scripts/disable_png_questions.py --execute
"""

import os
import sys
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


def has_png_in_answer_options(answer_options):
    """
    Check if answer_options contains PNG images

    Args:
        answer_options: JSONB field containing answer choices

    Returns:
        bool: True if PNG images found in answer options
    """
    if not answer_options:
        return False

    # Convert to string to search for data:image/png
    answer_str = str(answer_options)
    return 'data:image/png' in answer_str


def find_png_questions():
    """
    Find all questions with PNG images in answer choices

    Returns:
        list: List of question dictionaries with PNG in answers
    """
    print("🔍 Scanning database for questions with PNG in answer choices...")

    # Fetch all questions in batches
    all_questions = []
    batch_size = 1000
    offset = 0

    while True:
        result = supabase.table('questions').select(
            'id, external_id, stem, module, difficulty, answer_options, is_active'
        ).range(offset, offset + batch_size - 1).execute()

        all_questions.extend(result.data)

        if len(result.data) < batch_size:
            break

        offset += batch_size

    print(f"   Loaded {len(all_questions)} total questions from database")

    # Filter questions with PNG in answer options
    png_questions = []
    for q in all_questions:
        if has_png_in_answer_options(q.get('answer_options')):
            png_questions.append(q)

    return png_questions


def disable_questions(question_ids, dry_run=True):
    """
    Disable questions by setting is_active = False

    Args:
        question_ids: List of question IDs to disable
        dry_run: If True, don't actually update database

    Returns:
        int: Number of questions disabled
    """
    if dry_run:
        print("\n🔍 DRY RUN MODE - No changes will be made to database")
        return 0

    print(f"\n🚫 Disabling {len(question_ids)} questions...")

    success_count = 0
    error_count = 0

    for i, question_id in enumerate(question_ids, 1):
        try:
            supabase.table('questions').update({
                'is_active': False
            }).eq('id', question_id).execute()

            success_count += 1

            if i % 10 == 0:
                print(f"   Progress: {i}/{len(question_ids)} questions disabled")

        except Exception as e:
            error_count += 1
            print(f"   ⚠️  Error disabling question {question_id}: {e}")

    print(f"\n✅ Successfully disabled: {success_count}")
    if error_count > 0:
        print(f"❌ Errors: {error_count}")

    return success_count


def main():
    parser = argparse.ArgumentParser(
        description='Disable questions with PNG images in answer choices'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be disabled without making changes'
    )
    parser.add_argument(
        '--execute',
        action='store_true',
        help='Actually disable the questions'
    )

    args = parser.parse_args()

    # Default to dry run if neither flag specified
    if not args.dry_run and not args.execute:
        print("⚠️  No action specified. Running in dry-run mode by default.")
        print("   Use --execute to actually disable questions\n")
        args.dry_run = True

    # Find questions with PNG in answer choices
    png_questions = find_png_questions()

    print(f"\n📊 Found {len(png_questions)} questions with PNG in answer choices")

    if len(png_questions) == 0:
        print("✅ No questions found with PNG images. Nothing to do!")
        return

    # Show breakdown
    active_count = sum(1 for q in png_questions if q.get('is_active'))
    inactive_count = len(png_questions) - active_count

    print(f"\n   Active: {active_count}")
    print(f"   Already inactive: {inactive_count}")

    # Show module breakdown
    math_count = sum(1 for q in png_questions if q.get('module') == 'math')
    english_count = sum(1 for q in png_questions if q.get('module') == 'english')
    print(f"\n   Math: {math_count}")
    print(f"   English: {english_count}")

    # Show difficulty breakdown
    easy_count = sum(1 for q in png_questions if q.get('difficulty') == 'E')
    medium_count = sum(1 for q in png_questions if q.get('difficulty') == 'M')
    hard_count = sum(1 for q in png_questions if q.get('difficulty') == 'H')
    print(f"\n   Easy: {easy_count}")
    print(f"   Medium: {medium_count}")
    print(f"   Hard: {hard_count}")

    # Show sample questions
    print(f"\n📝 Sample questions to be disabled:")
    for i, q in enumerate(png_questions[:5], 1):
        # Strip HTML tags for display
        import re
        stem_text = re.sub(r'<[^>]+>', '', q.get('stem', ''))[:80]
        print(f"   {i}. {q.get('external_id')} - {q.get('module')} - {q.get('difficulty')}")
        print(f"      {stem_text}...")
        print(f"      Active: {q.get('is_active')}")

    if len(png_questions) > 5:
        print(f"   ... and {len(png_questions) - 5} more")

    # Get only active questions to disable
    active_png_questions = [q for q in png_questions if q.get('is_active')]

    if len(active_png_questions) == 0:
        print("\n✅ All PNG questions are already disabled!")
        return

    # Ask for confirmation if executing
    if args.execute:
        print(f"\n⚠️  WARNING: About to disable {len(active_png_questions)} active questions!")
        print("   This will prevent them from appearing in practice sessions.")
        response = input("\n   Type 'yes' to confirm: ")

        if response.lower() != 'yes':
            print("\n❌ Aborted. No changes made.")
            return

    # Disable the questions
    question_ids = [q['id'] for q in active_png_questions]
    disabled_count = disable_questions(question_ids, dry_run=args.dry_run)

    if args.dry_run:
        print(f"\n💡 DRY RUN COMPLETE")
        print(f"   {len(active_png_questions)} questions would be disabled")
        print(f"   Run with --execute to actually disable them")
    else:
        print(f"\n✅ DONE! Disabled {disabled_count} questions with PNG images")
        print(f"   {inactive_count} were already inactive")
        print(f"   Total PNG questions in database: {len(png_questions)}")


if __name__ == '__main__':
    main()
