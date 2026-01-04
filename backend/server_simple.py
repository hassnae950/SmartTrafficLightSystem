# server_simple.py
from flask import Flask, jsonify
from flask_cors import CORS
import random
from datetime import datetime
import time
import threading

app = Flask(__name__)
CORS(app)

# Données simulation
traffic_data = {
    'segments': {
        1: {'cars': 5, 'pedestrians': 2, 'waiting_time': 0, 'light': 'red', 'congestion': 'low'},
        2: {'cars': 12, 'pedestrians': 0, 'waiting_time': 15, 'light': 'green', 'congestion': 'medium'},
        3: {'cars': 8, 'pedestrians': 5, 'waiting_time': 25, 'light': 'red', 'congestion': 'low'},
        4: {'cars': 20, 'pedestrians': 0, 'waiting_time': 40, 'light': 'red', 'congestion': 'high'},
    },
    'emergency': False,
    'vip_mode': False,
    'timestamp': datetime.now().isoformat()
}

def simulate_traffic_changes():
    """Simule les changements de trafic en temps réel"""
    while True:
        time.sleep(3)  # Mise à jour chaque 3 secondes
        
        for seg_id in traffic_data['segments']:
            # Changement aléatoire du nombre de voitures
            change = random.randint(-2, 3)
            traffic_data['segments'][seg_id]['cars'] = max(0, 
                traffic_data['segments'][seg_id]['cars'] + change)
            
            # Calculer congestion
            cars = traffic_data['segments'][seg_id]['cars']
            if cars < 10:
                congestion = 'low'
            elif cars < 25:
                congestion = 'medium'
            else:
                congestion = 'high'
            traffic_data['segments'][seg_id]['congestion'] = congestion
            
            # Augmenter temps d'attente pour feux rouges
            if traffic_data['segments'][seg_id]['light'] == 'red':
                traffic_data['segments'][seg_id]['waiting_time'] += 3
        
        traffic_data['timestamp'] = datetime.now().isoformat()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Simulation mise à jour")

@app.route('/')
def home():
    return """
    <html>
        <body style="font-family: Arial; padding: 20px;">
            <h1>🚦 Système de Gestion de Trafic Intelligent</h1>
            <p>Backend fonctionnel! Endpoints disponibles:</p>
            <ul>
                <li><a href="/api/traffic">/api/traffic</a> - État du trafic</li>
                <li><a href="/api/scenario/match">/api/scenario/match</a> - Scénario Match</li>
                <li><a href="/api/scenario/pedestrians">/api/scenario/pedestrians</a> - Scénario Piétons</li>
                <li><a href="/api/scenario/vip">/api/scenario/vip</a> - Scénario VIP</li>
                <li><a href="/api/reset">/api/reset</a> - Réinitialiser</li>
            </ul>
        </body>
    </html>
    """

@app.route('/api/traffic', methods=['GET'])
def get_traffic():
    """API pour récupérer l'état du trafic"""
    return jsonify(traffic_data)

@app.route('/api/scenario/<scenario_name>', methods=['GET'])
def trigger_scenario(scenario_name):
    """Déclenche un scénario spécifique"""
    global traffic_data
    
    if scenario_name == 'match':
        traffic_data['segments'][4]['cars'] = 45
        traffic_data['segments'][4]['congestion'] = 'very-high'
        message = "⚽ Scénario Match: Pic de trafic vers le stade"
    
    elif scenario_name == 'pedestrians':
        traffic_data['segments'][3]['pedestrians'] = 15
        traffic_data['segments'][3]['light'] = 'red'
        message = "🚶‍♂️ Scénario Piétons: Passage piéton prioritaire"
    
    elif scenario_name == 'vip':
        traffic_data['vip_mode'] = True
        traffic_data['segments'][2]['light'] = 'green'
        traffic_data['segments'][2]['cars'] = 2
        message = "👑 Scénario VIP: Couloir vert activé"
    
    else:
        return jsonify({'status': 'error', 'message': 'Scénario inconnu'})
    
    traffic_data['timestamp'] = datetime.now().isoformat()
    return jsonify({'status': 'success', 'message': message, 'data': traffic_data})

@app.route('/api/reset', methods=['GET'])
def reset():
    """Réinitialise les données"""
    global traffic_data
    traffic_data = {
        'segments': {
            1: {'cars': 5, 'pedestrians': 2, 'waiting_time': 0, 'light': 'red', 'congestion': 'low'},
            2: {'cars': 12, 'pedestrians': 0, 'waiting_time': 15, 'light': 'green', 'congestion': 'medium'},
            3: {'cars': 8, 'pedestrians': 5, 'waiting_time': 25, 'light': 'red', 'congestion': 'low'},
            4: {'cars': 20, 'pedestrians': 0, 'waiting_time': 40, 'light': 'red', 'congestion': 'high'},
        },
        'emergency': False,
        'vip_mode': False,
        'timestamp': datetime.now().isoformat()
    }
    return jsonify({'status': 'reset', 'data': traffic_data})

if __name__ == '__main__':
    # Démarrer simulation en background
    simulation_thread = threading.Thread(target=simulate_traffic_changes, daemon=True)
    simulation_thread.start()
    
    print("=" * 60)
    print("🚦 SYSTÈME DE GESTION DE TRAFIC INTELLIGENT")
    print("=" * 60)
    print("Serveur démarré sur: http://localhost:5000")
    print("\nEndpoints API:")
    print("  GET /                    - Page d'accueil")
    print("  GET /api/traffic         - État du trafic (JSON)")
    print("  GET /api/scenario/match  - Scénario Match")
    print("  GET /api/scenario/pedestrians - Scénario Piétons")
    print("  GET /api/scenario/vip    - Scénario VIP")
    print("  GET /api/reset           - Réinitialiser")
    print("\nTestez dans votre navigateur:")
    print("  1. http://localhost:5000")
    print("  2. http://localhost:5000/api/traffic")
    print("=" * 60)
    
    app.run(debug=True, port=5000, use_reloader=False)