SQL_UP = """
ALTER TABLE chats ADD COLUMN created_at DATETIME NOT NULL DEFAULT (datetime('now'));
"""

SQL_DOWN = """
SELECT 1;
"""


def up(conn):
    conn.executescript(SQL_UP)


def down(conn):
    conn.executescript(SQL_DOWN)
