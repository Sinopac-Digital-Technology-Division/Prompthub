import argparse
import sqlite3

def execute_sql(db_file, query_file):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    with open(query_file, 'r') as file:
        query = file.read()

    for q in query.split(';'):
        cursor.execute(q)

    conn.commit()
    conn.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Execute SQL query on SQLite database')

    parser.add_argument('--db', '-d', help='Path to the SQLite database file', required=True)
    parser.add_argument('--query', '-q', help='Path to the SQL query file', required=True)
    args = parser.parse_args()

    execute_sql(args.db, args.query)