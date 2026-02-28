# AI-102 Cheat Sheet (Dec 23, 2025 blueprint) — with Python Snippets

> **Purpose:** fast recall for AI‑102. This is organized by the **official skill areas and weightings**.
>
> **Source for skills/weights:** [Microsoft Learn AI‑102 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102) (skills measured as of Dec 23, 2025).

---

## Table of contents
1. [Plan & manage an Azure AI solution (20–25%)](#plan--manage)
2. [Implement generative AI solutions (15–20%)](#genai)
3. [Implement an agentic solution (5–10%)](#agentic)
4. [Implement computer vision solutions (10–15%)](#vision)
5. [Implement natural language processing solutions (15–20%)](#nlp)
6. [Implement knowledge mining & information extraction solutions (15–20%)](#km)
7. [File types, sizes & input limits](#limits)
8. [Quick memorization hooks](#hooks)
9. [Quick-reference tables](#quickref)
10. [Reference links](#refs)

---

<a name="plan--manage"></a>
## 1) Plan & manage an Azure AI solution (20–25%)

### "Which service do I pick?" decision table

| I need to... | Use this service |
|---|---|
| Extract text from images | **Vision OCR** (Image Analysis `READ`) |
| Extract structured fields from forms/invoices/receipts | **Document Intelligence** (prebuilt or custom models) |
| Detect sentiment, PII, entities, key phrases in text | **Language** (Text Analytics) |
| Build a custom image classifier or object detector | **Custom Vision** |
| Search over my own documents (full-text, semantic, vector) | **Azure AI Search** |
| Generate, summarize, or transform text | **Azure OpenAI** |
| Analyze video for faces, topics, scenes, transcripts | **Video Indexer** |
| Convert speech to text or text to speech | **Speech Service** |
| Build a Q&A bot from existing content | **Custom Question Answering** (Language) |
| Moderate user-generated content for safety | **Content Safety** |
| Ground a model with my own data at query time | **RAG** (Azure OpenAI + Azure AI Search) |

### Know this cold
- **Service selection**: pick the right Azure AI capability for the job (Vision, Language, Speech, Search, OpenAI).
- **Security**: keys vs **Microsoft Entra ID** (recommended), managed identity patterns, private networking, least-privilege roles.
- **Operations**: monitoring + diagnostics + cost control.
- **Responsible AI controls**: content moderation/filters, blocklists, prompt shields, harm detection, governance.

### SDK at a glance

| Service | Package | Client class | Auth pattern |
|---|---|---|---|
| All Azure SDKs | `azure-identity` | — | `DefaultAzureCredential()` |

### Common exam traps
- Confusing **monitoring** (logs/metrics/tracing) with **evaluation** (quality comparisons of outputs).
- Using API keys everywhere instead of Entra ID / managed identity (recommended for production).
- Confusing **Vision OCR** (extract raw text from images) with **Document Intelligence** (extract structured fields from forms).
- Picking **Custom Vision** when a prebuilt Image Analysis feature already covers the scenario.

### Python snippet — common auth pattern (Entra ID)
```python
# Auth pattern used across Azure SDKs
# pip install azure-identity
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
```

### Key docs
- [AI-102 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102)
- [Azure AI Content Safety](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/)

---

<a name="genai"></a>
## 2) Implement generative AI solutions (15–20%)

### Know this cold
- **RAG**: ground a model with your data using retrieval (commonly Azure AI Search) + prompt/context assembly.
- **Model behavior controls**: parameters like **temperature**, **max tokens**, stop sequences, repetition controls.
- **Evaluation**: compare prompt/flow outputs, quality, groundedness, safety signals.
- **API choice**: Azure OpenAI **Responses API** for stateful, multi‑turn responses.

### Parameter quick-reference

| Parameter | What it controls | Low value | High value |
|---|---|---|---|
| `temperature` | Randomness / creativity | Deterministic, focused | Creative, diverse |
| `max_tokens` | Output length cap | Short responses | Longer responses |
| `top_p` | Nucleus sampling (token pool) | Narrow pool, more predictable | Wider pool, more varied |
| `frequency_penalty` | Penalize repeated tokens | Allows repetition | Strongly discourages repeats |
| `presence_penalty` | Encourage new topics | Stays on topic | Explores new topics |
| `stop` | Stop sequences | — | Model stops when it emits any listed string |

> **Tip:** `temperature` and `top_p` both control randomness — Microsoft recommends changing one, not both.

### SDK at a glance

| Service | Package | Client class | Key method |
|---|---|---|---|
| Azure OpenAI | `openai` | `OpenAI` | `.responses.create(model, input)` |
| Azure AI Search | `azure-search-documents` | `SearchClient` | `.search(search_text, filter)` |

### Common exam traps
- Confusing **temperature=0** (deterministic) with **temperature=1** (maximum creativity).
- Thinking RAG **replaces** fine-tuning — they solve different problems (runtime grounding vs. baked-in behavior).
- Forgetting that `top_p` and `temperature` overlap — change one, not both.
- Confusing **Responses API** (stateful, multi-turn) with the older Chat Completions API.

### REST API — Azure OpenAI Chat Completions

```
POST https://<resource-name>.openai.azure.com/openai/deployments/<deployment-name>/chat/completions?api-version=2024-10-21
Headers:
  api-key: <your-api-key>
  Content-Type: application/json
```

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Summarize the key risks of using RAG for regulated content."}
  ],
  "temperature": 0.7,
  "max_tokens": 500,
  "top_p": 1.0,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
```

> **Sample response (abbreviated):**
```json
{
  "id": "chatcmpl-abc123",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The key risks of using RAG for regulated content include..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {"prompt_tokens": 32, "completion_tokens": 150, "total_tokens": 182}
}
```

### REST API — Azure OpenAI with "On Your Data" (RAG)

> Use this to ground Azure OpenAI on your own Azure AI Search index at query time.

```
POST https://<resource-name>.openai.azure.com/openai/deployments/<deployment-name>/chat/completions?api-version=2024-10-21
Headers:
  api-key: <your-api-key>
  Content-Type: application/json
```

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is our company's vacation policy?"}
  ],
  "data_sources": [
    {
      "type": "azure_search",
      "parameters": {
        "endpoint": "https://<search-service>.search.windows.net",
        "index_name": "my-index",
        "authentication": {
          "type": "api_key",
          "key": "<search-api-key>"
        },
        "query_type": "semantic",
        "semantic_configuration": "my-semantic-config",
        "top_n_documents": 5
      }
    }
  ],
  "temperature": 0
}
```

> **Exam trap:** `query_type` can be `simple`, `semantic`, or `vector`. Know which one to pick for the scenario.

### REST API — Azure AI Search query

```
POST https://<search-service>.search.windows.net/indexes/<index-name>/docs/search?api-version=2024-07-01
Headers:
  api-key: <search-api-key>
  Content-Type: application/json
```

```json
{
  "search": "copilot studio",
  "filter": "category eq 'policy'",
  "queryType": "semantic",
  "semanticConfiguration": "my-semantic-config",
  "top": 5,
  "select": "title, content, category"
}
```

> **Sample response (abbreviated):**
```json
{
  "@odata.count": 12,
  "value": [
    {
      "@search.score": 8.42,
      "@search.rerankerScore": 3.14,
      "title": "Copilot Studio Policy Guide",
      "content": "Copilot Studio enables...",
      "category": "policy"
    }
  ]
}
```

> **Key fields:** `@search.score` = BM25 relevance score. `@search.rerankerScore` = semantic ranker score (only when `queryType: "semantic"`).

### Python snippet — Azure OpenAI Responses API (OpenAI Python)
```python
# pip install --upgrade openai
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    base_url="https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1/",
)

resp = client.responses.create(
    model="YOUR_MODEL_DEPLOYMENT_NAME",  # e.g., gpt-4.1-nano deployment
    input="Summarize the key risks of using RAG for regulated content.",
)

print(resp.model_dump_json(indent=2))
```

### Python snippet — Azure AI Search retrieval (query + filter)
```python
# pip install azure-search-documents
import os
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

endpoint = os.environ["AZURE_SEARCH_ENDPOINT"]
index_name = os.environ["AZURE_SEARCH_INDEX_NAME"]
api_key = os.environ["AZURE_SEARCH_API_KEY"]

client = SearchClient(endpoint, index_name, AzureKeyCredential(api_key))

results = client.search(
    search_text="copilot studio",
    filter="category eq 'policy'"  # OData filter example
)

for r in results:
    print(r)
```

### Key docs
- [Azure OpenAI Responses API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses?view=foundry-classic)
- [Azure AI Search Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/search-documents-readme?view=azure-python)
- [Azure AI Search Python samples](https://learn.microsoft.com/en-us/azure/search/samples-python)

---

<a name="agentic"></a>
## 3) Implement an agentic solution (5–10%)

### Know this cold
- What makes it **agentic**: tool use + multi‑step planning + state across turns + orchestration.
- The blueprint explicitly calls out **creating agents**, resources needed, and testing/optimizing/deploying.

### Common exam traps
- Confusing a **simple chatbot** (single request/response) with an **agent** (loop: plan → tool call → observe → decide).
- Forgetting that agents need **state management** across turns — conversation history must be preserved.
- Thinking "agentic" requires a specific framework — it's a pattern (tool-call loop), not a product.

### Where to look for code
- Azure AI Search provides **agentic retrieval** samples (quickstarts + pipelines).

### Python snippet — minimal "tool-call loop" skeleton (conceptual)
> This is a **template** to structure your code; use the official agentic retrieval samples for full implementations.
```python
# Pseudocode skeleton for agent-like orchestration
# - retrieve context
# - call model
# - if model requests a tool, execute it, then continue

def run_agent(user_input):
    context = retrieve_from_search(user_input)
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": user_input},
        {"role": "user", "content": f"Context:\n{context}"},
    ]

    while True:
        out = call_model(messages)
        if out.get("tool_call"):
            tool_result = run_tool(out["tool_call"])
            messages.append({"role": "tool", "content": tool_result})
        else:
            return out["final"]
```

### Key docs
- [Azure AI Search Python samples](https://learn.microsoft.com/en-us/azure/search/samples-python)

---

<a name="vision"></a>
## 4) Implement computer vision solutions (10–15%)

### Know this cold
- **Image analysis**: tags/objects/visual features.
- **OCR**: read printed + handwritten text.
- **Custom Vision**: classification vs object detection, train/evaluate/publish/consume.
- **Video**: Video Indexer for insights; spatial analysis for movement/presence scenarios.

### SDK at a glance

| Service | Package | Client class | Key method |
|---|---|---|---|
| Vision (Image Analysis) | `azure-ai-vision-imageanalysis` | `ImageAnalysisClient` | `.analyze(image_data, visual_features=[...])` |

### Common exam traps
- Confusing **Custom Vision** (train your own model) with **Image Analysis** (prebuilt features like tags, objects, captions).
- Forgetting that OCR **`Read`** is the recommended operation for all text extraction (replaced the old `RecognizeText`).
- Mixing up **Video Indexer** (content insights: faces, topics, transcripts) with **spatial analysis** (real-time movement/counting/presence).
- Not knowing the `VisualFeatures` enum values: `READ`, `CAPTION`, `TAGS`, `OBJECTS`, `DENSE_CAPTIONS`, `SMART_CROPS`, `PEOPLE`.

### REST API — Image Analysis (tags, caption, objects)

```
POST https://<vision-endpoint>/computervision/imageanalysis:analyze?api-version=2024-02-01&features=tags,caption,objects
Headers:
  Ocp-Apim-Subscription-Key: <your-vision-key>
  Content-Type: application/json
```

```json
{
  "url": "https://example.com/sample-image.jpg"
}
```

> **Sample response (abbreviated):**
```json
{
  "captionResult": {
    "text": "a person standing in front of a building",
    "confidence": 0.92
  },
  "tagsResult": {
    "values": [
      {"name": "person", "confidence": 0.98},
      {"name": "building", "confidence": 0.95},
      {"name": "outdoor", "confidence": 0.91}
    ]
  },
  "objectsResult": {
    "values": [
      {
        "boundingBox": {"x": 10, "y": 20, "w": 200, "h": 300},
        "tags": [{"name": "person", "confidence": 0.97}]
      }
    ]
  }
}
```

> **Key param:** `features` query string accepts: `tags`, `caption`, `denseCaptions`, `objects`, `read`, `smartCrops`, `people`. Comma-separated.

### REST API — Image Analysis OCR (Read)

```
POST https://<vision-endpoint>/computervision/imageanalysis:analyze?api-version=2024-02-01&features=read
Headers:
  Ocp-Apim-Subscription-Key: <your-vision-key>
  Content-Type: application/json
```

```json
{
  "url": "https://example.com/document-scan.png"
}
```

> **Sample response (abbreviated):**
```json
{
  "readResult": {
    "blocks": [
      {
        "lines": [
          {
            "text": "Invoice #12345",
            "boundingPolygon": [{"x": 10, "y": 5}, {"x": 200, "y": 5}, {"x": 200, "y": 25}, {"x": 10, "y": 25}],
            "words": [
              {"text": "Invoice", "confidence": 0.99},
              {"text": "#12345", "confidence": 0.97}
            ]
          }
        ]
      }
    ]
  }
}
```

### REST API — Custom Vision prediction

```
POST https://<custom-vision-resource>.cognitiveservices.azure.com/customvision/v3.0/Prediction/<project-id>/classify/iterations/<published-name>/image
Headers:
  Prediction-Key: <your-prediction-key>
  Content-Type: application/octet-stream
Body: <binary image data>
```

> **For URL-based:** use `.../classify/iterations/<published-name>/url` with `{"url": "https://..."}` JSON body.

> **Sample response:**
```json
{
  "id": "abc-123",
  "project": "<project-id>",
  "predictions": [
    {"tagName": "cat", "probability": 0.95},
    {"tagName": "dog", "probability": 0.04}
  ]
}
```

> **Object detection** uses the same pattern but `.../detect/iterations/...` instead of `.../classify/iterations/...`. Response includes `boundingBox` per prediction.

### Python snippet — OCR from an image file (Azure AI Vision Image Analysis SDK)
```python
# pip install azure-ai-vision-imageanalysis
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures

endpoint = os.environ["AZURE_VISION_ENDPOINT"]
key = os.environ["AZURE_VISION_KEY"]

client = ImageAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

with open("./image.png", "rb") as f:
    result = client.analyze(image_data=f.read(), visual_features=[VisualFeatures.READ])

for block in result.read.blocks:
    for line in block.lines:
        print(line.text)
```

### Key docs
- [Azure AI Vision documentation](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/)
- [OCR quickstart](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/quickstarts-sdk/client-library)
- [Vision Image Analysis Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-vision-imageanalysis-readme?view=azure-python)
- [Custom Vision documentation](https://learn.microsoft.com/en-us/azure/ai-services/custom-vision-service/)
- [Azure Video Indexer documentation](https://learn.microsoft.com/en-us/azure/azure-video-indexer/)

---

<a name="nlp"></a>
## 5) Implement natural language processing solutions (15–20%)

### Know this cold
- **Text Analytics / Language**: sentiment, entities, key phrases, language detection, **PII detection**.
- **Custom question answering**: build/train/test/publish a Q&A knowledge base.
- **Speech**: STT/TTS + SSML; speech translation; intent/keyword recognition.

### SDK at a glance

| Service | Package | Client class | Key methods |
|---|---|---|---|
| Language (Text Analytics) | `azure-ai-textanalytics` | `TextAnalyticsClient` | `.analyze_sentiment()`, `.recognize_entities()`, `.recognize_pii_entities()`, `.extract_key_phrases()`, `.detect_language()` |

### Common exam traps
- Mixing up **`recognize_entities()`** (general NER — person, location, org) with **`recognize_pii_entities()`** (PII-specific — SSN, phone, email).
- Forgetting that **SSML** is XML-based markup for TTS (not JSON) — controls voice, pitch, rate, pauses, pronunciation.
- Confusing **Speech Translation** (real-time spoken language translation) with **Text Translation** (Translator service for written text).
- Not knowing that `analyze_sentiment()` returns **per-sentence** sentiment plus an **overall** document sentiment.
- Forgetting the **Custom Question Answering** workflow: create KB (knowledge base) → add sources (URLs/files/editorial) → train → test → publish → consume via REST.

### REST API — PII entity recognition with redactionPolicies

> **Exam-tested!** Know the `redactionPolicies` options: `characterMask`, `entityMask`, and the default behavior.

```
POST https://<language-endpoint>/language/:analyze-text?api-version=2022-05-01
Headers:
  Ocp-Apim-Subscription-Key: <your-language-key>
  Content-Type: application/json
```

```json
{
  "kind": "PiiEntityRecognition",
  "parameters": {
    "modelVersion": "latest",
    "piiCategories": ["Person"],
    "redactionPolicies": {
      "policyKind": "characterMask",
      "redactionCharacter": "*"
    }
  },
  "analysisInput": {
    "documents": [
      {
        "id": "1",
        "language": "en",
        "text": "We went to Contoso foodplace located at downtown Seattle last week for a dinner party, and we adore the spot! They provide marvelous food and they have a great menu. The chief cook happens to be the owner (I think his name is John Doe) and he is super nice, coming out of the kitchen and greeted us all."
      }
    ]
  }
}
```

> **redactionPolicies `policyKind` values (memorize these):**
>
> | `policyKind` | What it does | Example output |
> |---|---|---|
> | `characterMask` | Replaces each character with `redactionCharacter` | `********` |
> | `entityMask` | Replaces with entity type label | `[Person]` |
> | *(omitted / default)* | Uses default asterisk masking | `********` |

> **Sample response (abbreviated):**
```json
{
  "kind": "PiiEntityRecognitionResults",
  "results": {
    "documents": [
      {
        "id": "1",
        "redactedText": "We went to Contoso foodplace... (I think his name is ********)...",
        "entities": [
          {
            "text": "John Doe",
            "category": "Person",
            "offset": 198,
            "length": 8,
            "confidenceScore": 0.98
          }
        ]
      }
    ]
  }
}
```

### REST API — Sentiment analysis

```
POST https://<language-endpoint>/language/:analyze-text?api-version=2022-05-01
Headers:
  Ocp-Apim-Subscription-Key: <your-language-key>
  Content-Type: application/json
```

```json
{
  "kind": "SentimentAnalysis",
  "parameters": {
    "modelVersion": "latest",
    "opinionMining": true
  },
  "analysisInput": {
    "documents": [
      {
        "id": "1",
        "language": "en",
        "text": "The food was delicious but the service was terrible."
      }
    ]
  }
}
```

> **Sample response (abbreviated):**
```json
{
  "kind": "SentimentAnalysisResults",
  "results": {
    "documents": [
      {
        "id": "1",
        "sentiment": "mixed",
        "confidenceScores": {"positive": 0.47, "neutral": 0.03, "negative": 0.50},
        "sentences": [
          {
            "text": "The food was delicious",
            "sentiment": "positive",
            "confidenceScores": {"positive": 0.95, "neutral": 0.03, "negative": 0.02},
            "assessments": [
              {"text": "delicious", "sentiment": "positive", "target": {"text": "food"}}
            ]
          },
          {
            "text": "but the service was terrible.",
            "sentiment": "negative",
            "confidenceScores": {"positive": 0.02, "neutral": 0.01, "negative": 0.97}
          }
        ]
      }
    ]
  }
}
```

> **Key:** `opinionMining: true` enables aspect-based sentiment (target + assessment pairs). Without it you only get sentence-level sentiment.

### REST API — Language detection

```
POST https://<language-endpoint>/language/:analyze-text?api-version=2022-05-01
Headers:
  Ocp-Apim-Subscription-Key: <your-language-key>
  Content-Type: application/json
```

```json
{
  "kind": "LanguageDetection",
  "analysisInput": {
    "documents": [
      {"id": "1", "text": "Bonjour, comment allez-vous?"},
      {"id": "2", "text": "Hello, how are you?"}
    ]
  }
}
```

> **Sample response:**
```json
{
  "kind": "LanguageDetectionResults",
  "results": {
    "documents": [
      {"id": "1", "detectedLanguage": {"name": "French", "iso6391Name": "fr", "confidenceScore": 1.0}},
      {"id": "2", "detectedLanguage": {"name": "English", "iso6391Name": "en", "confidenceScore": 1.0}}
    ]
  }
}
```

### REST API — Entity recognition (NER)

```
POST https://<language-endpoint>/language/:analyze-text?api-version=2022-05-01
Headers:
  Ocp-Apim-Subscription-Key: <your-language-key>
  Content-Type: application/json
```

```json
{
  "kind": "EntityRecognition",
  "parameters": {"modelVersion": "latest"},
  "analysisInput": {
    "documents": [
      {"id": "1", "language": "en", "text": "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975 in Albuquerque."}
    ]
  }
}
```

> **Sample response (abbreviated):**
```json
{
  "results": {
    "documents": [
      {
        "id": "1",
        "entities": [
          {"text": "Microsoft", "category": "Organization", "confidenceScore": 0.99},
          {"text": "Bill Gates", "category": "Person", "confidenceScore": 0.98},
          {"text": "April 4, 1975", "category": "DateTime", "subcategory": "Date", "confidenceScore": 0.95},
          {"text": "Albuquerque", "category": "Location", "subcategory": "GPE", "confidenceScore": 0.97}
        ]
      }
    ]
  }
}
```

> **NER categories to know:** `Person`, `Location` (with subcategories: `GPE`, `Structural`), `Organization`, `DateTime`, `Quantity`, `Email`, `URL`, `PhoneNumber`, `IPAddress`.

### REST API — Key phrase extraction

```
POST https://<language-endpoint>/language/:analyze-text?api-version=2022-05-01
Headers:
  Ocp-Apim-Subscription-Key: <your-language-key>
  Content-Type: application/json
```

```json
{
  "kind": "KeyPhraseExtraction",
  "analysisInput": {
    "documents": [
      {"id": "1", "language": "en", "text": "Azure AI Search provides semantic ranking and vector search capabilities for enterprise applications."}
    ]
  }
}
```

> **Sample response:**
```json
{
  "results": {
    "documents": [
      {"id": "1", "keyPhrases": ["Azure AI Search", "semantic ranking", "vector search capabilities", "enterprise applications"]}
    ]
  }
}
```

### REST API — Custom Question Answering (query a knowledge base)

```
POST https://<language-endpoint>/language/:query-knowledgebases?projectName=<project-name>&api-version=2021-10-01&deploymentName=production
Headers:
  Ocp-Apim-Subscription-Key: <your-language-key>
  Content-Type: application/json
```

```json
{
  "top": 3,
  "question": "How do I reset my password?",
  "includeUnstructuredSources": true,
  "confidenceScoreThreshold": 0.5,
  "answerSpanRequest": {
    "enable": true,
    "topAnswersWithSpan": 1,
    "confidenceScoreThreshold": 0.5
  }
}
```

> **Sample response (abbreviated):**
```json
{
  "answers": [
    {
      "questions": ["How do I reset my password?"],
      "answer": "Go to Settings > Security > Reset Password and follow the prompts.",
      "confidenceScore": 0.92,
      "source": "faq.pdf",
      "id": 42,
      "answerSpan": {
        "text": "Settings > Security > Reset Password",
        "confidenceScore": 0.88,
        "offset": 6,
        "length": 37
      }
    }
  ]
}
```

> **Key:** `deploymentName` can be `production` or `test`. Use `test` for validation before publishing.

### REST API — Speech-to-Text (STT) — short audio

```
POST https://<speech-region>.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US
Headers:
  Ocp-Apim-Subscription-Key: <your-speech-key>
  Content-Type: audio/wav
Body: <binary WAV audio data>
```

> **Sample response:**
```json
{
  "RecognitionStatus": "Success",
  "DisplayText": "Remind me to buy groceries after work.",
  "Offset": 3000000,
  "Duration": 28000000
}
```

> **`RecognitionStatus` values:** `Success`, `NoMatch`, `InitialSilenceTimeout`, `BabbleTimeout`, `Error`.

### REST API — Text-to-Speech (TTS) with SSML

> **SSML is XML, not JSON!** This is a common exam trap.

```
POST https://<speech-region>.tts.speech.microsoft.com/cognitiveservices/v1
Headers:
  Ocp-Apim-Subscription-Key: <your-speech-key>
  Content-Type: application/ssml+xml
  X-Microsoft-OutputFormat: audio-16khz-128kbitrate-mono-mp3
```

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody rate="medium" pitch="default">
      Welcome to the Azure AI demonstration.
    </prosody>
    <break time="500ms"/>
    <prosody rate="slow" pitch="high">
      This sentence is spoken slowly with a higher pitch.
    </prosody>
  </voice>
</speak>
```

> **Response:** binary audio stream in the format specified by `X-Microsoft-OutputFormat`.

> **SSML elements to memorize:**
>
> | Element | Purpose |
> |---|---|
> | `<speak>` | Root element (required) — specifies `version` and `xml:lang` |
> | `<voice>` | Selects the voice — `name` attribute (e.g., `en-US-JennyNeural`) |
> | `<prosody>` | Controls `rate`, `pitch`, `volume` |
> | `<break>` | Inserts a pause — `time="500ms"` or `strength="strong"` |
> | `<say-as>` | Controls pronunciation — `interpret-as="date"`, `"telephone"`, `"cardinal"` |
> | `<phoneme>` | IPA/SAPI pronunciation — `alphabet="ipa"` `ph="..."` |
> | `<sub>` | Substitution — `alias="World Wide Web Consortium"` for "W3C" |
> | `<emphasis>` | Stress level — `level="strong"`, `"moderate"`, `"reduced"` |

> **Output format values (common):** `audio-16khz-128kbitrate-mono-mp3`, `audio-24khz-160kbitrate-mono-mp3`, `riff-16khz-16bit-mono-pcm`, `audio-48khz-192kbitrate-mono-mp3`.

### REST API — Speech Translation

```
POST https://<speech-region>.s2s.speech.microsoft.com/speech/translation/cognitiveservices/v1?from=en&to=fr&to=de&api-version=3.0
Headers:
  Ocp-Apim-Subscription-Key: <your-speech-key>
  Content-Type: audio/wav
Body: <binary WAV audio data>
```

> **Key:** `to` parameter can be repeated to translate to multiple languages simultaneously.

### REST API — Translator (text translation)

```
POST https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=fr&to=es
Headers:
  Ocp-Apim-Subscription-Key: <your-translator-key>
  Ocp-Apim-Subscription-Region: <your-region>
  Content-Type: application/json
```

```json
[
  {"Text": "Hello, how are you?"},
  {"Text": "The weather is nice today."}
]
```

> **Sample response:**
```json
[
  {
    "translations": [
      {"text": "Bonjour, comment allez-vous?", "to": "fr"},
      {"text": "Hola, ¿cómo estás?", "to": "es"}
    ]
  },
  {
    "translations": [
      {"text": "Le temps est beau aujourd'hui.", "to": "fr"},
      {"text": "El clima es agradable hoy.", "to": "es"}
    ]
  }
]
```

> **Exam trap:** Translator uses `Ocp-Apim-Subscription-Region` header (required for multi-service resources). Speech Translation handles spoken audio; Translator handles written text.

### Python snippet — create a TextAnalyticsClient
```python
# pip install azure-ai-textanalytics
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient

endpoint = os.environ["AZURE_LANGUAGE_ENDPOINT"] #"https://<resource-name>.cognitiveservices.azure.com/"
key = os.environ["AZURE_LANGUAGE_KEY"]

ta = TextAnalyticsClient(endpoint=endpoint, credential=AzureKeyCredential(key))
```

### Python snippet — sentiment analysis
```python
docs = ["The onboarding was smooth, but the lab instructions were confusing."]
result = ta.analyze_sentiment(docs)
for doc in result:
    print(doc.sentiment, doc.confidence_scores)
```

### Python snippet — PII entity recognition
```python
docs = ["Call me at 555-123-4567. My SSN is 111-22-3333."]
result = ta.recognize_pii_entities(docs)
for doc in result:
    for ent in doc.entities:
        print(ent.text, ent.category, ent.confidence_score)
```

### Key docs
- [Azure AI Language / Text Analytics Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-textanalytics-readme?view=azure-python)
- [Azure Speech Service documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [Speech-to-Text quickstart](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-to-text)
- [Text-to-Speech quickstart](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech)

---

<a name="km"></a>
## 6) Implement knowledge mining & information extraction solutions (15–20%)

### Know this cold (high ROI)
- **Azure AI Search pipeline** concepts: indexes, querying, semantic + vector capabilities, and end‑to‑end samples.
- **Document Intelligence**: prebuilt and custom models; invoice model extracts key fields + line items.
- **Content Understanding**: OCR pipeline + summarization/classification/attribute detection over documents and media.

### Search pipeline anatomy

```
Data source ──► Indexer ──► Skillset (enrichment) ──► Index ──► Queries
                               │                        │
                          Built-in skills           Semantic ranker (query-time)
                          Custom skills             Vector search
                          AI enrichment             Scoring profiles
                          Knowledge store           Filters (OData)
```

> **Key insight:** Skillsets enrich data **at indexing time**. Semantic ranker re-ranks results **at query time**. Don't confuse them.

### Document Intelligence prebuilt models (memorize these)

| Model | What it extracts |
|---|---|
| **Invoice** | Vendor, dates, totals, line items |
| **Receipt** | Merchant, date, totals, items |
| **ID document** | Name, DOB, address, document number |
| **Business card** | Name, title, company, contact info |
| **W-2** | Employee/employer info, wages, tax withholdings |
| **Read** | Raw text (OCR), paragraphs, languages |
| **Layout** | Text, tables, selection marks, structure |
| **General document** | Key-value pairs + entities from any document |

### SDK at a glance

| Service | Package | Client class | Key method |
|---|---|---|---|
| Document Intelligence | `azure-ai-documentintelligence` | `DocumentIntelligenceClient` | `.begin_analyze_document(model_id, document)` |
| Azure AI Search | `azure-search-documents` | `SearchClient` | `.search(search_text, filter)` |

### Common exam traps
- Confusing **skillsets** (enrichment at indexing time) with **semantic ranker** (re-ranking at query time).
- Forgetting that **semantic ranker** requires no changes to the index schema — it's a query-time feature you enable.
- Confusing **indexer** (pulls data + runs skillset) with **index** (the searchable store).
- Not knowing the difference between **built-in skills** (e.g., entity recognition, OCR, key phrase) and **custom skills** (your own Web API).
- Mixing up Document Intelligence **prebuilt models** (ready to use) with **custom models** (you train with your labeled data).

### REST API — Document Intelligence (analyze invoice)

```
POST https://<docintel-endpoint>/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=2024-02-29-preview
Headers:
  Ocp-Apim-Subscription-Key: <your-docintel-key>
  Content-Type: application/json
```

```json
{
  "urlSource": "https://example.com/invoices/invoice1.pdf"
}
```

> **For binary upload:** use `Content-Type: application/octet-stream` and send the file bytes directly.

> **Response:** returns `Operation-Location` header with a URL to poll. The result (when ready):
```json
{
  "status": "succeeded",
  "analyzeResult": {
    "documents": [
      {
        "docType": "invoice",
        "fields": {
          "VendorName": {"type": "string", "value": "Contoso Ltd.", "confidence": 0.95},
          "InvoiceDate": {"type": "date", "value": "2024-03-15", "confidence": 0.98},
          "InvoiceTotal": {"type": "currency", "value": {"amount": 1250.00, "currencyCode": "USD"}, "confidence": 0.97},
          "Items": {
            "type": "array",
            "value": [
              {
                "type": "object",
                "value": {
                  "Description": {"type": "string", "value": "Consulting services"},
                  "Amount": {"type": "currency", "value": {"amount": 1000.00}}
                }
              }
            ]
          }
        }
      }
    ]
  }
}
```

> **Model IDs to know:** `prebuilt-invoice`, `prebuilt-receipt`, `prebuilt-idDocument`, `prebuilt-businessCard`, `prebuilt-tax.us.w2`, `prebuilt-read`, `prebuilt-layout`.

### REST API — Document Intelligence (layout analysis)

```
POST https://<docintel-endpoint>/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=2024-02-29-preview
Headers:
  Ocp-Apim-Subscription-Key: <your-docintel-key>
  Content-Type: application/json
```

```json
{
  "urlSource": "https://example.com/documents/form.pdf"
}
```

> **Layout** extracts: text, tables, selection marks (checkboxes), and document structure. Use this when you need table extraction without specific field mapping.

### REST API — Azure AI Search: create index

```
PUT https://<search-service>.search.windows.net/indexes/<index-name>?api-version=2024-07-01
Headers:
  api-key: <admin-api-key>
  Content-Type: application/json
```

```json
{
  "name": "my-index",
  "fields": [
    {"name": "id", "type": "Edm.String", "key": true, "filterable": true},
    {"name": "title", "type": "Edm.String", "searchable": true, "retrievable": true},
    {"name": "content", "type": "Edm.String", "searchable": true, "retrievable": true, "analyzer": "en.microsoft"},
    {"name": "category", "type": "Edm.String", "filterable": true, "facetable": true},
    {"name": "contentVector", "type": "Collection(Edm.Single)", "searchable": true, "dimensions": 1536, "vectorSearchProfile": "my-vector-profile"}
  ],
  "semanticConfiguration": {
    "name": "my-semantic-config",
    "prioritizedFields": {
      "titleField": {"fieldName": "title"},
      "contentFields": [{"fieldName": "content"}]
    }
  }
}
```

> **Field types:** `Edm.String`, `Edm.Int32`, `Edm.Int64`, `Edm.Double`, `Edm.Boolean`, `Edm.DateTimeOffset`, `Collection(Edm.Single)` (for vectors).
>
> **Field attributes:** `searchable`, `filterable`, `sortable`, `facetable`, `retrievable`, `key`.

### REST API — Azure AI Search: create skillset (AI enrichment)

```
PUT https://<search-service>.search.windows.net/skillsets/<skillset-name>?api-version=2024-07-01
Headers:
  api-key: <admin-api-key>
  Content-Type: application/json
```

```json
{
  "name": "my-skillset",
  "description": "Enrichment pipeline with OCR + entity recognition + key phrases",
  "skills": [
    {
      "@odata.type": "#Microsoft.Skills.Vision.OcrSkill",
      "name": "ocr-skill",
      "context": "/document/normalized_images/*",
      "inputs": [{"name": "image", "source": "/document/normalized_images/*"}],
      "outputs": [{"name": "text", "targetName": "ocrText"}]
    },
    {
      "@odata.type": "#Microsoft.Skills.Text.EntityRecognitionSkill",
      "name": "entity-skill",
      "context": "/document",
      "categories": ["Person", "Organization", "Location"],
      "inputs": [{"name": "text", "source": "/document/content"}],
      "outputs": [{"name": "persons", "targetName": "people"}, {"name": "organizations", "targetName": "orgs"}]
    },
    {
      "@odata.type": "#Microsoft.Skills.Text.KeyPhraseExtractionSkill",
      "name": "keyphrase-skill",
      "context": "/document",
      "inputs": [{"name": "text", "source": "/document/content"}],
      "outputs": [{"name": "keyPhrases", "targetName": "keyPhrases"}]
    },
    {
      "@odata.type": "#Microsoft.Skills.Custom.WebApiSkill",
      "name": "custom-skill",
      "uri": "https://my-function-app.azurewebsites.net/api/enrich",
      "httpMethod": "POST",
      "context": "/document",
      "inputs": [{"name": "text", "source": "/document/content"}],
      "outputs": [{"name": "customResult", "targetName": "customEnrichment"}]
    }
  ],
  "cognitiveServices": {
    "@odata.type": "#Microsoft.Azure.Search.CognitiveServicesByKey",
    "key": "<cognitive-services-key>"
  }
}
```

> **Built-in skill `@odata.type` values to know:**
>
> | Skill | `@odata.type` |
> |---|---|
> | OCR | `#Microsoft.Skills.Vision.OcrSkill` |
> | Entity Recognition | `#Microsoft.Skills.Text.EntityRecognitionSkill` |
> | Key Phrase Extraction | `#Microsoft.Skills.Text.KeyPhraseExtractionSkill` |
> | Language Detection | `#Microsoft.Skills.Text.LanguageDetectionSkill` |
> | Sentiment | `#Microsoft.Skills.Text.V3.SentimentSkill` |
> | Image Analysis | `#Microsoft.Skills.Vision.ImageAnalysisSkill` |
> | Merge (combine text) | `#Microsoft.Skills.Text.MergeSkill` |
> | Custom Web API | `#Microsoft.Skills.Custom.WebApiSkill` |

### REST API — Azure AI Search: create indexer

```
PUT https://<search-service>.search.windows.net/indexers/<indexer-name>?api-version=2024-07-01
Headers:
  api-key: <admin-api-key>
  Content-Type: application/json
```

```json
{
  "name": "my-indexer",
  "dataSourceName": "my-blob-datasource",
  "targetIndexName": "my-index",
  "skillsetName": "my-skillset",
  "fieldMappings": [
    {"sourceFieldName": "metadata_storage_path", "targetFieldName": "id", "mappingFunction": {"name": "base64Encode"}},
    {"sourceFieldName": "metadata_storage_name", "targetFieldName": "title"}
  ],
  "outputFieldMappings": [
    {"sourceFieldName": "/document/people", "targetFieldName": "persons"},
    {"sourceFieldName": "/document/keyPhrases", "targetFieldName": "keyPhrases"}
  ],
  "parameters": {
    "configuration": {
      "imageAction": "generateNormalizedImages",
      "dataToExtract": "contentAndMetadata"
    }
  },
  "schedule": {
    "interval": "PT2H"
  }
}
```

> **Key:** `fieldMappings` = source-to-index field mapping. `outputFieldMappings` = enrichment output-to-index mapping. `imageAction: "generateNormalizedImages"` is required for OCR skills.

### Python snippet — Document Intelligence client (setup)
```python
# pip install azure-ai-documentintelligence
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient

endpoint = os.environ["AZURE_DOCINTEL_ENDPOINT"]
key = os.environ["AZURE_DOCINTEL_KEY"]

di = DocumentIntelligenceClient(endpoint=endpoint, credential=AzureKeyCredential(key))
```

### Key docs
- [Document Intelligence quickstart](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/quickstarts/get-started-sdks-rest-api?view=doc-intel-4.0.0)
- [Invoice model documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/invoice?view=doc-intel-4.0.0)
- [Document Intelligence SDK usage guide](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/how-to-guides/use-sdk-rest-api?view=doc-intel-4.0.0)
- [Azure AI Search quickstart (portal)](https://learn.microsoft.com/en-us/azure/search/search-get-started-portal)
- [Azure AI Search quickstart (code)](https://learn.microsoft.com/en-us/azure/search/search-get-started-text)

---

## Guardrails / Content Safety (cross-cutting; shows up in Plan & Manage)

### Know this cold
- Content Safety can analyze **text and images** for harmful content categories with severity levels.
- SDK provides `ContentSafetyClient` + optional blocklist management.

### Content Safety categories (memorize: 4 categories, severity 0–6)

| Category | What it detects |
|---|---|
| **Hate** | Hate speech, discrimination, slurs |
| **Sexual** | Sexually explicit or suggestive content |
| **Violence** | Violent acts, threats, graphic content |
| **Self-harm** | Self-injury, suicide references |

> **Severity scale:** 0 (safe) → 2 (low) → 4 (medium) → 6 (high). Even numbers only.

### SDK at a glance

| Service | Package | Client class | Key method |
|---|---|---|---|
| Content Safety | `azure-ai-contentsafety` | `ContentSafetyClient` | `.analyze_text(AnalyzeTextOptions(...))` |

### REST API — Content Safety: analyze text

```
POST https://<contentsafety-endpoint>/contentsafety/text:analyze?api-version=2024-09-01
Headers:
  Ocp-Apim-Subscription-Key: <your-contentsafety-key>
  Content-Type: application/json
```

```json
{
  "text": "I hate you and want to hurt you.",
  "categories": ["Hate", "Violence", "Sexual", "SelfHarm"],
  "blocklistNames": ["my-custom-blocklist"],
  "haltOnBlocklistHit": true,
  "outputType": "FourSeverityLevels"
}
```

> **Sample response:**
```json
{
  "categoriesAnalysis": [
    {"category": "Hate", "severity": 2},
    {"category": "SelfHarm", "severity": 0},
    {"category": "Sexual", "severity": 0},
    {"category": "Violence", "severity": 4}
  ],
  "blocklistsMatch": []
}
```

> **Key options:**
> - `outputType`: `"FourSeverityLevels"` (0, 2, 4, 6) or `"EightSeverityLevels"` (0–7).
> - `blocklistNames`: reference custom blocklists you've created for domain-specific blocked terms.
> - `haltOnBlocklistHit`: if `true`, stops analysis immediately when a blocklist match is found.

### REST API — Content Safety: analyze image

```
POST https://<contentsafety-endpoint>/contentsafety/image:analyze?api-version=2024-09-01
Headers:
  Ocp-Apim-Subscription-Key: <your-contentsafety-key>
  Content-Type: application/json
```

```json
{
  "image": {
    "content": "<base64-encoded-image-data>"
  },
  "categories": ["Hate", "Violence", "Sexual", "SelfHarm"]
}
```

> **Alternative:** use `"url": "https://..."` instead of `"content"` for URL-based images.

### REST API — Content Safety: manage blocklists

```
PUT https://<contentsafety-endpoint>/contentsafety/text/blocklists/<blocklist-name>?api-version=2024-09-01
Headers:
  Ocp-Apim-Subscription-Key: <your-contentsafety-key>
  Content-Type: application/json
```

```json
{
  "description": "Custom blocklist for prohibited terms"
}
```

**Add items to blocklist:**

```
POST https://<contentsafety-endpoint>/contentsafety/text/blocklists/<blocklist-name>:addOrUpdateBlocklistItems?api-version=2024-09-01
```

```json
{
  "blocklistItems": [
    {"description": "offensive term 1", "text": "badword1"},
    {"description": "offensive term 2", "text": "badword2"}
  ]
}
```

### Python snippet — analyze text with Content Safety
```python
# pip install azure-ai-contentsafety
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions

endpoint = os.environ["AZURE_CONTENTSAFETY_ENDPOINT"]
key = os.environ["AZURE_CONTENTSAFETY_KEY"]

cs = ContentSafetyClient(endpoint, AzureKeyCredential(key))

resp = cs.analyze_text(AnalyzeTextOptions(text="I hate you."))
for item in resp.categories_analysis:
    print(item.category, item.severity)
```

### Key docs
- [Azure AI Content Safety Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-contentsafety-readme?view=azure-python)
- [Content Safety quickstart (text)](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/quickstart-text)

---

<a name="limits"></a>
## File types, sizes & input limits

### One table — all services

| Service | Accepted formats | Max size | Key gotcha |
|---|---|---|---|
| **Vision (v4.0)** | JPEG, PNG, GIF, BMP, WEBP, ICO, TIFF, MPO | **20 MB** | v3.2 was only 4 MB |
| **Custom Vision (train)** | JPEG, PNG, BMP, GIF | **6 MB** | Prediction limit is **4 MB** (different!) |
| **Doc Intelligence (Free)** | PDF, JPEG, PNG, BMP, TIFF, HEIF | **4 MB / 2 pages** | DOCX/PPTX/XLSX only with Read & Layout — **not** prebuilt/custom |
| **Doc Intelligence (S0)** | same + DOCX, PPTX, XLSX (Read/Layout only) | **500 MB / 2,000 pages** | Huge jump from Free tier |
| **Language — sync** | plain text | **5,120 chars/doc** | Use async for longer docs (125K chars) |
| **Language — docs/request** | — | PII & NER: **5**, Sentiment: **10**, Lang Detect: **1,000** | Limits differ per feature |
| **Question Answering KB** | PDF, DOCX, TXT, TSV, XLSX, URLs | PDF **25 MB**, XLSX only **3 MB** | XLSX is the smallest limit |
| **Speech REST API** | **WAV, OGG only** | Batch: **1 GB**, TTS: **10 min** | SDK supports MP3/FLAC/etc. — REST does not! |
| **Content Safety (text)** | plain text | **10,000 chars** | — |
| **Content Safety (image)** | JPEG, PNG, GIF, BMP, TIFF, WEBP | **4 MB** (50–7,200 px) | — |
| **AI Search** | any (via indexer) | Doc: **~16 MB**, Blob: **16–256 MB** by tier | Blob limit scales with tier |
| **OpenAI — "On Your Data"** | — | **16 MB** per file | Fine-tuning is 512 MB — very different! |
| **Translator (text)** | plain text | **50,000 chars/element** | — |
| **Translator (doc, async)** | PDF, DOCX, PPTX, XLSX, TXT, HTML, MSG | **40 MB** (sync: 10 MB) | Glossary: XLIFF, TSV, CSV |

### Exam traps — speed round

- **Custom Vision:** training = 6 MB, prediction = 4 MB. Min **5** images/tag (classify), **15** (detect).
- **Doc Intelligence:** DOCX/PPTX work with Read & Layout **only** — not prebuilt or custom models.
- **Language:** sync = 5,120 chars. Need more? Use **async** (125K). PII/NER = 5 docs, Sentiment = 10.
- **Speech REST:** WAV + OGG **only**. Want MP3? Use the **SDK**.
- **QnA KB sources:** PDF 25 MB, DOCX/TXT/TSV 10 MB, XLSX **3 MB** (the odd one out).
- **OpenAI file upload:** "On Your Data" = 16 MB. Fine-tuning = 512 MB. Don't mix them up.

---

<a name="hooks"></a>
## Quick memorization hooks

### Service disambiguation
- **Search != Language**: Search retrieves documents; Language analyzes text (sentiment/entities/PII).
- **Vision OCR != Document Intelligence**: OCR = raw text from images; Doc Intel = structured fields from forms.
- **Custom Vision != Image Analysis**: Custom Vision = you train a model; Image Analysis = prebuilt features.
- **Video Indexer != Spatial Analysis**: Indexer = content insights (faces/topics); Spatial = real-time movement/counting.
- **Speech Translation != Translator**: Speech = spoken audio; Translator = written text.

### Workflow mnemonics
- **Custom Vision workflow — "CTPC"**: Create project → Tag images → Publish model → Consume endpoint.
- **Custom Question Answering — "CSTTPC"**: Create KB → add Sources → Train → Test → Publish → Consume.
- **Search pipeline — "DISIQ"**: Data source → Indexer → Skillset → Index → Query.
- **RAG pattern — "RPC"**: Retrieve context → assemble Prompt → Call model.

### Parameter mnemonics
- **Temperature**: think "thermometer" — low = cold/rigid, high = hot/wild.
- **top_p**: "p for pool" — low = tiny pool of tokens, high = big pool.
- Change **one** of temperature/top_p, **not both**.

### Safety mnemonics
- **Content Safety 4 categories — "HSVS"**: Hate, Sexual, Violence, Self-harm.
- **Severity scale**: even numbers only — **0, 2, 4, 6**.
- **Responsible AI stack**: content filters + blocklists + prompt shields + harm detection.

### SDK pattern
- **SSML** = XML (not JSON!) — `<speak>`, `<voice>`, `<prosody>` tags.
- Every Azure AI SDK follows: `pip install azure-ai-XXXXX` → create client with endpoint + credential → call method.

---

<a name="quickref"></a>
## Quick-reference tables

### All pip packages in one place

```
pip install azure-identity
pip install azure-ai-vision-imageanalysis
pip install azure-ai-textanalytics
pip install azure-search-documents
pip install azure-ai-documentintelligence
pip install azure-ai-contentsafety
pip install openai
```

### All REST API endpoints at a glance

| Service | Endpoint pattern | Key header |
|---|---|---|
| Azure OpenAI | `https://<resource>.openai.azure.com/openai/deployments/<deploy>/chat/completions?api-version=...` | `api-key` |
| Language (all) | `https://<resource>/language/:analyze-text?api-version=2022-05-01` | `Ocp-Apim-Subscription-Key` |
| Question Answering | `https://<resource>/language/:query-knowledgebases?projectName=...&deploymentName=...` | `Ocp-Apim-Subscription-Key` |
| Vision (Image Analysis) | `https://<resource>/computervision/imageanalysis:analyze?features=...&api-version=2024-02-01` | `Ocp-Apim-Subscription-Key` |
| Custom Vision (predict) | `https://<resource>.cognitiveservices.azure.com/customvision/v3.0/Prediction/<project>/classify/...` | `Prediction-Key` |
| Speech STT | `https://<region>.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=...` | `Ocp-Apim-Subscription-Key` |
| Speech TTS | `https://<region>.tts.speech.microsoft.com/cognitiveservices/v1` | `Ocp-Apim-Subscription-Key` |
| Translator | `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=...` | `Ocp-Apim-Subscription-Key` + `Ocp-Apim-Subscription-Region` |
| Document Intelligence | `https://<resource>/documentintelligence/documentModels/<model>:analyze?api-version=...` | `Ocp-Apim-Subscription-Key` |
| AI Search (query) | `https://<service>.search.windows.net/indexes/<index>/docs/search?api-version=...` | `api-key` |
| AI Search (admin) | `https://<service>.search.windows.net/indexes/<index>?api-version=...` | `api-key` (admin) |
| Content Safety | `https://<resource>/contentsafety/text:analyze?api-version=...` | `Ocp-Apim-Subscription-Key` |

> **Pattern:** Most services use `Ocp-Apim-Subscription-Key`. Azure OpenAI and AI Search use `api-key`. Translator additionally needs `Ocp-Apim-Subscription-Region`.

### All client classes at a glance

| Domain | Package | Client class | Key method(s) |
|---|---|---|---|
| Auth | `azure-identity` | — | `DefaultAzureCredential()` |
| Azure OpenAI | `openai` | `OpenAI` | `.responses.create()` |
| AI Search | `azure-search-documents` | `SearchClient` | `.search()` |
| Vision (Image Analysis) | `azure-ai-vision-imageanalysis` | `ImageAnalysisClient` | `.analyze()` |
| Language (Text Analytics) | `azure-ai-textanalytics` | `TextAnalyticsClient` | `.analyze_sentiment()`, `.recognize_entities()`, `.recognize_pii_entities()`, `.extract_key_phrases()`, `.detect_language()` |
| Document Intelligence | `azure-ai-documentintelligence` | `DocumentIntelligenceClient` | `.begin_analyze_document()` |
| Content Safety | `azure-ai-contentsafety` | `ContentSafetyClient` | `.analyze_text()` |

### Common auth pattern (every SDK)

```python
# Option A: API key (quick dev)
from azure.core.credentials import AzureKeyCredential
client = SomeClient(endpoint, AzureKeyCredential(key))

# Option B: Entra ID / managed identity (production — recommended)
from azure.identity import DefaultAzureCredential
client = SomeClient(endpoint, DefaultAzureCredential())
```

---

<a name="refs"></a>
## Reference links (official docs + samples)
- [AI‑102 study guide (skills measured)](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102)
- [Azure AI Search Python samples](https://learn.microsoft.com/en-us/azure/search/samples-python)
- [Azure AI Search Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/search-documents-readme?view=azure-python)
- [Azure AI Search quickstart (portal)](https://learn.microsoft.com/en-us/azure/search/search-get-started-portal)
- [Azure OpenAI Responses API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses?view=foundry-classic)
- [Azure AI Vision documentation](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/)
- [Vision OCR quickstart](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/quickstarts-sdk/client-library)
- [Vision Image Analysis Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-vision-imageanalysis-readme?view=azure-python)
- [Custom Vision documentation](https://learn.microsoft.com/en-us/azure/ai-services/custom-vision-service/)
- [Azure Video Indexer documentation](https://learn.microsoft.com/en-us/azure/azure-video-indexer/)
- [Azure AI Language / Text Analytics Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-textanalytics-readme?view=azure-python)
- [Azure Speech Service documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [Document Intelligence quickstart](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/quickstarts/get-started-sdks-rest-api?view=doc-intel-4.0.0)
- [Document Intelligence invoice model](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/invoice?view=doc-intel-4.0.0)
- [Document Intelligence Python SDK guide](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/how-to-guides/use-sdk-rest-api?view=doc-intel-4.0.0)
- [Azure AI Content Safety Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-contentsafety-readme?view=azure-python)
- [Content Safety quickstart (text)](https://learn.microsoft.com/en-us/azure/ai-services/content-safety/quickstart-text)
