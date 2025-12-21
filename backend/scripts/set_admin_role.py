"""
One-time script to set admin role in both auth.users metadata and public.users table
"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Use service key for admin operations
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# Email of user to make admin
ADMIN_EMAIL = "l3atjin@gmail.com"

# Get user by email
response = supabase.auth.admin.list_users()
users = [u for u in response if u.email == ADMIN_EMAIL]

if not users:
    print(f"User {ADMIN_EMAIL} not found")
    exit(1)

user = users[0]
print(f"Found user: {user.email} (ID: {user.id})")

# Update user metadata to include role (for JWT token)
current_metadata = user.user_metadata or {}
current_metadata['role'] = 'admin'

supabase.auth.admin.update_user_by_id(
    user.id,
    {"user_metadata": current_metadata}
)

# Also update the role in the public.users table (for backend checks)
supabase.table("users").update({"role": "admin"}).eq("id", user.id).execute()

print(f"✅ Successfully set role=admin for {user.email}")
print("   - Updated auth.users.user_metadata.role")
print("   - Updated public.users.role")
print("⚠️  User must sign out and sign back in to see changes in frontend")
