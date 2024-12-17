import sqlite3
import sys


def get_current_schema(cursor):
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    schema = {}
    for table in tables:
        table_name = table[0]
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        schema[table_name] = {col[1]: col[2] for col in columns}
    return schema


def get_desired_schema():
    return {
        "chats": {
            "id": "TEXT",
            "source": "TEXT",
            "format": "TEXT",
            "title": "TEXT",
            "description": "TEXT",
            "content": "TEXT",
            "addedTime": "DATETIME",
            "username": "TEXT",
            "viewCount": "INTEGER",
            "likeCount": "INTEGER",
        },
        "chatTags": {"tag": "TEXT", "chatId": "TEXT"},
        "tags": {"tag": "TEXT"},
    }


def generate_migration_sql(current_schema, desired_schema):
    sql_statements = []
    logs = []

    for table, columns in desired_schema.items():
        if table not in current_schema:
            columns_def = ", ".join(
                [f"{col} {dtype}" for col, dtype in columns.items()]
            )
            sql_statements.append(f"CREATE TABLE {table} ({columns_def});")
            logs.append(f"Table '{table}' is missing and will be created.")
        else:
            for col, dtype in columns.items():
                if col not in current_schema[table]:
                    sql_statements.append(
                        f"ALTER TABLE {table} ADD COLUMN {col} {dtype};"
                    )
                    logs.append(
                        f"Column '{col}' is missing in table '{table}' and will be added."
                    )

    return sql_statements, logs


def migrate_database(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    current_schema = get_current_schema(cursor)
    desired_schema = get_desired_schema()

    sql_statements, logs = generate_migration_sql(current_schema, desired_schema)

    for sql in sql_statements:
        cursor.execute(sql)

    conn.commit()
    conn.close()

    for log in logs:
        print(log)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python migrate.py <path_to_db>")
        sys.exit(1)

    db_path = sys.argv[1]
    migrate_database(db_path)
