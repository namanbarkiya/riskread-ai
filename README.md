# RiskRead AI

## 📋 Project Overview

**RiskRead AI** is a minimal, production-focused AI tool that lets you:

- Upload a contract or PDF from a single landing page
- Run an AI-powered risk analysis using **Google Gemini**
- View a rich, single-report analysis page (scores, insights, recommendations)
- Download a **full PDF report** of the analysis

There is **no authentication** and **no external database** – it is designed to be quick to try and easy to host.

**Current stack**

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui components, custom dark dashboard
- **State & Data**: TanStack Query (React Query)
- **AI**: Google Gemini (via `lib/services/gemini-client.ts`)
- **PDF reports**: jsPDF (`lib/utils/pdf-report.ts`)
- **Storage**:
  - Uploaded files saved temporarily to `public/uploads/`
  - Analysis metadata + results kept in an **in‑memory store** (`lib/store/analysis-store.ts`)
  - Latest completed analysis cached in **browser localStorage**

## 🚀 Quick Start

### Prerequisites

- Node.js **18+**
- A **Gemini API key**

### 1. Install dependencies

```bash
git clone git@github.com:namanbarkiya/readrisk-ai.git
cd readrisk-ai
npm install
```

### 2. Configure environment

Copy the example env file and set at least your Gemini key:

```bash
cp env-example.env .env.local
```

Required for local use:

- `GEMINI_API_KEY` – your Google Gemini API key

Supabase-related variables in `env-example.env` are **legacy** and can be left empty; Supabase is no longer used.

### 3. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 📁 Main Project Structure (current product)

```text
readrisk-ai/
├── app/
│   ├── page.tsx                 # Landing page with upload & recent analysis
│   ├── analysis/[id]/page.tsx   # Single analysis report page
│   └── api/
│       ├── upload/route.ts      # Handles file uploads to /public/uploads
│       ├── analysis/route.ts    # Create/list analyses (in-memory)
│       └── analysis/[id]/*      # Status & results endpoints
├── components/
│   ├── analysis/                # File upload, progress, results UI
│   └── ui/                      # Shared UI (buttons, cards, logo, magicui)
├── lib/
│   ├── services/
│   │   └── analysis-service.ts  # Orchestrates extraction, Gemini, scoring
│   ├── store/
│   │   └── analysis-store.ts    # In‑memory analysis/result store (no DB)
│   ├── utils/
│   │   ├── pdf-report.ts        # Client-side PDF report generation
│   │   ├── file-upload.ts       # Upload helpers
│   │   └── analysis-cache.ts    # localStorage cache helpers
│   ├── query/hooks/analysis.ts  # React Query hooks
│   └── hooks/use-dark-mode.ts   # Theme toggle
└── public/
    └── uploads/                 # Temporary uploaded files (gitignored)
```

## 🎯 Product Behaviour

### Landing page (`/`)

- Clean hero with **drag & drop upload**
- Validates file type/size and shows **upload/progress** states
- On successful upload and analysis creation:
  - Immediately redirects to `/analysis/[id]`
- If there is a cached analysis in this browser:
  - Shows a **“Recent Analysis”** card linking back to that report

### Analysis page (`/analysis/[id]`)

- Overview tab:
  - Large circular **overall score** (0–100)
  - Quick summary: risk level, counts, extracted fields
  - Full **Key Findings** list (no ellipses/truncation)
- Scores tab:
  - Per‑dimension scores (Relevance, Completeness, Risk, Clarity, Accuracy)
  - Weighted score summary and simple metrics
- Insights tab:
  - Insights grouped by **Risks / Strengths / Weaknesses / Opportunities**
  - Recommendations grouped by priority
  - Questions & clarifications from the model
- Details tab:
  - Extracted fields
  - Highlights
  - File metadata
- **Download report**:
  - One click PDF report generation on the client via `jsPDF`

### Storage & lifecycle

- When a file is uploaded:
  - It is written to `public/uploads/<generated-name>` for the duration of analysis.
  - `analysis-service` reads/extracts content and calls Gemini.
  - Once the analysis finishes **or fails**, the file is **deleted automatically**.
- Analysis metadata + results:
  - Stored in memory (`analysisStore`) and **auto‑cleaned** a few minutes after completion.
  - The latest finished analysis is cached in the browser via `localStorage` so the user can revisit it even after a server restart.

## 🔧 Development Notes

- This branch is intentionally minimal:
  - No auth
  - No Supabase
  - No multi‑tenant history UI
- Some legacy folders (`app/dashboard`, Supabase helpers) may still exist but are not used by the current product.

To experiment with the analysis logic, see:

- `lib/services/analysis-service.ts`
- `lib/services/gemini-client.ts`

To tweak the report layout, see:

- `app/analysis/[id]/page.tsx` (overview layout)
- `lib/utils/pdf-report.ts` (PDF export)

## 📝 License

This project is proprietary software. All rights reserved.
