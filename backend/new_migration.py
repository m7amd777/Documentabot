"""
Scaffold a new migration file.

Usage:
    python new_migration.py <description>

Example:
    python new_migration.py add_email_to_users

Creates:
    migrations/0002_add_email_to_users.py
"""

import os
import sys

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "migrations")

TEMPLATE = '''\
"""
Migration {number} — {description}
"""

SQL_UP = """
-- TODO: write your forward migration SQL here
"""

SQL_DOWN = """
-- TODO: write your rollback SQL here
"""


def up(conn):
    conn.executescript(SQL_UP)


def down(conn):
    conn.executescript(SQL_DOWN)
'''


def next_number() -> str:
    existing = sorted(
        f for f in os.listdir(MIGRATIONS_DIR)
        if f.endswith(".py") and not f.startswith("_") and f != "__init__.py"
    )
    if not existing:
        return "0001"
    last = existing[-1]
    last_num = int(last.split("_")[0])
    return f"{last_num + 1:04d}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python new_migration.py <description>")
        print("Example: python new_migration.py add_email_to_users")
        sys.exit(1)

    description = "_".join(sys.argv[1:]).lower().replace(" ", "_")
    number = next_number()
    filename = f"{number}_{description}.py"
    filepath = os.path.join(MIGRATIONS_DIR, filename)

    if os.path.exists(filepath):
        print(f"File already exists: {filepath}")
        sys.exit(1)

    content = TEMPLATE.format(number=number, description=description)
    with open(filepath, "w") as f:
        f.write(content)

    print(f"Created: migrations/{filename}")


if __name__ == "__main__":
    main()
