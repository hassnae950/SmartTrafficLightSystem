class EquitableTrafficSystem:
    """
    Système intelligent de gestion des feux avec équité
    """
    
    def __init__(self):
        self.segments_history = {}
        
    def calculate_light_decision(self, segments_data):
        """
        Calcule quels feux doivent être verts/rouges
        Basé sur l'équité et l'urgence
        """
        decisions = {}
        
        # 1. Vérifier les urgences (piétons > 10)
        urgent_segments = []
        for seg_id, data in segments_data.items():
            if data.get('pedestrians', 0) > 10:
                urgent_segments.append(seg_id)
                decisions[seg_id] = {'light': 'red', 'duration': 30, 'reason': 'piétons'}
        
        # 2. Calculer score d'équité pour les autres segments
        fairness_scores = {}
        for seg_id, data in segments_data.items():
            if seg_id in urgent_segments:
                continue
                
            # Score basé sur:
            # - Temps d'attente (50%)
            # - Nombre de voitures (30%)
            # - Historique (20%)
            waiting_score = min(data.get('waiting_time', 0) * 2, 50)
            congestion_score = min(data.get('cars', 0), 30)
            history_score = 20 - min(self.segments_history.get(seg_id, 0), 20)
            
            fairness_scores[seg_id] = waiting_score + congestion_score + history_score
        
        # 3. Donner vert aux 2 segments avec meilleur score
        sorted_segments = sorted(fairness_scores.items(), key=lambda x: x[1], reverse=True)
        
        for seg_id, score in sorted_segments[:2]:  # Top 2
            decisions[seg_id] = {'light': 'green', 'duration': 45, 'reason': 'équité'}
            
            # Mettre à jour historique
            self.segments_history[seg_id] = self.segments_history.get(seg_id, 0) + 1
        
        # 4. Les autres sont rouge
        for seg_id in segments_data:
            if seg_id not in decisions:
                decisions[seg_id] = {'light': 'red', 'duration': 30, 'reason': 'rotation'}
                # Augmenter historique pour favoriser la prochaine fois
                if seg_id in self.segments_history:
                    self.segments_history[seg_id] = max(0, self.segments_history[seg_id] - 1)
        
        return decisions
    
    def get_fairness_report(self):
        """Génère un rapport d'équité"""
        total_cycles = sum(self.segments_history.values()) if self.segments_history else 1
        report = {}
        
        for seg_id, count in self.segments_history.items():
            percentage = (count / total_cycles) * 100
            report[seg_id] = {
                'green_cycles': count,
                'percentage': round(percentage, 1)
            }
        
        return report