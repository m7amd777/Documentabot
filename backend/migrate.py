"""
Migration runner.

Usage:
    python migrate.py up      # apply all pending migrations
    python migrate.py down    # roll back the latest applied migration
    python migrate.py status  # list applied vs pending migrations
"""

import importlib
import os
import sqlite3
import sys

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "migrations")
DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def ensure_migrations_table(conn: sqlite3.Connection):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS _migrations (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL UNIQUE,
            applied_at DATETIME NOT NULL DEFAULT (datetime('now'))
        )
    """)
    conn.commit()


def applied_migrations(conn: sqlite3.Connection) -> list[str]:
    rows = conn.execute("SELECT name FROM _migrations ORDER BY id").fetchall()
    return [r[0] for r in rows]


def available_migrations() -> list[str]:
    files = sorted(
        f[:-3]  # strip .py
        for f in os.listdir(MIGRATIONS_DIR)
        if f.endswith(".py") and not f.startswith("_") and f != "__init__.py"
    )
    return files


def run_up():
    conn = get_conn()
    ensure_migrations_table(conn)
    done = set(applied_migrations(conn))
    pending = [m for m in available_migrations() if m not in done]

    if not pending:
        print("Nothing to migrate.")
        return

    for name in pending:
        print(f"  Applying {name} ...", end=" ")
        mod = importlib.import_module(f"migrations.{name}")
        mod.up(conn)
        conn.execute("INSERT INTO _migrations (name) VALUES (?)", (name,))
        conn.commit()
        print("done")


def run_down():
    conn = get_conn()
    ensure_migrations_table(conn)
    done = applied_migrations(conn)

    if not done:
        print("No migrations to roll back.")
        return

    name = done[-1]
    print(f"  Rolling back {name} ...", end=" ")
    mod = importlib.import_module(f"migrations.{name}")
    mod.down(conn)
    conn.execute("DELETE FROM _migrations WHERE name = ?", (name,))
    conn.commit()
    print("done")


def run_status():
    conn = get_conn()
    ensure_migrations_table(conn)
    done = set(applied_migrations(conn))
    all_migrations = available_migrations()

    print(f"{'Migration':<40} Status")
    print("-" * 50)
    for m in all_migrations:
        status = "applied" if m in done else "pending"
        print(f"{m:<40} {status}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "up"

    if cmd == "up":
        run_up()
    elif cmd == "down":
        run_down()
    elif cmd == "status":
        run_status()
    else:
        print(f"Unknown command '{cmd}'. Use: up | down | status")
        sys.exit(1)
