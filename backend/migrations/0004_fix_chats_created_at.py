import sqlite3 as _sqlite3

SQL_DOWN = "SELECT 1;"


def up(conn):
    try:
        conn.execute("ALTER TABLE chats ADD COLUMN created_at TEXT;")
        conn.commit()
    except _sqlite3.OperationalError as e:
        if "duplicate column" not in str(e):
            raise
        # Column already present from migration 0003 — nothing to do


def down(conn):
    conn.commit()
