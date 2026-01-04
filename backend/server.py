from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import random
from datetime import datetime
import threading
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Données simulation
traffic_data = {
    'segments': {
        1: {'cars': 5, 'pedestrians': 2, 'waiting_time': 0, 'light': 'red'},
        2: {'cars': 12, 'pedestrians': 0, 'waiting_time': 15, 'light': 'green'},
        3: {'cars': 8, 'pedestrians': 5, 'waiting_time': 25, 'light': 'red'},
        4: {'cars': 20, 'pedestrians': 0, 'waiting_time': 40, 'light': 'red'},
    },
    'emergency': False,
    'vip_mode': False
}

def simulate_traffic_changes():
    """Simule les changements de trafic en temps réel"""
    while True:
        time.sleep(3)  # Mise à jour chaque 3 secondes
        
        for seg_id in traffic_data['segments']:
            # Changement aléatoire du nombre de voitures
            change = random.randint(-3, 5)
            traffic_data['segments'][seg_id]['cars'] = max(0, 
                traffic_data['segments'][seg_id]['cars'] + change)
            
            # Augmenter temps d'attente pour feux rouges
            if traffic_data['segments'][seg_id]['light'] == 'red':
                traffic_data['segments'][seg_id]['waiting_time'] += 3
        
        # Émettre mise à jour à tous les clients
        socketio.emit('traffic_update', traffic_data)

@app.route('/api/traffic', methods=['GET'])
def get_traffic():
    """API pour récupérer l'état du trafic"""
    return jsonify(traffic_data)

@app.route('/api/scenario/<scenario_name>', methods=['POST'])
def trigger_scenario(scenario_name):
    """Déclenche un scénario spécifique"""
    global traffic_data
    
    if scenario_name == 'match':
        # Pic de trafic vers le stade (segment 4)
        traffic_data['segments'][4]['cars'] = 45
        socketio.emit('notification', {'type': 'match', 'message': 'Pic de trafic match déclenché'})
    
    elif scenario_name == 'pedestrians':
        # Beaucoup de piétons au segment 3
        traffic_data['segments'][3]['pedestrians'] = 15
        traffic_data['segments'][3]['light'] = 'red'
        socketio.emit('notification', {'type': 'pedestrians', 'message': 'Piétons détectés'})
    
    elif scenario_name == 'vip':
        # Mode VIP activé
        traffic_data['vip_mode'] = True
        traffic_data['segments'][2]['light'] = 'green'  # Couloir vert
        socketio.emit('notification', {'type': 'vip', 'message': 'Mode VIP activé'})
    
    return jsonify({'status': 'success', 'scenario': scenario_name})

@socketio.on('connect')
def handle_connect():
    print('Client connecté')
    emit('connected', {'data': 'Connecté au serveur de trafic'})

if __name__ == '__main__':
    # Démarrer simulation en background
    thread = threading.Thread(target=simulate_traffic_changes, daemon=True)
    thread.start()
    
    print("Serveur démarré sur http://localhost:5000")
    socketio.run(app, debug=True, port=5000)