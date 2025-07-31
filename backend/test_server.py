import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os

from server import app

client = TestClient(app)

# Helper to mock os.path.exists

def always_exists(path):
    return True

def never_exists(path):
    return False

# Helper to mock extract_text_by_rules

def fake_extract_text_by_rules(pdf_path, *args, **kwargs):
    return "FAKE_PDF_TEXT"

# Helper to mock OpenAI response
class FakeOpenAIResponse:
    class Choice:
        def __init__(self, content):
            self.message = type('msg', (), {'content': content})
    def __init__(self, content):
        self.choices = [self.Choice(content)]

@pytest.mark.parametrize("subject,level,expected_status", [
    ("agriculture", "higher", 200),
    ("agriculture", "ordinary", 200),
    ("business", "higher", 200),
    ("business", "ordinary", 200),
])
def test_valid_cases(subject, level, expected_status):
    data = {"topic_name": "test topic", "subject": subject, "level": level}
    with patch("server.os.path.exists", always_exists), \
         patch("server.extract_text_by_rules", fake_extract_text_by_rules), \
         patch("server.client.chat.completions.create", return_value=FakeOpenAIResponse("Q1\nQ2\nQ3")):
        response = client.post("/api/ai/generate_questions", json=data)
        assert response.status_code == expected_status
        assert "questions" in response.json()
        assert "Q1" in response.json()["questions"]

@pytest.mark.parametrize("data,expected_status,exists_mock", [
    ({"topic_name": "test", "subject": "invalid", "level": "higher"}, 400, always_exists),
    ({"topic_name": "test", "subject": "agriculture", "level": "invalid"}, 404, never_exists),
    ({"topic_name": "test", "subject": "business", "level": "invalid"}, 404, never_exists),
    ({"subject": "agriculture", "level": "higher"}, 422, always_exists),  # missing topic_name
    ({"topic_name": "test", "level": "higher"}, 422, always_exists),      # missing subject
    ({"topic_name": "test", "subject": "agriculture"}, 422, always_exists), # missing level
])
def test_error_cases(data, expected_status, exists_mock):
    with patch("server.os.path.exists", exists_mock), \
         patch("server.extract_text_by_rules", fake_extract_text_by_rules), \
         patch("server.client.chat.completions.create", return_value=FakeOpenAIResponse("Q1\nQ2\nQ3")):
        response = client.post("/api/ai/generate_questions", json=data)
        assert response.status_code == expected_status

# Test missing PDF file (should return 404)
def test_missing_pdf_file():
    data = {"topic_name": "test", "subject": "agriculture", "level": "higher"}
    with patch("server.os.path.exists", never_exists):
        response = client.post("/api/ai/generate_questions", json=data)
        assert response.status_code == 404

# Test OpenAI error (should return 500)
def test_openai_error():
    data = {"topic_name": "test", "subject": "agriculture", "level": "higher"}
    with patch("server.os.path.exists", always_exists), \
         patch("server.extract_text_by_rules", fake_extract_text_by_rules), \
         patch("server.client.chat.completions.create", side_effect=Exception("OpenAI error")):
        response = client.post("/api/ai/generate_questions", json=data)
        assert response.status_code == 500
