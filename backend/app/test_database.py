try:
    from .database import get_connection
except ImportError:
    from database import get_connection


def test_database():

    try:
        connection = get_connection()

        print("=" * 50)
        print("SQL SERVER CONNECTION SUCCESSFUL")
        print("=" * 50)

        cursor = connection.cursor()

        cursor.execute("SELECT DB_NAME()")

        result = cursor.fetchone()

        print("Connected Database:", result[0])

        cursor.close()
        connection.close()

        print("=" * 50)
        print("Database test completed successfully")
        print("=" * 50)

    except Exception as e:

        print("=" * 50)
        print("DATABASE CONNECTION FAILED")
        print("=" * 50)

        print(e)


if __name__ == "__main__":
    test_database()