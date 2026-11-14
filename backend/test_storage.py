import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from backend import storage


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_db_path = storage.DB_PATH
        storage.DB_PATH = Path(self.temp_dir.name) / "test.db"
        self.products = [
            {
                "id": "test-item",
                "name": "Test item",
                "category": "test",
                "price": 1.0,
            }
        ]
        self.admin = {
            "id": "admin-id",
            "email": "admin@example.com",
            "password_hash": "hashed",
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        storage.initialize_database(self.products, self.admin)

    def tearDown(self):
        storage.DB_PATH = self.original_db_path
        self.temp_dir.cleanup()

    def test_seed_is_idempotent_and_product_crud_works(self):
        storage.initialize_database(
            [{**self.products[0], "name": "Changed seed"}], self.admin
        )
        self.assertEqual(storage.get_products()[0]["name"], "Test item")
        self.assertEqual(
            storage.get_user_by_email("admin@example.com")["id"], "admin-id"
        )

        updated = storage.update_product("test-item", {"name": "Updated"})
        self.assertEqual(updated["name"], "Updated")
        self.assertTrue(storage.delete_product("test-item"))
        self.assertFalse(storage.delete_product("test-item"))

    def test_orders_and_login_attempts_persist(self):
        order = {
            "id": "order-id",
            "code": "EW-1234",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "recebido",
            "items": [],
        }
        storage.insert_order(order)
        self.assertEqual(storage.get_order("EW-1234")["id"], "order-id")
        self.assertEqual(
            storage.update_order_status("EW-1234", "entregue")["status_override"],
            "entregue",
        )
        self.assertEqual(len(storage.get_orders()), 1)

        key = "login:admin@example.com"
        storage.record_login_failure(key, datetime.now(timezone.utc))
        storage.record_login_failure(key, datetime.now(timezone.utc))
        self.assertEqual(storage.get_login_attempt(key)["count"], 2)
        storage.clear_login_attempt(key)
        self.assertIsNone(storage.get_login_attempt(key))


if __name__ == "__main__":
    unittest.main()
