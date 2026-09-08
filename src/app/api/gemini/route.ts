import { NextResponse } from "next/server";

/**
 * Gemini model configuration
 *
 * DEFAULT_MODEL and FALLBACK_MODELS are the single source of truth.
 */
const DEFAULT_MODEL = "gemini-3.6-flash";

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

const HUM_AID_CATEGORIES = [
  "caution and advice",
  "displaced people and evacuations",
  "infrastructure and utility damage",
  "injured or dead people",
  "missing or found people",
  "not humanitarian",
  "other relevant information",
  "requests or urgent needs",
  "rescue/volunteering or donation effort",
  "sympathy and support",
] as const;

const TOKENIZER_MODELS = [
  "BERT",
  "DistilBERT",
  "RoBERTa",
  "BERTweet",
  "IndicBERT",
  "MuRIL",
  "XLM-R",
] as const;

type HumAidCategory =
  (typeof HUM_AID_CATEGORIES)[number];

type Token = {
  text: string;
  isUnk: boolean;
};

type TokenizerResult = {
  model: string;
  fertility: number;
  unkPct: number;
  tokens: Token[];
};

/**
 * Return all Gemini models supported by this route.
 */
function getSupportedModels(): Set<string> {
  return new Set([
    DEFAULT_MODEL,
    ...FALLBACK_MODELS,
  ]);
}

/**
 * Normalize the requested Gemini model.
 */
function normalizeModelName(
  input?: string
): string {
  const raw =
    (input ?? DEFAULT_MODEL).trim();

  const model = raw
    .replace(/^models\//i, "")
    .trim();

  if (getSupportedModels().has(model)) {
    return model;
  }

  return DEFAULT_MODEL;
}

/**
 * =========================
 * HUM-AID CLASSIFICATION
 * =========================
 */

function buildClassifyPrompt(
  tweet: string
): string {
  const numbered =
    HUM_AID_CATEGORIES.map(
      (category, index) =>
        `${index + 1}. ${category}`
    ).join("\n");

  return [
    "You are a disaster-response social-media classifier following the HumAID taxonomy.",
    "",
    "TASK:",
    "Classify the tweet into EXACTLY ONE category from the list below.",
    "",
    numbered,
    "",
    "CLASSIFICATION RULES:",
    "- Classify based on the meaning and context of the tweet.",
    "- Do not classify based only on individual keywords.",
    "- The tweet may be written in any language.",
    "- Do not invent information that is not present.",
    "- Select exactly one category.",
    "- The category must match one of the ten category names EXACTLY.",
    "",
    "CATEGORY GUIDANCE:",
    '- "caution and advice": warnings, safety instructions, prevention advice, or guidance.',
    '- "displaced people and evacuations": evacuation information or people forced to leave their homes.',
    '- "infrastructure and utility damage": damage to roads, bridges, buildings, electricity, water, telecommunications, transport, or other infrastructure.',
    '- "injured or dead people": reports of injuries, deaths, casualties, or fatalities.',
    '- "missing or found people": reports about missing people or people who have been located or found.',
    '- "not humanitarian": content unrelated to disaster or humanitarian response.',
    '- "other relevant information": disaster-related information that does not fit the other categories.',
    '- "requests or urgent needs": requests for food, water, medicine, shelter, rescue, supplies, or other urgent assistance.',
    '- "rescue/volunteering or donation effort": rescue operations, volunteers, fundraising, donations, or organized relief efforts.',
    '- "sympathy and support": condolences, prayers, solidarity, emotional support, or expressions of sympathy.',
    "",
    "TWEET:",
    JSON.stringify(tweet),
    "",
    "Return ONLY valid JSON.",
    "Do not return markdown.",
    "Do not return any text before or after the JSON.",
    "",
    "Required format:",
    '{"category":"<exact category>","reason":"<one concise sentence under 25 words>"}',
  ].join("\n");
}

/**
 * =========================
 * TOKENIZER SIMULATION
 * =========================
 *
 * This intentionally simulates visible differences
 * between tokenizer families.
 *
 * It is NOT exact Hugging Face tokenizer execution.
 *
 * Gemini generates believable token boundaries.
 * TypeScript calculates fertility and unkPct locally.
 */
function buildTokenizerPrompt(
  text: string,
  language: string
): string {
  return `
You are simulating pretrained NLP tokenizer behavior for an educational tokenizer visualizer.

IMPORTANT:
This is a realistic BEHAVIOR SIMULATION.
It is NOT exact execution of the original tokenizer implementations.

The goal is to make the seven tokenizers visibly different while keeping
the output believable to someone familiar with NLP tokenization.

INPUT TEXT:
${JSON.stringify(text)}

DETECTED LANGUAGE:
${JSON.stringify(language)}

==================================================
CORE SIMULATION RULE
==================================================

The seven tokenizers should NOT produce identical output.

The simulation should demonstrate that tokenizer vocabulary,
tokenizer architecture, and language coverage can affect:

- token count
- subword fragmentation
- unknown tokens
- word boundaries
- tokenizer notation

For non-English text such as Hindi, it is ACCEPTABLE for
English-centric models to perform poorly.

This is an educational simulation, so some variation and
imperfection is intentional.

However, the output must still look like tokenizer output,
not random garbage.

==================================================
INPUT LANGUAGE
==================================================

The input may contain:

- English
- Hindi
- Hinglish
- other Indian languages
- multilingual text
- Devanagari
- Latin script
- emojis
- hashtags
- mentions
- URLs
- numbers
- punctuation
- mixed scripts

NEVER reject the input because of its language.

NEVER say that tokenization is unavailable.

NEVER translate the input.

NEVER transliterate the input.

Preserve the original language.

Hindi must remain recognizable as Hindi.

==================================================
UNICODE
==================================================

Do NOT intentionally corrupt Unicode.

For example:

"मेरी मदद कीजिए"

must remain recognizable as:

मेरी
मदद
कीजिए

It is acceptable to fragment these words for
BERT, DistilBERT, BERTweet or RoBERTa.

But NEVER create mojibake such as:

à¤®à¥‡à¤°
à¤®à¤¦à¤¦
à¥€

Mojibake is encoding corruption, NOT tokenization.

==================================================
GENERAL TOKENIZATION
==================================================

Think like a tokenizer.

Preserve the original character content and order
as closely as possible.

Whitespace normally indicates word boundaries,
although whitespace itself does not necessarily
become a token.

Punctuation may become separate tokens.

Emojis may be individual tokens or small groups.

Hashtags and mentions may be split.

URLs may be split.

Numbers may remain whole or be split.

Common words may remain whole.

Rare, long, compound, inflected, or unusual words
may be split.

The models should NOT all split words in the same way.

==================================================
CONTROLLED FRAGMENTATION
==================================================

For English-centric models processing non-English text,
you MAY simulate weaker vocabulary coverage.

This means Hindi words can sometimes be fragmented
more aggressively than they would be by Indian-language
or multilingual models.

For example, these are acceptable SIMULATED outputs:

मेरी
→ मे##री

मदद
→ मद##द

कीजिए
→ की##जि##ए

Another possible simulation:

मे##री
मद##द
की##जि##ए

Occasional [UNK] is also allowed.

However:

DO NOT split every character of every word.

DO NOT turn the entire sentence into nonsense.

The fragmentation should look like imperfect subword
tokenization rather than completely random characters.

==================================================
UNKNOWN TOKEN [UNK]
==================================================

This is an educational simulation.

Therefore [UNK] is allowed even when the real tokenizer
might handle the text differently.

For English-centric models processing Hindi or other
non-English text:

- BERT MAY occasionally use [UNK]
- DistilBERT MAY occasionally use [UNK]
- BERTweet MAY occasionally use [UNK]

The [UNK] placement can vary between requests.

Do NOT force [UNK] into every Hindi sentence.

Do NOT make every token [UNK].

A sentence can legitimately have 0% [UNK].

Another sentence may have a small number of [UNK] tokens.

Indian-language and multilingual models should generally
use [UNK] less frequently for normal Hindi:

- IndicBERT: usually low
- MuRIL: usually low
- XLM-R: usually low

RoBERTa should generally avoid [UNK] because its
byte-level BPE representation can represent arbitrary
Unicode, but it may still fragment Hindi aggressively.

If [UNK] is used:

{
  "text": "[UNK]",
  "isUnk": true
}

All normal tokens must have:

"isUnk": false

==================================================
BERT
==================================================

Simulate a traditional BERT-style WordPiece tokenizer.

BERT is an English-centric WordPiece-style tokenizer
for the purpose of this simulation.

For English:

Common words may remain whole.

Rare or morphologically complex words may split.

Example:

playing

can become:

play
##ing

For Hindi and other non-English text:

SIMULATE weaker vocabulary coverage.

Hindi words may be fragmented more aggressively.

Examples:

मेरी
→ मे##री

मदद
→ मद##द

कीजिए
→ की##जि##ए

Longer Hindi words can have more subword pieces.

Occasional [UNK] is allowed.

Do NOT make every Hindi character a separate token.

The result should still look like WordPiece.

==================================================
DISTILBERT
==================================================

Simulate WordPiece behavior similar to BERT.

For English:

- common words may remain whole
- rare words may split
- ## indicates continuation pieces

For Hindi:

It is acceptable to simulate weaker coverage than
IndicBERT, MuRIL and XLM-R.

Hindi words MAY be aggressively fragmented.

Examples:

मेरी
→ मे##री

मदद
→ मद##द

कीजिए
→ की##जि##ए

Occasional [UNK] is allowed.

DistilBERT can produce results similar to BERT,
but it does not need to be identical.

==================================================
ROBERTA
==================================================

Simulate RoBERTa-style byte-level BPE.

Use:

Ġ

to indicate a word boundary where appropriate.

Example:

ĠThis
Ġis
Ġa
Ġtest

For Hindi:

Ġमेरी
Ġमदद
Ġकीजिए

are valid-looking examples.

Because this is byte-level BPE simulation,
RoBERTa should NOT need many [UNK] tokens.

However, Hindi can still be fragmented into smaller
BPE-like pieces.

For example:

Ġमेरी
may become something like:

Ġमे
री

or another plausible BPE segmentation.

Do NOT produce mojibake.

NEVER produce:

à¤®à¥‡à¤°

The Unicode must remain readable.

==================================================
BERTWEET
==================================================

Simulate a RoBERTa-derived byte-level BPE tokenizer
adapted for Twitter/social-media text.

Pay attention to:

- hashtags
- mentions
- URLs
- emojis
- punctuation
- informal spellings
- repeated characters
- social-media conventions

English social-media text may remain fairly efficient.

For Hindi:

It is acceptable to simulate weaker coverage and
more aggressive fragmentation.

For example:

मेरी
→ मे##री

मदद
→ मद##द

Occasional [UNK] is allowed for the simulation.

However, do not turn the entire Hindi sentence into [UNK].

Hashtags may be split into meaningful pieces.

Example:

#MumbaiFloods

could become:

#
Mumbai
##Floods

or another plausible social-media segmentation.

==================================================
INDICBERT
==================================================

Simulate an Indian-language SentencePiece-style tokenizer.

IndicBERT should have STRONG coverage of Hindi.

Hindi should generally remain readable.

Use:

▁

to represent word starts where appropriate.

Example:

▁मेरी
▁मदद
▁कीजिए
,
▁यहाँ

Most common Hindi words may remain whole.

Complex or rare words may split.

[UNK] should generally be uncommon.

IndicBERT should usually produce cleaner Hindi
tokenization than BERT, DistilBERT and BERTweet.

==================================================
MURIL
==================================================

Simulate multilingual Indian-language subword tokenization.

MuRIL should have STRONG coverage of Hindi and
other Indian languages.

Normal Hindi words should generally remain readable.

Some complex words may split.

Possible output:

मेरी
मदद
कीजिए
,
यहाँ

or reasonable subword variants.

Do NOT concatenate unrelated words.

Do NOT randomly destroy word boundaries.

[UNK] should generally be uncommon for ordinary Hindi.

MuRIL should usually perform better on Hindi than
the English-centric BERT simulation.

==================================================
XLM-R
==================================================

Simulate multilingual SentencePiece-style tokenization.

XLM-R has broad multilingual coverage.

Use:

▁

for word starts where appropriate.

Example:

▁मेरी
▁मदद
▁कीजिए
,
▁यहाँ

Hindi should generally remain readable.

Some uncommon or complex words may split.

XLM-R should generally perform better on Hindi than
the English-centric BERT and DistilBERT simulations.

[UNK] should generally be uncommon.

Do NOT produce mojibake.

==================================================
MODEL DIFFERENCES
==================================================

Make the seven outputs meaningfully different.

BERT:
English-centric WordPiece simulation.
Hindi can fragment badly.
Occasional [UNK].

DistilBERT:
WordPiece simulation similar to BERT.
Hindi can fragment badly.
Occasional [UNK].

RoBERTa:
Byte-level BPE.
Use Ġ.
Hindi can be fragmented.
Generally little or no [UNK].
Never mojibake.

BERTweet:
RoBERTa-derived social-media BPE.
Pay attention to hashtags, mentions, URLs and emojis.
Hindi can fragment more than Indian-language models.
Occasional [UNK] is allowed for simulation.

IndicBERT:
Indian-language focused.
Hindi should tokenize relatively well.
Use ▁.

MuRIL:
Indian-language multilingual model.
Hindi should tokenize relatively well.
Readable subwords.

XLM-R:
Multilingual SentencePiece-style model.
Hindi should tokenize relatively well.
Use ▁.

==================================================
RELATIVE QUALITY
==================================================

For Hindi, the general visual pattern should be:

BERT
→ more fragmentation / possible [UNK]

DistilBERT
→ more fragmentation / possible [UNK]

RoBERTa
→ BPE fragmentation / Ġ / little [UNK]

BERTweet
→ social-media BPE / possible fragmentation

IndicBERT
→ cleaner Hindi

MuRIL
→ cleaner Hindi

XLM-R
→ cleaner multilingual Hindi

This relative difference is intentional.

Do NOT make all seven tokenizers equally good.

Do NOT make all seven tokenizers equally bad.

==================================================
TOKEN NOTATION
==================================================

BERT / DistilBERT:

##continuation

Example:

play
##ing

RoBERTa:

Ġword

SentencePiece-style:

▁word

Important:

These markers are tokenizer notation.

They must NOT corrupt the underlying Unicode.

==================================================
REALISM RULE
==================================================

The output is a simulation.

Therefore exact real-vocabulary behavior is NOT required.

What matters is that the output looks believable.

It is acceptable for BERT, DistilBERT and BERTweet
to produce some deliberately poor Hindi segmentation.

It is acceptable for occasional [UNK] to appear.

It is acceptable for different requests to produce
slightly different simulated segmentation.

But the output must remain readable and structurally valid.

==================================================
OUTPUT
==================================================

Return EXACTLY these seven models:

BERT
DistilBERT
RoBERTa
BERTweet
IndicBERT
MuRIL
XLM-R

Every model MUST have a non-empty tokens array
when the input is non-empty.

Every token MUST contain:

{
  "text": "string",
  "isUnk": false
}

The token text must be a string.

isUnk must be a boolean.

If text is exactly "[UNK]":

"isUnk": true

Otherwise:

"isUnk": false

DO NOT return:

- fertility
- unkPct
- explanations
- descriptions
- markdown
- comments
- extra fields

Return ONLY valid JSON.

Required structure:

{
  "models": [
    {
      "model": "BERT",
      "tokens": [
        {
          "text": "example",
          "isUnk": false
        }
      ]
    },
    {
      "model": "DistilBERT",
      "tokens": [
        {
          "text": "example",
          "isUnk": false
        }
      ]
    },
    {
      "model": "RoBERTa",
      "tokens": [
        {
          "text": "Ġexample",
          "isUnk": false
        }
      ]
    },
    {
      "model": "BERTweet",
      "tokens": [
        {
          "text": "example",
          "isUnk": false
        }
      ]
    },
    {
      "model": "IndicBERT",
      "tokens": [
        {
          "text": "▁example",
          "isUnk": false
        }
      ]
    },
    {
      "model": "MuRIL",
      "tokens": [
        {
          "text": "example",
          "isUnk": false
        }
      ]
    },
    {
      "model": "XLM-R",
      "tokens": [
        {
          "text": "▁example",
          "isUnk": false
        }
      ]
    }
  ]
}
`;
}

/**
 * =========================
 * UTILITY
 * =========================
 */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

/**
 * Extract the RetryInfo delay from Google's 429 response.
 */
function extractRetryDelaySeconds(
  apiMessage: string,
  errorPayload: unknown
): number | null {
  const details = (
    errorPayload as {
      details?: unknown[];
    } | null
  )?.details;

  if (Array.isArray(details)) {
    for (const detail of details) {
      const retryDelay = (
        detail as {
          retryDelay?: string;
        }
      )?.retryDelay;

      if (typeof retryDelay === "string") {
        const match =
          retryDelay.match(/([\d.]+)s?/);

        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
  }

  const textMatch =
    apiMessage.match(
      /retry in ([\d.]+)s/i
    );

  if (textMatch) {
    return parseFloat(textMatch[1]);
  }

  return null;
}

/**
 * =========================
 * GEMINI API
 * =========================
 */

async function callGemini(
  prompt: string,
  modelName: string
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server."
    );
  }

  const candidates = Array.from(
    new Set([
      normalizeModelName(modelName),
      ...FALLBACK_MODELS,
    ])
  );

  let lastError: Error | null = null;

  const MAX_AUTO_RETRY_SECONDS = 20;

  for (const candidate of candidates) {
    try {
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${candidate}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          temperature: 0,
          responseMimeType:
            "application/json",
          maxOutputTokens: 8192,
        },

        safetySettings: [
          {
            category:
              "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category:
              "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category:
              "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category:
              "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      };

      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            requestBody
          ),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        const apiMessage =
          data?.error?.message ||
          `Gemini API returned HTTP ${response.status}.`;

        const errorText =
          `${response.status} ${apiMessage}`.toLowerCase();

        /**
         * Rate limit / quota handling.
         */
        if (
          response.status === 429 ||
          /quota|rate limit|resource exhausted/.test(
            errorText
          )
        ) {
          console.error(
            "Gemini 429 detail:",
            JSON.stringify(
              data?.error,
              null,
              2
            )
          );

          const retryAfter =
            extractRetryDelaySeconds(
              apiMessage,
              data?.error
            );

          if (
            retryAfter !== null &&
            retryAfter <=
              MAX_AUTO_RETRY_SECONDS
          ) {
            console.error(
              `Rate limited on "${candidate}". ` +
                `Waiting ${retryAfter}s before one retry...`
            );

            await sleep(
              retryAfter * 1000 + 250
            );

            const retryResponse =
              await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify(
                  requestBody
                ),
              });

            const retryData =
              await retryResponse
                .json()
                .catch(() => null);

            if (retryResponse.ok) {
              const retryText =
                retryData?.candidates?.[0]
                  ?.content?.parts
                  ?.map(
                    (
                      part: {
                        text?: string;
                      }
                    ) =>
                      typeof part?.text ===
                      "string"
                        ? part.text
                        : ""
                  )
                  .join("")
                  .trim() ?? "";

              if (retryText) {
                return retryText;
              }
            }

            console.error(
              `Retry after rate limit also failed for "${candidate}". ` +
                "Trying next fallback model if available..."
            );
          }

          lastError = new Error(
            `Gemini API quota or rate limit reached on ` +
              `"${candidate}": ${apiMessage}`
          );

          continue;
        }

        /**
         * Authentication errors should not
         * try other models.
         */
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            `Gemini API authentication error: ${apiMessage}`
          );
        }

        /**
         * Try another model if this model
         * is unavailable.
         */
        if (
          response.status === 404 ||
          /model.*not found|not found/.test(
            errorText
          )
        ) {
          console.error(
            `Gemini model "${candidate}" not found/unavailable:`,
            apiMessage
          );

          lastError = new Error(
            apiMessage
          );

          continue;
        }

        console.error(
          `Gemini API error (status ${response.status}):`,
          apiMessage
        );

        lastError = new Error(
          apiMessage
        );

        continue;
      }

      /**
       * Successful HTTP response but no candidates.
       */
      if (
        !data?.candidates ||
        data.candidates.length === 0
      ) {
        const blockReason =
          data?.promptFeedback
            ?.blockReason ||
          data?.candidates?.[0]
            ?.finishReason ||
          "unknown";

        console.error(
          `Gemini returned no candidates for model "${candidate}".`,
          {
            blockReason,
            promptFeedback:
              data?.promptFeedback,
            candidateCount:
              data?.candidates?.length ??
              0,
          }
        );

        lastError = new Error(
          `Gemini returned no output (reason: ${blockReason}).`
        );

        continue;
      }

      /**
       * Gemini may return multiple text parts.
       *
       * Join all text parts instead of assuming parts[0].
       */
      const rawText =
        data?.candidates?.[0]
          ?.content?.parts
          ?.map(
            (
              part: {
                text?: string;
              }
            ) =>
              typeof part?.text ===
              "string"
                ? part.text
                : ""
          )
          .join("")
          .trim() ?? "";

      if (!rawText) {
        console.error(
          `Gemini returned empty text for model "${candidate}".`,
          JSON.stringify(
            {
              candidates:
                data?.candidates,
              promptFeedback:
                data?.promptFeedback,
              finishReason:
                data?.candidates?.[0]
                  ?.finishReason,
            },
            null,
            2
          )
        );

        lastError = new Error(
          "Gemini returned an empty response."
        );

        continue;
      }

      return rawText;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown Gemini error.";

      lastError = new Error(
        message
      );

      if (
        /quota|rate limit|resource exhausted|429/i.test(
          message
        )
      ) {
        throw lastError;
      }

      if (
        /authentication error|401|403/i.test(
          message
        )
      ) {
        throw lastError;
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "Gemini API failed without returning a response."
    )
  );
}

/**
 * =========================
 * JSON EXTRACTION
 * =========================
 */

function extractJsonObject(
  rawText: string
): Record<string, unknown> {
  if (
    !rawText ||
    !rawText.trim()
  ) {
    throw new Error(
      "Gemini returned an empty JSON response."
    );
  }

  let cleaned =
    rawText.trim();

  /**
   * Remove markdown fences if Gemini
   * unexpectedly wraps the JSON.
   */
  cleaned = cleaned
    .replace(
      /^```json\s*/i,
      ""
    )
    .replace(
      /^```\s*/i,
      ""
    )
    .replace(
      /\s*```$/i,
      ""
    )
    .trim();

  /**
   * First try direct JSON parsing.
   */
  try {
    return JSON.parse(
      cleaned
    ) as Record<string, unknown>;
  } catch {
    /**
     * If Gemini added extra text,
     * try extracting the outermost JSON.
     */
    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      lastBrace <= firstBrace
    ) {
      throw new Error(
        "Gemini returned invalid JSON."
      );
    }

    const jsonPart =
      cleaned.slice(
        firstBrace,
        lastBrace + 1
      );

    try {
      return JSON.parse(
        jsonPart
      ) as Record<string, unknown>;
    } catch {
      throw new Error(
        "Gemini returned malformed JSON."
      );
    }
  }
}

/**
 * =========================
 * CLASSIFICATION HELPERS
 * =========================
 */

function isHumAidCategory(
  value: unknown
): value is HumAidCategory {
  return (
    typeof value === "string" &&
    HUM_AID_CATEGORIES.includes(
      value as HumAidCategory
    )
  );
}

function cleanReason(
  reason: unknown
): string {
  if (
    typeof reason !== "string"
  ) {
    return "Classified based on the content of the tweet.";
  }

  const cleaned =
    reason
      .replace(/\s+/g, " ")
      .trim();

  if (!cleaned) {
    return "Classified based on the content of the tweet.";
  }

  const words =
    cleaned.split(/\s+/);

  if (words.length <= 25) {
    return cleaned;
  }

  return `${words
    .slice(0, 25)
    .join(" ")}.`;
}

/**
 * =========================
 * TOKENIZER METRICS
 * =========================
 *
 * Gemini does NOT calculate these.
 * TypeScript calculates them locally.
 */

function calculateFertility(
  tokens: Token[],
  text: string
): number {
  const words =
    text
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0 ||
    tokens.length === 0
  ) {
    return 0;
  }

  return Number(
    (
      tokens.length /
      words.length
    ).toFixed(2)
  );
}

function calculateUnkPct(
  tokens: Token[]
): number {
  if (tokens.length === 0) {
    return 0;
  }

  const unkCount =
    tokens.filter(
      (token) =>
        token.isUnk
    ).length;

  return Number(
    (
      (unkCount /
        tokens.length) *
      100
    ).toFixed(2)
  );
}

/**
 * =========================
 * TOKEN CLEANING
 * =========================
 */

function normalizeToken(
  token: unknown
): Token | null {
  if (
    !token ||
    typeof token !== "object"
  ) {
    return null;
  }

  const obj =
    token as Record<
      string,
      unknown
    >;

  if (
    typeof obj.text !==
    "string"
  ) {
    return null;
  }

  const tokenText =
    obj.text;

  if (!tokenText) {
    return null;
  }

  /**
   * If Gemini says [UNK], always
   * make isUnk true.
   */
  const isUnk =
    tokenText === "[UNK]"
      ? true
      : obj.isUnk === true;

  return {
    text: tokenText,
    isUnk,
  };
}

/**
 * Remove obvious Unicode mojibake.
 *
 * This does NOT alter valid Hindi.
 */
function containsMojibake(
  text: string
): boolean {
  return (
    /à¤|à¥|Ã.|Â.|ðŸ/.test(
      text
    )
  );
}

/**
 * Normalize Gemini's tokenizer response.
 *
 * Gemini provides:
 * - model
 * - tokens
 *
 * TypeScript calculates:
 * - fertility
 * - unkPct
 */
function normalizeTokenizerResult(
  value: unknown,
  originalText: string
): TokenizerResult[] {
  if (
    !Array.isArray(value)
  ) {
    return TOKENIZER_MODELS.map(
      (model) => ({
        model,
        fertility: 0,
        unkPct: 0,
        tokens: [],
      })
    );
  }

  const results: TokenizerResult[] =
    [];

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const obj =
      item as Record<
        string,
        unknown
      >;

    const model =
      typeof obj.model ===
      "string"
        ? obj.model
        : "";

    if (
      !TOKENIZER_MODELS.includes(
        model as (typeof TOKENIZER_MODELS)[number]
      )
    ) {
      continue;
    }

    const rawTokens =
      Array.isArray(
        obj.tokens
      )
        ? obj.tokens
        : [];

    const tokens: Token[] =
      [];

    for (const rawToken of rawTokens) {
      const token =
        normalizeToken(
          rawToken
        );

      if (!token) {
        continue;
      }

      /**
       * Remove obvious mojibake.
       *
       * We intentionally do NOT remove
       * [UNK] or aggressive Hindi splits.
       */
      if (
        containsMojibake(
          token.text
        )
      ) {
        console.warn(
          `Ignoring corrupted token from ${model}:`,
          token.text
        );

        continue;
      }

      tokens.push(token);
    }

    results.push({
      model,

      fertility:
        calculateFertility(
          tokens,
          originalText
        ),

      unkPct:
        calculateUnkPct(
          tokens
        ),

      tokens,
    });
  }

  const existing =
    new Map(
      results.map(
        (result) => [
          result.model,
          result,
        ]
      )
    );

  /**
   * Always return all seven models.
   */
  return TOKENIZER_MODELS.map(
    (model) =>
      existing.get(model) || {
        model,
        fertility: 0,
        unkPct: 0,
        tokens: [],
      }
  );
}

/**
 * =========================
 * POST HANDLER
 * =========================
 */

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as {
        kind?:
          | "classify"
          | "tokenize";
        tweet?: string;
        text?: string;
        language?: string;
        model?: string;
      };

    const kind =
      body.kind ??
      "classify";

    const modelName =
      normalizeModelName(
        body.model
      );

    /**
     * =========================
     * CLASSIFICATION
     * =========================
     */

    if (
      kind === "classify"
    ) {
      const tweet =
        typeof body.tweet ===
        "string"
          ? body.tweet.trim()
          : "";

      if (!tweet) {
        return NextResponse.json(
          {
            error:
              "Tweet cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      const prompt =
        buildClassifyPrompt(
          tweet
        );

      const raw =
        await callGemini(
          prompt,
          modelName
        );

      const parsed =
        extractJsonObject(
          raw
        ) as {
          category?: unknown;
          reason?: unknown;
        };

      const category =
        isHumAidCategory(
          parsed.category
        )
          ? parsed.category
          : "other relevant information";

      const reason =
        cleanReason(
          parsed.reason
        );

      return NextResponse.json({
        category,
        reason,
      });
    }

    /**
     * =========================
     * TOKENIZATION
     * =========================
     */

    if (
      kind === "tokenize"
    ) {
      const text =
        typeof body.text ===
        "string"
          ? body.text.trim()
          : typeof body.tweet ===
              "string"
            ? body.tweet.trim()
            : "";

      const language =
        typeof body.language ===
          "string" &&
        body.language.trim()
          ? body.language.trim()
          : "Hindi";

      if (!text) {
        return NextResponse.json(
          {
            error:
              "Text cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      const prompt =
        buildTokenizerPrompt(
          text,
          language
        );

      const raw =
        await callGemini(
          prompt,
          modelName
        );

      const parsed =
        extractJsonObject(
          raw
        ) as {
          models?: unknown;
        };

      const models =
        normalizeTokenizerResult(
          parsed.models,
          text
        );

      return NextResponse.json({
        models,
      });
    }

    /**
     * =========================
     * INVALID REQUEST TYPE
     * =========================
     */

    return NextResponse.json(
      {
        error:
          'Invalid "kind". Use "classify" or "tokenize".',
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Gemini error.";

    console.error(
      "Gemini route error:",
      message
    );

    /**
     * Quota/rate-limit errors.
     */
    if (
      /quota|rate limit|resource exhausted|429/i.test(
        message
      )
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 429,
        }
      );
    }

    /**
     * Authentication/API-key errors.
     */
    if (
      /authentication|api key|401|403/i.test(
        message
      )
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}