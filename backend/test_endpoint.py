import requests
import json

def test_endpoint():
    url = "http://127.0.0.1:8000/api/ai/generate_questions"
    data = {
        "topic_name": "test",
        "subject": "agriculture", 
        "level": "higher"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("Connection failed - server might not be running")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoint() 