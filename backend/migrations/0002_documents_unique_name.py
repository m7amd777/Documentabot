"""
Migration 0002 — unique constraint on documents.name (system-wide)
"""

SQL_UP = """
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_name ON documents(name);
"""

SQL_DOWN = """
DROP INDEX IF EXISTS idx_documents_name;
"""


def up(conn):
    conn.executescript(SQL_UP)


def down(conn):
    conn.executescript(SQL_DOWN)
