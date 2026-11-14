import json
import os
import sqlite3
from contextlib import closing
from datetime import datetime
from pathlib import Path
from typing import Optional


DB_PATH = Path(os.environ.get("SQLITE_DB_PATH", Path(__file__).with_name("app.db")))


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=30)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA busy_timeout = 30000")
    return connection


def _dump(document: dict) -> str:
    return json.dumps(document, ensure_ascii=False)


def _load(document: str) -> dict:
    return json.loads(document)


def _with_status_override(row: sqlite3.Row) -> dict:
    document = _load(row["data"])
    if row["status_override"] is not None:
        document["status_override"] = row["status_override"]
    return document


def initialize_database(products: list, admin: Optional[dict]) -> None:
    with closing(_connect()) as connection:
        with connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    data TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS orders (
                    code TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    status_override TEXT,
                    data TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS login_attempts (
                    key TEXT PRIMARY KEY,
                    count INTEGER NOT NULL,
                    last TEXT NOT NULL
                );
                """
            )
            product_count = connection.execute(
                "SELECT COUNT(*) FROM products"
            ).fetchone()[0]
            if product_count == 0:
                connection.executemany(
                    "INSERT INTO products (id, category, data) VALUES (?, ?, ?)",
                    [
                        (product["id"], product["category"], _dump(product))
                        for product in products
                    ],
                )
            if admin:
                connection.execute(
                    """
                    INSERT OR IGNORE INTO users
                        (id, email, password_hash, name, role, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        admin["id"],
                        admin["email"].lower().strip(),
                        admin["password_hash"],
                        admin["name"],
                        admin["role"],
                        admin["created_at"],
                    ),
                )


def get_user_by_id(user_id: str) -> Optional[dict]:
    with closing(_connect()) as connection:
        row = connection.execute(
            "SELECT id, email, name, role FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    return dict(row) if row else None


def get_user_by_email(email: str) -> Optional[dict]:
    with closing(_connect()) as connection:
        row = connection.execute(
            """
            SELECT id, email, password_hash, name, role
            FROM users WHERE email = ?
            """,
            (email,),
        ).fetchone()
    return dict(row) if row else None


def get_products(category: Optional[str] = None) -> list:
    with closing(_connect()) as connection:
        if category:
            rows = connection.execute(
                "SELECT data FROM products WHERE category = ? LIMIT 1000",
                (category,),
            ).fetchall()
        else:
            rows = connection.execute("SELECT data FROM products LIMIT 1000").fetchall()
    return [_load(row["data"]) for row in rows]


def product_exists(product_id: str) -> bool:
    with closing(_connect()) as connection:
        row = connection.execute(
            "SELECT 1 FROM products WHERE id = ?", (product_id,)
        ).fetchone()
    return row is not None


def insert_product(document: dict) -> None:
    with closing(_connect()) as connection:
        with connection:
            connection.execute(
                "INSERT INTO products (id, category, data) VALUES (?, ?, ?)",
                (document["id"], document["category"], _dump(document)),
            )


def update_product(product_id: str, fields: dict) -> Optional[dict]:
    with closing(_connect()) as connection:
        with connection:
            row = connection.execute(
                "SELECT data FROM products WHERE id = ?", (product_id,)
            ).fetchone()
            if not row:
                return None
            document = _load(row["data"])
            document.update(fields)
            connection.execute(
                "UPDATE products SET category = ?, data = ? WHERE id = ?",
                (document["category"], _dump(document), product_id),
            )
    return document


def delete_product(product_id: str) -> bool:
    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                "DELETE FROM products WHERE id = ?", (product_id,)
            )
    return cursor.rowcount > 0


def insert_order(document: dict) -> None:
    with closing(_connect()) as connection:
        with connection:
            connection.execute(
                """
                INSERT INTO orders (code, created_at, data)
                VALUES (?, ?, ?)
                """,
                (document["code"], document["created_at"], _dump(document)),
            )


def get_order(code: str) -> Optional[dict]:
    with closing(_connect()) as connection:
        row = connection.execute(
            "SELECT data, status_override FROM orders WHERE code = ?", (code,)
        ).fetchone()
    return _with_status_override(row) if row else None


def get_orders() -> list:
    with closing(_connect()) as connection:
        rows = connection.execute(
            """
            SELECT data, status_override FROM orders
            ORDER BY created_at DESC LIMIT 500
            """
        ).fetchall()
    return [_with_status_override(row) for row in rows]


def update_order_status(code: str, status: str) -> Optional[dict]:
    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                "UPDATE orders SET status_override = ? WHERE code = ?",
                (status, code),
            )
            if cursor.rowcount == 0:
                return None
            row = connection.execute(
                "SELECT data, status_override FROM orders WHERE code = ?", (code,)
            ).fetchone()
    return _with_status_override(row)


def get_login_attempt(key: str) -> Optional[dict]:
    with closing(_connect()) as connection:
        row = connection.execute(
            "SELECT key, count, last FROM login_attempts WHERE key = ?", (key,)
        ).fetchone()
    if not row:
        return None
    return {
        "key": row["key"],
        "count": row["count"],
        "last": datetime.fromisoformat(row["last"]),
    }


def record_login_failure(key: str, last: datetime) -> None:
    with closing(_connect()) as connection:
        with connection:
            connection.execute(
                """
                INSERT INTO login_attempts (key, count, last)
                VALUES (?, 1, ?)
                ON CONFLICT(key) DO UPDATE SET
                    count = count + 1,
                    last = excluded.last
                """,
                (key, last.isoformat()),
            )


def clear_login_attempt(key: str) -> None:
    with closing(_connect()) as connection:
        with connection:
            connection.execute("DELETE FROM login_attempts WHERE key = ?", (key,))
