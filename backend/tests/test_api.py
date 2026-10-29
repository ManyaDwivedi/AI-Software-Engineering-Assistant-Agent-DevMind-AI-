import io
import tempfile
import unittest
import zipfile
from pathlib import Path

from fastapi.testclient import TestClient

from app import database
from app.main import app


class BackendApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory()
        database.DATABASE_PATH = Path(cls.temp_dir.name) / "test.sqlite3"
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)
        cls.temp_dir.cleanup()

    def setUp(self):
        self.email = f"user-{self._testMethodName}@example.test"
        response = self.client.post(
            "/auth/register",
            json={"name": "Test Developer", "email": self.email, "password": "long-test-password"},
        )
        self.assertEqual(response.status_code, 201, response.text)
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_auth_and_protected_routes(self):
        self.assertEqual(self.client.get("/projects").status_code, 401)
        me = self.client.get("/auth/me", headers=self.headers)
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["user"]["email"], self.email)
        login = self.client.post(
            "/auth/login",
            json={"email": self.email.upper(), "password": "long-test-password"},
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("token", login.json())
        self.assertEqual(
            self.client.post(
                "/auth/login",
                json={"email": self.email, "password": "incorrect-password"},
            ).status_code,
            401,
        )
        invalid_headers = {
            "Authorization": f"Bearer {self.token.rsplit('.', 1)[0]}.invalid"
        }
        self.assertEqual(self.client.get("/auth/me", headers=invalid_headers).status_code, 401)

    def test_tool_endpoints_return_frontend_shapes(self):
        analyze = self.client.post(
            "/ai/analyze",
            headers=self.headers,
            json={"code": "eval(input())", "language": "python"},
        )
        self.assertEqual(analyze.status_code, 200)
        self.assertIn("complexity", analyze.json())
        self.assertGreater(analyze.json()["issues"], 0)

        debug = self.client.post(
            "/ai/debug",
            headers=self.headers,
            json={"code": "fetch('/api')", "errorTrace": "missing bearer token"},
        )
        self.assertEqual(debug.status_code, 200)
        self.assertTrue({"problem", "rootCause", "fix", "explanation", "files"} <= debug.json().keys())

        review = self.client.post(
            "/ai/review",
            headers=self.headers,
            json={"code": "const password = 'hard-coded';", "language": "javascript"},
        )
        self.assertEqual(review.status_code, 200)
        self.assertTrue({"quality", "security", "performance", "maintainability"} <= review.json()["scores"].keys())
        self.assertTrue(review.json()["issues"])

        generated = self.client.post(
            "/ai/generate",
            headers=self.headers,
            json={"prompt": "write a validator", "language": "python", "framework": "none"},
        )
        self.assertEqual(generated.status_code, 200)
        self.assertTrue({"code", "language", "notes"} <= generated.json().keys())

        tests = self.client.post(
            "/ai/tests",
            headers=self.headers,
            json={"code": "def fn(): pass", "kinds": ["Unit Tests", "Edge Cases"]},
        )
        self.assertEqual(tests.status_code, 200)
        self.assertTrue({"unit", "integration", "edge"} <= tests.json().keys())

        explain = self.client.post(
            "/ai/explain",
            headers=self.headers,
            json={"code": "def greet(name):\n    return name", "language": "python"},
        )
        self.assertTrue({"overview", "howItWorks", "functions", "complexity", "issues", "improvements"} <= explain.json().keys())

        refactor = self.client.post(
            "/ai/refactor",
            headers=self.headers,
            json={"code": "const value = 1", "language": "javascript"},
        )
        self.assertTrue({"before", "after", "improvements", "explanation"} <= refactor.json().keys())

        docs = self.client.post(
            "/ai/docs",
            headers=self.headers,
            json={"code": "def greet(name):\n    return name", "language": "python"},
        )
        self.assertIn("documentation", docs.json())

    def test_upload_indexes_files_and_chat_returns_citations(self):
        archive_buffer = io.BytesIO()
        with zipfile.ZipFile(archive_buffer, "w") as archive:
            archive.writestr("src/auth.py", "def create_token(user):\n    return user\n")
            archive.writestr("src/routes.py", "from auth import create_token\n\ndef login(user):\n    return create_token(user)\n")
            archive.writestr("../outside.txt", "must not be indexed")
        archive_buffer.seek(0)

        response = self.client.post(
            "/projects/upload",
            headers=self.headers,
            data={"name": "Auth Project"},
            files=[
                ("file", ("project.zip", archive_buffer, "application/zip")),
                ("files", ("extra.py", b"def health(): return True", "text/x-python")),
            ],
        )
        self.assertEqual(response.status_code, 201, response.text)
        project = response.json()
        self.assertEqual(project["files"], 3)
        self.assertEqual(project["status"], "indexed")

        listing = self.client.get("/projects", headers=self.headers)
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.json()[0]["name"], "Auth Project")
        self.assertEqual(listing.json()[0]["stack"], ["Python"])

        graph = self.client.get(
            f"/projects/graph?project_id={project['id']}", headers=self.headers
        )
        self.assertEqual(graph.status_code, 200)
        self.assertEqual(len(graph.json()["nodes"]), 3)
        self.assertIn(["src/routes.py", "src/auth.py"], graph.json()["edges"])

        dna = self.client.get(
            f"/projects/dna?project_id={project['id']}", headers=self.headers
        )
        self.assertEqual(dna.status_code, 200)
        self.assertEqual(len(dna.json()["metrics"]), 6)

        chat = self.client.post(
            "/ai/chat",
            headers=self.headers,
            json={"message": "where is login token created?", "projectId": project["id"]},
        )
        self.assertEqual(chat.status_code, 200)
        self.assertIn("src/auth.py", chat.json()["sources"])
        self.assertIn("create_token", chat.json()["reply"])

        other_account = self.client.post(
            "/auth/register",
            json={
                "name": "Other Developer",
                "email": f"other-{self._testMethodName}@example.test",
                "password": "another-long-password",
            },
        ).json()
        other_headers = {"Authorization": f"Bearer {other_account['token']}"}
        other_chat = self.client.post(
            "/ai/chat",
            headers=other_headers,
            json={"message": "login", "projectId": project["id"]},
        )
        self.assertEqual(other_chat.status_code, 404)

        history = self.client.get("/history", headers=self.headers)
        self.assertEqual(history.status_code, 200)
        self.assertTrue(any(item["type"] == "Import" for item in history.json()))

    def test_workspace_routes_handle_missing_project_and_invalid_document_type(self):
        no_project_graph = self.client.get("/projects/graph", headers=self.headers)
        self.assertEqual(no_project_graph.status_code, 404)
        bad_docs = self.client.post(
            "/ai/docs",
            headers=self.headers,
            json={"code": "def run(): pass", "language": "python", "type": "unknown"},
        )
        self.assertEqual(bad_docs.status_code, 422)

    def test_duplicate_emails_and_short_passwords_are_rejected(self):
        duplicate = self.client.post(
            "/auth/register",
            json={"name": "Another Developer", "email": self.email, "password": "long-test-password"},
        )
        self.assertEqual(duplicate.status_code, 409)
        short_password = self.client.post(
            "/auth/register",
            json={"name": "Short Password", "email": "short@example.test", "password": "short"},
        )
        self.assertEqual(short_password.status_code, 422)


if __name__ == "__main__":
    unittest.main()
