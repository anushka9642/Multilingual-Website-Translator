import hashlib

try:
    from .database import get_connection
except ImportError:
    from database import get_connection


def generate_text_hash(text: str) -> str:
    """
    Generate a SHA-256 hash for the source text.

    The hash allows us to efficiently identify
    whether the same source text already exists
    in the translation cache.
    """

    return hashlib.sha256(
        text.encode("utf-8")
    ).hexdigest()


def get_cached_translation(
    source_text: str,
    source_language: str,
    target_language: str
):
    """
    Search SQL Server for an existing translation.
    If database is unavailable or fails, returns None safely.

    Bug 6 fix: cursor is now explicitly closed in a finally block
    to prevent cursor/handle leaks on SQL Server.
    """
    try:
        source_text_hash = generate_text_hash(source_text)
        connection = get_connection()
        cursor = connection.cursor()
        try:
            query = """
            SELECT TranslatedText
            FROM TranslationCache
            WHERE SourceTextHash = ?
              AND SourceLanguage = ?
              AND TargetLanguage = ?
            """
            cursor.execute(
                query,
                source_text_hash,
                source_language,
                target_language
            )
            row = cursor.fetchone()
            if row:
                return row[0]
            return None
        finally:
            # Bug 6 fix: always close cursor before closing connection
            cursor.close()
            connection.close()
    except Exception as e:
        print(f"Cache lookup bypassed (DB unavailable/error): {e}")
        return None


def save_translation(
    source_text: str,
    translated_text: str,
    source_language: str,
    target_language: str
):
    """
    Save a new translation into SQL Server cache.
    If database is unavailable or fails, logs error without throwing exception.

    Bug 6 fix: cursor is now explicitly closed in a finally block.
    """
    try:
        source_text_hash = generate_text_hash(source_text)
        connection = get_connection()
        cursor = connection.cursor()
        try:
            query = """
            INSERT INTO TranslationCache
            (
                SourceText,
                SourceTextHash,
                SourceLanguage,
                TargetLanguage,
                TranslatedText
            )
            VALUES (?, ?, ?, ?, ?)
            """
            cursor.execute(
                query,
                source_text,
                source_text_hash,
                source_language,
                target_language,
                translated_text
            )
            connection.commit()
        finally:
            # Bug 6 fix: always close cursor before closing connection
            cursor.close()
            connection.close()
    except Exception as e:
        print(f"Cache save bypassed (DB unavailable/error): {e}")