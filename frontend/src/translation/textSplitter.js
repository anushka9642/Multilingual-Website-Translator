/**
 * Bug 10 fix: the previous regex /[^.!?।]+[.!?।]+["')\]]*|[^.!?।]+$/g
 * split on every period, breaking decimal numbers (24.7), version strings
 * (v1.0), abbreviations (e.g., ISO 27001.), and ellipsis runs (...)
 * into spurious sentence fragments before translation.
 *
 * The revised regex avoids splitting when a period is:
 *   - followed immediately by a digit        → decimal / ordinal (1.5, 3.14)
 *   - preceded AND followed by a single char → abbreviation (e.g., U.S.A)
 *   - part of a run of dots                  → ellipsis (...)
 *
 * It uses a two-pass approach: first tokenise with a "real sentence boundary"
 * pattern, then accumulate tokens into chunks bounded by maxCharacters.
 */

/**
 * Returns true if the period at `pos` in `str` is a real sentence boundary
 * (i.e., not a decimal separator, abbreviation dot, or part of an ellipsis).
 */
function isRealBoundary(str, pos) {
    const before = str[pos - 1] || "";
    const after  = str[pos + 1] || "";

    // Part of an ellipsis (.. or ...)
    if (before === "." || after === ".")  return false;

    // Decimal / version number: digit before OR after the dot
    if (/\d/.test(before) || /\d/.test(after)) return false;

    // Single-letter abbreviation: one alpha char before + alpha or dot after
    if (/[A-Za-z]/.test(before) && /[A-Za-z.]/.test(after)) return false;

    return true;
}


/**
 * Split text into sentence tokens, honouring real sentence boundaries only.
 * Supports ., !, ?, and the Devanagari danda (।).
 */
function tokeniseSentences(text) {
    const tokens = [];
    let start = 0;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        const isPunctuation =
            ch === "!" ||
            ch === "?" ||
            ch === "।" ||
            (ch === "." && isRealBoundary(text, i));

        if (isPunctuation) {
            // Consume optional closing quotes / brackets after the punctuation
            let end = i + 1;
            while (end < text.length && /["')\]]/.test(text[end])) {
                end++;
            }
            const token = text.slice(start, end).trim();
            if (token) tokens.push(token);
            start = end;
            i = end - 1; // outer loop will increment
        }
    }

    // Trailing fragment that had no terminal punctuation
    const tail = text.slice(start).trim();
    if (tail) tokens.push(tail);

    return tokens;
}


export function splitIntoChunks(
    text,
    maxCharacters = 450
) {
    if (!text || text.length <= maxCharacters) {
        return [text];
    }

    const sentences = tokeniseSentences(text);
    const chunks = [];
    let current = "";

    for (const sentence of sentences) {

        const cleanSentence = sentence.trim();
        if (!cleanSentence) continue;

        // If one sentence is itself too long, split by words
        if (cleanSentence.length > maxCharacters) {

            // Flush whatever we had accumulated first
            if (current) {
                chunks.push(current);
                current = "";
            }

            const words = cleanSentence.split(/\s+/);
            let wordChunk = "";

            for (const word of words) {

                const candidate = wordChunk
                    ? `${wordChunk} ${word}`
                    : word;

                if (candidate.length > maxCharacters && wordChunk) {
                    chunks.push(wordChunk);
                    wordChunk = word;
                } else {
                    wordChunk = candidate;
                }
            }

            if (wordChunk) {
                chunks.push(wordChunk);
            }

            continue;
        }

        const candidate = current
            ? `${current} ${cleanSentence}`
            : cleanSentence;

        if (candidate.length > maxCharacters && current) {
            chunks.push(current);
            current = cleanSentence;
        } else {
            current = candidate;
        }
    }

    if (current) {
        chunks.push(current);
    }

    return chunks;
}