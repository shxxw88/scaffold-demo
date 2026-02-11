import Constants from "expo-constants";

const OPENAI_API_BASE = "https://api.openai.com/v1";
const OPENAI_API_KEY =
  (Constants.expoConfig?.extra as { openaiApiKey?: string } | undefined)
    ?.openaiApiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";

const DEFAULT_SYSTEM_PROMPT =
  "You clean speech transcripts for form inputs. Respond with the most concise value, remove filler words, and leave the field empty if nothing relevant was spoken.";

// Small, field-specific prompts keep Whisper output tightly formatted for each input.
const FIELD_PROMPTS: Record<string, string> = {
  name: "Return only the full name. Remove filler words and honorifics.",
  firstName: "Return only the first name (one or two short words).",
  lastName: "Return only the last name (one short word).",
  gender:
    "Return only one of these options: Male, Female, Non-Binary, Prefer Not to Say.",
  dateOfBirth:
    "Return the date of birth in YYYY-MM-DD format if possible, or the spoken date.",
  phone:
    "Return only the phone number digits with optional formatting. Remove words like 'my number is'.",
  email: "Return only the email address in lowercase.",
  address:
    "Return the clean address line, omitting phrases like 'my address is'. Keep commas for separation.",
  addressLine1:
    "Return the first address line only. Remove filler words and unit descriptors beyond the address line.",
  addressLine2:
    "Return the second address line or apartment details only. Remove filler words.",
  city: "Return only the city name.",
  province: "Return only the province or state name.",
  postalCode:
    "Return only the postal code/zip. Use uppercase letters and include spacing if spoken.",
  citizenshipStatus:
    "Return the short citizenship or residency status mentioned.",
  highestEducation:
    "Return only the highest completed education level (e.g., High School Diploma).",
  highSchoolName:
    "Return the school name only. Remove phrases like 'I went to'.",
  graduationDate:
    "Return only the graduation date or year mentioned. Prefer YYYY or YYYY-MM-DD.",
  tradeSchoolName: "Return the trade school or college name only.",
  tradeProgramName:
    "Return only the name of the trade program or course of study.",
  trade: "Return the specific trade the user mentioned.",
  apprenticeshipLevel:
    "Return only the apprenticeship level or stage (e.g., Level 2).",
  householdSize:
    "Return only the household size as a number (digits). Remove words.",
  member1: "Return only the first household member's name.",
  member2: "Return only the second household member's name.",
  member3: "Return only the third household member's name.",
  income:
    "Return only the numeric income amount mentioned (digits and optional currency).",
  guardianFirstName: "Return only the guardian's first name.",
  guardianLastName: "Return only the guardian's last name.",
  guardianEmail: "Return only the guardian's email address in lowercase.",
  guardianPhone:
    "Return only the guardian's phone number digits with optional formatting.",
};

export interface TranscriptionPayload {
  uri: string;
  field?: string | null;
  fields?: string[];
  promptOverride?: string;
}

export interface TranscriptionResult {
  rawText: string;
  cleanedText: string;
  structuredData?: Record<string, string>;
}

export const getVoicePromptForField = (
  field?: string | null
): string | undefined => {
  if (!field) {
    return undefined;
  }
  const normalized = field.replace(/\s+/g, "").trim();
  return FIELD_PROMPTS[normalized] || FIELD_PROMPTS[field] || undefined;
};

const assertApiKey = () => {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "Missing OpenAI API key. Set EXPO_PUBLIC_OPENAI_API_KEY in your env."
    );
  }
};

const transcribeAudioFile = async (uri: string): Promise<string> => {
  assertApiKey();

  // Whisper-style endpoint that returns plain text for the recorded file.
  const extension = uri.split(".").pop() || "m4a";
  const formData = new FormData();
  formData.append("model", "gpt-4o-mini-transcribe");
  formData.append("response_format", "json");
  formData.append("file", {
    uri,
    name: `recording.${extension}`,
    type: `audio/${extension}`,
  } as any);

  const response = await fetch(`${OPENAI_API_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Transcription failed with status ${response.status}: ${errorText}`
    );
  }

  const payload = await response.json();
  const text =
    payload.text ||
    payload.output_text ||
    (Array.isArray(payload.results)
      ? payload.results.map((item: { text: string }) => item.text).join(" ")
      : "");

  return (text || "").trim();
};

const cleanTranscriptSingleField = async (
  rawText: string,
  instructions?: string
): Promise<string> => {
  assertApiKey();

  // One-off clean up for a single field (cheapest path).
  const prompt = instructions || "Return the concise cleaned text.";

  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 120,
      messages: [
        { role: "system", content: DEFAULT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Instructions: ${prompt}\nTranscript: """${rawText}"""`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cleanup failed with status ${response.status}: ${errorText}`
    );
  }

  const payload = await response.json();
  const cleaned =
    payload.choices?.[0]?.message?.content?.trim() ||
    payload.choices?.[0]?.message?.content ||
    "";
  return cleaned.trim();
};

const stripJsonFences = (content: string): string => {
  const trimmed = content.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  return trimmed;
};

const cleanTranscriptMultiField = async (
  rawText: string,
  fields: string[]
): Promise<Record<string, string>> => {
  assertApiKey();

  // Multi-field extraction to JSON so we can hydrate several inputs at once.
  const fieldPrompt = fields
    .map((key) => {
      const instructions =
        getVoicePromptForField(key) || `Return the best value for ${key}.`;
      return `${key}: ${instructions}`;
    })
    .join("\n");

  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "Extract structured data from the transcript. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: `Transcript: """${rawText}"""

Extract the following fields and respond with JSON containing only these keys. Use empty strings if a field isn't mentioned.
${fieldPrompt}`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cleanup failed with status ${response.status}: ${errorText}`
    );
  }

  const payload = await response.json();
  const rawContent = payload.choices?.[0]?.message?.content;
  if (!rawContent || typeof rawContent !== "string") {
    return fields.reduce(
      (acc, field) => ({ ...acc, [field]: "" }),
      {} as Record<string, string>
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stripJsonFences(rawContent));
  } catch {
    return fields.reduce(
      (acc, field) => ({ ...acc, [field]: "" }),
      {} as Record<string, string>
    );
  }

  return fields.reduce((acc, field) => {
    const value = parsed[field];
    acc[field] =
      typeof value === "string"
        ? value.trim()
        : value !== undefined && value !== null
        ? String(value)
        : "";
    return acc;
  }, {} as Record<string, string>);
};

export const transcribeAndCleanAudio = async ({
  uri,
  field,
  fields,
  promptOverride,
}: TranscriptionPayload): Promise<TranscriptionResult> => {
  // High-level helper that records > transcribes > cleans, then returns raw + cleaned text.
  const rawText = await transcribeAudioFile(uri);
  if (!rawText) {
    return { rawText: "", cleanedText: "" };
  }

  if (fields && fields.length > 0) {
    const structuredData = await cleanTranscriptMultiField(rawText, fields);
    const summary =
      Object.entries(structuredData)
        .filter(([, value]) => !!value)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n") || rawText;
    return {
      rawText,
      cleanedText: summary,
      structuredData,
    };
  }

  const fieldPrompt = promptOverride || getVoicePromptForField(field);
  if (!fieldPrompt) {
    return { rawText, cleanedText: rawText };
  }

  const cleanedText = await cleanTranscriptSingleField(rawText, fieldPrompt);
  return {
    rawText,
    cleanedText: cleanedText || rawText,
  };
};
