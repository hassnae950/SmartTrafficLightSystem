# Testez votre backend
import requests
import json

# Tester l'API
response = requests.get('http://localhost:5000/api/traffic')
print("État du trafic:")
print(json.dumps(response.json(), indent=2))

# Tester un scénario
response = requests.post('http://localhost:5000/api/scenario/match')
print("\nScénario match déclenché")