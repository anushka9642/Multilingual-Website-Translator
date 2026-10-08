try:
    from .translator import IndicTranslator
    from .cache import (
        get_cached_translation,
        save_translation
    )
except ImportError:
    from translator import IndicTranslator
    from cache import (
        get_cached_translation,
        save_translation
    )


# ============================================================
# ONE SHARED TRANSLATOR
# ============================================================

translator = IndicTranslator()


# ============================================================
# BATCH TRANSLATION
# ============================================================

def translate_batch(
    texts: list[str],
    source_language: str,
    target_language: str
):

    if not texts:
        return []

    results = [None] * len(texts)

    miss_indices = []
    miss_texts = []

    # ========================================================
    # STEP 1 — CACHE CHECK
    # ========================================================

    for index, text in enumerate(texts):

        if text is None:
            text = ""
        else:
            text = str(text).strip()

        if not text:
            results[index] = ""
            continue

        # ----------------------------------------------------
        # Don't send pure numbers to the model
        # ----------------------------------------------------

        if text.replace(".", "").replace(",", "").isdigit():

            results[index] = text

            print(
                f"Skipping numeric text: {text!r}"
            )

            continue

        # ----------------------------------------------------
        # Cache
        # ----------------------------------------------------

        print(
            f"Checking cache "
            f"{index + 1}/{len(texts)}: {text!r}"
        )

        cached_translation = get_cached_translation(
            source_text=text,
            source_language=source_language,
            target_language=target_language
        )

        if cached_translation is not None:

            print("CACHE HIT")

            results[index] = cached_translation

        else:

            print("CACHE MISS")

            miss_indices.append(index)
            miss_texts.append(text)

    # ========================================================
    # STEP 2 — MODEL BATCH
    # ========================================================

    if miss_texts:

        print()
        print("=" * 60)
        print(
            f"Running IndicTrans2 batch "
            f"for {len(miss_texts)} texts"
        )
        print("=" * 60)

        try:

            translated_texts = translator.translate_batch(
                texts=miss_texts,
                source_lang=source_language,
                target_lang=target_language
            )

        except Exception as e:

            print(
                "Batch translation failed:",
                repr(e)
            )

            raise

        # ====================================================
        # STEP 3 — CHECK COUNT
        # ====================================================

        if len(translated_texts) != len(miss_texts):

            raise RuntimeError(
                "Translation count mismatch: "
                f"sent {len(miss_texts)}, "
                f"received {len(translated_texts)}"
            )

        # ====================================================
        # STEP 4 — RESTORE ORIGINAL ORDER
        # ====================================================

        for (
            original_index,
            translated_text,
            original_text
        ) in zip(
            miss_indices,
            translated_texts,
            miss_texts
        ):

            results[original_index] = translated_text

            # ------------------------------------------------
            # Save to SQL Server
            # ------------------------------------------------

            try:

                save_translation(
                    source_text=original_text,
                    translated_text=translated_text,
                    source_language=source_language,
                    target_language=target_language
                )

                print(
                    "Saved translation:",
                    original_text[:50]
                )

            except Exception as e:

                print(
                    "Cache save error:",
                    repr(e)
                )

    # ========================================================
    # STEP 5 — RETURN
    # ========================================================

    return results