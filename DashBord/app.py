# app.py (Streamlit)
import streamlit as st
import pandas as pd

st.title("🚦 Flux de Circulation Intelligent")
st.sidebar.header("Contrôles")

# Charger données du dataset
@st.cache_data
def load_dataset():
    df = pd.read_csv('kaggle_dataset/annotations.csv')
    return df

# Afficher carte
col1, col2 = st.columns(2)
with col1:
    st.subheader("Carte du trafic")
    # Afficher frame vidéo + overlay détection
    
with col2:
    st.subheader("Statistiques")
    st.metric("Voitures détectées", "156")
    st.metric("Taux de détection", "92%")