import sqlite3
import argparse
from tqdm import tqdm

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Merge two SQLite databases")
    parser.add_argument('--from-db', type=str, help='Path of the source db')
    parser.add_argument('--to-db', type=str, help='Path of the destination db')
    parser.add_argument('--table-name', type=str, help='Name of the table to merge')
    args = parser.parse_args()

    conn1 = sqlite3.connect(args.from_db)
    conn2 = sqlite3.connect(args.to_db)
    cur1 = conn1.cursor()
    cur2 = conn2.cursor()

    # Get column names
    cur1.execute(f"PRAGMA table_info({args.table_name})")
    columns_db1 = [column[1] for column in cur1.fetchall()]
    cur2.execute(f"PRAGMA table_info({args.table_name})")
    columns_db2 = [column[1] for column in cur2.fetchall()]

    # Find columns to merge
    common_columns = list(set(columns_db1) & set(columns_db2))
    db1_missing = list(set(columns_db2) - set(columns_db1))
    db2_missing = list(set(columns_db1) - set(columns_db2))
    if len(db1_missing) > 0:
        print(f"WARNING: Columns {db1_missing} are missing in from-db")
    if len(db2_missing) > 0:
        print(f"WARNING: Columns {db2_missing} are missing in to-db")
    print(f'Merging columns {common_columns}')

    # Create the SELECT and INSERT statements
    columns = ', '.join(common_columns)
    placeholders = ', '.join('?' * len(common_columns))
    select_stmt = f"SELECT {columns} FROM {args.table_name}"
    insert_stmt = f"INSERT OR IGNORE INTO {args.table_name} ({columns}) VALUES ({placeholders})"

    # Get data from from-db
    cur1.execute(select_stmt)
    rows = cur1.fetchall()

    # Insert data to to-db
    for row in tqdm(rows):
        cur2.execute(insert_stmt, row)

    conn1.close()
    conn2.commit()
    conn2.close()