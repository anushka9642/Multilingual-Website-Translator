import torch

# pyrefly: ignore [missing-import]
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
)

# pyrefly: ignore [missing-import]
from IndicTransToolkit import IndicProcessor


class IndicTranslator:

    def __init__(self):

        self.model_name = "ai4bharat/indictrans2-en-indic-1B"

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.tokenizer = None
        self.model = None
        self.processor = None

        print("=" * 60)
        print("IndicTranslator created")
        print("Model:", self.model_name)
        print("Device:", self.device)
        print("=" * 60)

    # ==================================================
    # LOAD MODEL
    # ==================================================

    def load_model(self):

        if self.model is not None:
            return

        print("=" * 60)
        print("Loading IndicTrans2...")
        print("=" * 60)

        # IndicTrans2 processor
        self.processor = IndicProcessor(
            inference=True
        )

        # Tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_name,
            trust_remote_code=True
        )

        # Model
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            self.model_name,
            trust_remote_code=True
        )

        self.model.to(self.device)

        self.model.eval()

        print("IndicTrans2 loaded successfully.")
        print("Device:", self.device)
        print("=" * 60)

    # ==================================================
    # SINGLE TRANSLATION
    # ==================================================

    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ):

        self.load_model()

        if not text or not text.strip():
            return ""

        text = text.strip()

        print(
            f"Translating: "
            f"{source_lang} -> {target_lang}"
        )

        # --------------------------------------------------
        # STEP 1
        # IndicTrans2 preprocessing
        # --------------------------------------------------

        batch = self.processor.preprocess_batch(
            [text],
            src_lang=source_lang,
            tgt_lang=target_lang,
            visualize=False
        )

        # --------------------------------------------------
        # STEP 2
        # Tokenization
        # --------------------------------------------------

        inputs = self.tokenizer(
            batch,
            padding="longest",
            truncation=True,
            max_length=256,
            return_tensors="pt"
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        # --------------------------------------------------
        # STEP 3
        # Model inference
        # --------------------------------------------------

        with torch.inference_mode():

            outputs = self.model.generate(
                **inputs,
                num_beams=1,
                num_return_sequences=1,
                max_length=256
            )

        # --------------------------------------------------
        # STEP 4
        # Decode
        # --------------------------------------------------

        decoded = self.tokenizer.batch_decode(
            outputs,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True
        )

        # --------------------------------------------------
        # STEP 5
        # IndicTrans2 postprocessing
        # --------------------------------------------------

        translated = self.processor.postprocess_batch(
            decoded,
            lang=target_lang
        )

        if translated:
            text_out = translated[0]
            iso_code = self.processor._flores_codes.get(target_lang, "hi")
            if iso_code and iso_code not in ["hi", "mr", "en", "ur"]:
                # pyrefly: ignore [missing-import]
                from indicnlp.transliterate.unicode_transliterate import UnicodeIndicTransliterator
                text_out = UnicodeIndicTransliterator.transliterate(text_out, "hi", iso_code)
            return text_out

        return ""

    # ==================================================
    # BATCH TRANSLATION
    # ==================================================

    def translate_batch(
        self,
        texts: list[str],
        source_lang: str,
        target_lang: str
    ):

        self.load_model()

        if not texts:
            return []

        # --------------------------------------------------
        # Clean input
        # --------------------------------------------------

        cleaned_texts = []

        for text in texts:

            if text is None:
                cleaned_texts.append("")

            else:
                cleaned_texts.append(
                    str(text).strip()
                )

        # --------------------------------------------------
        # Empty texts
        # --------------------------------------------------

        non_empty_texts = [
            text
            for text in cleaned_texts
            if text
        ]

        if not non_empty_texts:
            return [""] * len(cleaned_texts)

        print("=" * 60)
        print("BATCH TRANSLATION")
        print(
            f"Texts: {len(non_empty_texts)}"
        )
        print(
            f"{source_lang} -> {target_lang}"
        )
        print("=" * 60)

        # --------------------------------------------------
        # STEP 1
        # IndicTrans2 preprocessing
        # --------------------------------------------------

        batch = self.processor.preprocess_batch(
            non_empty_texts,
            src_lang=source_lang,
            tgt_lang=target_lang,
            visualize=False
        )

        # --------------------------------------------------
        # STEP 2
        # Tokenization
        # --------------------------------------------------

        inputs = self.tokenizer(
            batch,
            padding="longest",
            truncation=True,
            max_length=256,
            return_tensors="pt"
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        # --------------------------------------------------
        # STEP 3
        # Batch inference
        # --------------------------------------------------

        with torch.inference_mode():

            outputs = self.model.generate(
                **inputs,
                num_beams=1,
                num_return_sequences=1,
                max_length=256
            )

        # --------------------------------------------------
        # STEP 4
        # Decode
        # --------------------------------------------------

        decoded = self.tokenizer.batch_decode(
            outputs,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True
        )

        # --------------------------------------------------
        # STEP 5
        # IndicTrans2 postprocessing & Script Safety
        # --------------------------------------------------

        # pyrefly: ignore [missing-import]
        from indicnlp.transliterate.unicode_transliterate import UnicodeIndicTransliterator

        translated_raw = (
            self.processor.postprocess_batch(
                decoded,
                lang=target_lang
            )
        )

        iso_code = self.processor._flores_codes.get(target_lang, "hi")
        if iso_code and iso_code not in ["hi", "mr", "en", "ur"]:
            translated_non_empty = [
                UnicodeIndicTransliterator.transliterate(item, "hi", iso_code)
                for item in translated_raw
            ]
        else:
            translated_non_empty = translated_raw

        # --------------------------------------------------
        # STEP 6
        # Put empty strings back in their positions
        # --------------------------------------------------

        final_results = []

        translation_index = 0

        for original_text in cleaned_texts:

            if not original_text:

                final_results.append("")

            else:

                if translation_index < len(
                    translated_non_empty
                ):

                    final_results.append(
                        translated_non_empty[
                            translation_index
                        ]
                    )

                else:

                    final_results.append(
                        original_text
                    )

                translation_index += 1

        print(
            f"Batch completed: "
            f"{len(final_results)} translations"
        )

        return final_results