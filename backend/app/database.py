import os

# pyrefly: ignore [missing-import]
import pyodbc
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv


load_dotenv()


def get_connection():

    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_NAME")

    if not server:
        raise ValueError("DB_SERVER is missing from .env")

    if not database:
        raise ValueError("DB_NAME is missing from .env")

    connection_string = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={server};"
        f"DATABASE={database};"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    return pyodbc.connect(connection_string)