# test.py
try:
    import flask
    import numpy
    import pandas
    print("✅ Tous les packages sont installés !")
    print(f"Flask version: {flask.__version__}")
    print(f"NumPy version: {numpy.__version__}")
    print(f"Pandas version: {pandas.__version__}")
except Exception as e:
    print(f"❌ Erreur: {e}")