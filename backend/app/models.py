from pydantic import BaseModel


class TranslationRequest(BaseModel):

    text: str
    source_lang: str
    target_lang: str


class TranslationResponse(BaseModel):

    source_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    from_cache: bool