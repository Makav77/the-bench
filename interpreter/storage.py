import json

def load_data(filepath):
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def save_data(filepath, data):
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
