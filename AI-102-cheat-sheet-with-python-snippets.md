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
7. [Quick memorization hooks](#hooks)
8. [Quick-reference tables](#quickref)
9. [Reference links](#refs)

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
- Forgetting the **Custom Question Answering** workflow: create KB → add sources (URLs/files/editorial) → train → test → publish → consume via REST.

### Python snippet — create a TextAnalyticsClient
```python
# pip install azure-ai-textanalytics
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient

endpoint = os.environ["AZURE_LANGUAGE_ENDPOINT"]
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
