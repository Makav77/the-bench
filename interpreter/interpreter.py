from parser import parse_query
from storage import load_data, save_data

DATA_FILE = 'data.json'

def main():
    data = load_data(DATA_FILE)
    while True:
        try:
            query = input("sql> ").strip()
            if query.lower() in ('exit', 'quit'):
                break
            result, modified = parse_query(query, data)
            if modified:
                save_data(DATA_FILE, data)
            if result is not None:
                print(result)
        except Exception as e:
            print("Error:", e)

if __name__ == '__main__':
    main()
