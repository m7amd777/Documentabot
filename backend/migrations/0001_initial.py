"""
Migration 0001 — initial schema

Tables: users, documents, chats, chat_messages
"""

SQL_UP = """
CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    password TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    file_size INTEGER NOT NULL,
    pages     INTE`GER,
    chunks    INTEGER,
    file_type TEXT    NOT NULL,
    category  TEXT,
    owner_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status    TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive'))
);

CREATE TABLE IF NOT EXISTS chats (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    chat_id     INTEGER  NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    is_response INTEGER  NOT NULL DEFAULT 0 CHECK(is_response IN (0, 1)),
    content     TEXT     NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);
"""

SQL_DOWN = """
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS users;
"""


def up(conn):
    conn.executescript(SQL_UP)


def down(conn):
    conn.executescript(SQL_DOWN)
