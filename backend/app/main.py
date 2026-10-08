# import os
# import secrets

# from fastapi import FastAPI, HTTPException, Security, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.security import APIKeyHeader
# from pydantic import BaseModel

# try:
#     from .models import (
#         TranslationRequest,
#         TranslationResponse
#     )
#     # Bug 3 fix: import the shared translator from batch_translation
#     # so only ONE model instance is ever loaded.
#     from .batch_translation import translator, translate_batch
#     from .cache import (
#         get_cached_translation,
#         save_translation
#     )
# except ImportError:
#     from models import (
#         TranslationRequest,
#         TranslationResponse
#     )
#     from batch_translation import translator, translate_batch
#     from cache import (
#         get_cached_translation,
#         save_translation
#     )


# # ==================================================
# # API Key Verification
# # ==================================================

# API_KEY_NAME = "X-API-Key"
# api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


# def verify_api_key(api_key: str = Security(api_key_header)):
#     """
#     Bug 1 fix:
#     - If API_KEY env var is absent the endpoint is unprotected, which
#       was the original bypass.  We now hard-fail (500) when the
#       variable is missing so misconfigured deployments fail loudly.
#     - We use secrets.compare_digest to prevent timing-oracle attacks.
#     """
#     expected_api_key = os.getenv("API_KEY")

#     if not expected_api_key:
#         raise HTTPException(
#             status_code=500,
#             detail=(
#                 "Server misconfiguration: API_KEY environment "
#                 "variable is not set. Contact the administrator."
#             )
#         )

#     # Normalise both values to bytes for compare_digest
#     provided = api_key or ""
#     if not secrets.compare_digest(
#         provided.encode("utf-8"),
#         expected_api_key.encode("utf-8")
#     ):
#         raise HTTPException(
#             status_code=403,
#             detail="Invalid or missing API Key. Please pass X-API-Key header."
#         )

#     return api_key


# # ==================================================
# # Batch request model
# # ==================================================

# class BatchTranslationRequest(BaseModel):

#     texts: list[str]

#     source_lang: str

#     target_lang: str


# # ==================================================
# # FastAPI application
# # ==================================================

# app = FastAPI(
#     title="CVL Website Translation API",
#     version="1.0.0"
# )


# # ==================================================
# # Serve Static Files (Widget script)
# # ==================================================

# static_dir = os.path.join(os.path.dirname(__file__), "static")
# if os.path.exists(static_dir):
#     app.mount("/static", StaticFiles(directory=static_dir), name="static")


# # ==================================================
# # CORS
# # Bug 2 fix: allow_origins=["*"] + allow_credentials=True
# # violates the W3C CORS spec and is blocked by browsers.
# # Use explicit allowed origins and disable credentials.
# # ==================================================

# ALLOWED_ORIGINS = os.getenv(
#     "ALLOWED_ORIGINS",
#     "http://localhost:5173,http://127.0.0.1:5173"
# ).split(",")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=ALLOWED_ORIGINS,
#     allow_credentials=False,
#     allow_methods=["GET", "POST", "OPTIONS"],
#     allow_headers=["Content-Type", "X-API-Key"],
# )


# # ==================================================
# # Home
# # ==================================================

# @app.get("/")
# def home():

#     return {
#         "message": "CVL Translation API is running"
#     }


# # ==================================================
# # Health
# # ==================================================

# @app.get("/health")
# def health():

#     return {
#         "status": "healthy"
#     }


# # ==================================================
# # Single Translation
# # ==================================================

# @app.post(
#     "/translate",
#     response_model=TranslationResponse,
#     dependencies=[Depends(verify_api_key)]
# )
# def translate(
#     request: TranslationRequest
# ):

#     # ----------------------------------------------
#     # Check cache
#     # ----------------------------------------------

#     cached_translation = get_cached_translation(
#         source_text=request.text,
#         source_language=request.source_lang,
#         target_language=request.target_lang
#     )

#     if cached_translation is not None:

#         print("CACHE HIT")

#         return TranslationResponse(
#             source_text=request.text,
#             translated_text=cached_translation,
#             source_lang=request.source_lang,
#             target_lang=request.target_lang,
#             from_cache=True
#         )

#     # ----------------------------------------------
#     # Cache miss
#     # ----------------------------------------------

#     print("CACHE MISS")

#     print(
#         "Sending text to IndicTrans2..."
#     )

#     try:

#         translated_text = translator.translate(
#             text=request.text,
#             source_lang=request.source_lang,
#             target_lang=request.target_lang
#         )

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=f"Translation failed: {str(e)}"
#         )

#     # ----------------------------------------------
#     # Save
#     # ----------------------------------------------

#     save_translation(
#         source_text=request.text,
#         translated_text=translated_text,
#         source_language=request.source_lang,
#         target_language=request.target_lang
#     )

#     print(
#         "Translation saved to SQL Server."
#     )

#     # ----------------------------------------------
#     # Return
#     # ----------------------------------------------

#     return TranslationResponse(
#         source_text=request.text,
#         translated_text=translated_text,
#         source_lang=request.source_lang,
#         target_lang=request.target_lang,
#         from_cache=False
#     )


# # ==================================================
# # Batch Translation
# # ==================================================

# @app.post(
#     "/translate-batch",
#     dependencies=[Depends(verify_api_key)]
# )
# def translate_batch_endpoint(
#     request: BatchTranslationRequest
# ):

#     print("=" * 60)

#     print(
#         f"BATCH REQUEST RECEIVED"
#     )

#     print(
#         f"Number of texts: {len(request.texts)}"
#     )

#     print(
#         f"Source: {request.source_lang}"
#     )

#     print(
#         f"Target: {request.target_lang}"
#     )

#     print("=" * 60)

#     # ----------------------------------------------
#     # Validate
#     # ----------------------------------------------

#     if not request.texts:

#         raise HTTPException(
#             status_code=400,
#             detail="No texts were provided."
#         )

#     # ----------------------------------------------
#     # Translate
#     # ----------------------------------------------

#     try:

#         results = translate_batch(
#             texts=request.texts,
#             source_language=request.source_lang,
#             target_language=request.target_lang
#         )

#     except Exception as e:

#         print(
#             "BATCH TRANSLATION ERROR:",
#             str(e)
#         )

#         raise HTTPException(
#             status_code=500,
#             detail=f"Batch translation failed: {str(e)}"
#         )

#     # ----------------------------------------------
#     # Return
#     # ----------------------------------------------

#     return {
#         "source_lang": request.source_lang,
#         "target_lang": request.target_lang,
#         "count": len(results),
#         "translations": results
#     }

import os
import secrets

from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    HTTPException,
    Security,
    Depends
)

# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import APIKeyHeader
from pydantic import BaseModel


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

# Load .env from project root:
# C:\new_cvl_translator\.env

PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

ENV_FILE = os.path.join(PROJECT_ROOT, ".env")

load_dotenv(ENV_FILE)

print("=" * 60)
print("Environment loaded")
print("ENV FILE:", ENV_FILE)
print("API_KEY loaded:", bool(os.getenv("API_KEY")))
print("=" * 60)


# ============================================================
# IMPORT APPLICATION MODULES
# ============================================================

try:

    from .models import (
        TranslationRequest,
        TranslationResponse
    )

    from .batch_translation import (
        translator,
        translate_batch
    )

    from .cache import (
        get_cached_translation,
        save_translation
    )

except ImportError:

    from models import (
        TranslationRequest,
        TranslationResponse
    )

    from batch_translation import (
        translator,
        translate_batch
    )

    from cache import (
        get_cached_translation,
        save_translation
    )


# ============================================================
# API KEY
# ============================================================

API_KEY_NAME = "X-API-Key"

api_key_header = APIKeyHeader(
    name=API_KEY_NAME,
    auto_error=False
)


def verify_api_key(
    api_key: str = Security(api_key_header)
):

    expected_api_key = os.getenv("API_KEY")

    # --------------------------------------------------------
    # Server configuration check
    # --------------------------------------------------------

    if not expected_api_key:

        raise HTTPException(
            status_code=500,
            detail=(
                "Server misconfiguration: "
                "API_KEY environment variable is not set."
            )
        )

    # --------------------------------------------------------
    # Compare keys safely
    # --------------------------------------------------------

    provided = api_key or ""

    if not secrets.compare_digest(
        provided.encode("utf-8"),
        expected_api_key.encode("utf-8")
    ):

        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API Key."
        )

    return api_key


# ============================================================
# BATCH REQUEST MODEL
# ============================================================

class BatchTranslationRequest(BaseModel):

    texts: list[str]

    source_lang: str

    target_lang: str


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Multilingual Website Translation API",
    version="1.0.0"
)


# ============================================================
# STATIC FILES
# ============================================================

static_dir = os.path.join(
    os.path.dirname(__file__),
    "static"
)

if os.path.exists(static_dir):

    app.mount(
        "/static",
        StaticFiles(directory=static_dir),
        name="static"
    )


# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in ALLOWED_ORIGINS_RAW.split(",")
    if origin.strip()
]

if "*" in ALLOWED_ORIGINS or not ALLOWED_ORIGINS:
    cors_origins = ["*"]
else:
    cors_origins = ALLOWED_ORIGINS


app.add_middleware(
    CORSMiddleware,

    allow_origins=cors_origins,

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Multilingual Website Translation API is running"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# SINGLE TRANSLATION
# ============================================================

@app.post(
    "/translate",
    response_model=TranslationResponse,
    dependencies=[
        Depends(verify_api_key)
    ]
)
def translate(
    request: TranslationRequest
):

    print()
    print("=" * 60)
    print("SINGLE TRANSLATION REQUEST")
    print("Source:", request.source_lang)
    print("Target:", request.target_lang)
    print("Text:", request.text)
    print("=" * 60)

    # --------------------------------------------------------
    # CACHE
    # --------------------------------------------------------

    cached_translation = get_cached_translation(
        source_text=request.text,
        source_language=request.source_lang,
        target_language=request.target_lang
    )

    if cached_translation is not None:

        print("CACHE HIT")

        return TranslationResponse(
            source_text=request.text,
            translated_text=cached_translation,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
            from_cache=True
        )

    # --------------------------------------------------------
    # CACHE MISS
    # --------------------------------------------------------

    print("CACHE MISS")
    print("Sending text to IndicTrans2...")

    try:

        translated_text = translator.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )

    except Exception as e:

        print(
            "TRANSLATION ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    try:

        save_translation(
            source_text=request.text,
            translated_text=translated_text,
            source_language=request.source_lang,
            target_language=request.target_lang
        )

        print("Translation saved to SQL Server.")

    except Exception as e:

        print(
            "CACHE SAVE ERROR:",
            repr(e)
        )

        # Translation itself succeeded.
        # We don't want database failure to destroy
        # the translation response.

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return TranslationResponse(
        source_text=request.text,
        translated_text=translated_text,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
        from_cache=False
    )


# ============================================================
# BATCH TRANSLATION
# ============================================================

@app.post(
    "/translate-batch",
    dependencies=[
        Depends(verify_api_key)
    ]
)
def translate_batch_endpoint(
    request: BatchTranslationRequest
):

    print()
    print("=" * 60)
    print("BATCH TRANSLATION REQUEST")
    print("=" * 60)

    print(
        "Number of texts:",
        len(request.texts)
    )

    print(
        "Source:",
        request.source_lang
    )

    print(
        "Target:",
        request.target_lang
    )

    print("=" * 60)

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not request.texts:

        raise HTTPException(
            status_code=400,
            detail="No texts were provided."
        )

    # Remove empty strings

    cleaned_texts = [
        text.strip()
        for text in request.texts
        if text and text.strip()
    ]

    if not cleaned_texts:

        raise HTTPException(
            status_code=400,
            detail="All provided texts are empty."
        )

    print(
        "Valid texts:",
        len(cleaned_texts)
    )

    # --------------------------------------------------------
    # TRANSLATION
    # --------------------------------------------------------

    try:

        results = translate_batch(
            texts=cleaned_texts,
            source_language=request.source_lang,
            target_language=request.target_lang
        )

    except Exception as e:

        print()
        print("=" * 60)
        print("BATCH TRANSLATION ERROR")
        print(repr(e))
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=f"Batch translation failed: {str(e)}"
        )

    # --------------------------------------------------------
    # CHECK RESULT COUNT
    # --------------------------------------------------------

    if len(results) != len(cleaned_texts):

        print(
            "WARNING: Translation count mismatch"
        )

        print(
            "Input:",
            len(cleaned_texts)
        )

        print(
            "Output:",
            len(results)
        )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    print(
        "Batch translation completed."
    )

    print(
        "Returned:",
        len(results),
        "translations"
    )

    return {
        "source_lang": request.source_lang,
        "target_lang": request.target_lang,
        "count": len(results),
        "translations": results
    }