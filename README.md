## Article Drafting Assistant (MVP)

An AI-assisted low-code application built with Lovable.dev for the 24-Hour Low-Code Challenge.
The app helps editors turn interview transcripts and supporting sources into story-driven draft articles with human-in-the-loop (HITL) review.

## Project info

**URL**: https://lovable.dev/projects/c0ce7ff5-53dc-48b3-89ce-f9d88c0b30fc

## 🚀 Problem Framing & Assumptions

Editors often need to quickly draft articles from long transcripts and multiple sources.
Manual summarization, source validation, and draft structuring take significant time.

## This MVP assumes:

- Inputs are public transcripts and public supporting sources (e.g., PDFs, URLs, YouTube links).

- Editors prefer a minimal, clean interface with clear HITL controls.

- (one transcript + one or more sources → approved points → draft → export) is the priority.

## 🏗️ Architecture

Frontend / Workflow:

- Built with Lovable.dev (low-code platform).

Pages:

- Start New Project (user enters project title and Brief Description).

- Upload Transcript & Sources.

- Key Point Extraction & Review (deduplicated key points → approve/edit/reorder).

- Set Story Direction (tone/angle/length).

- Draft Generation (outline/full draft with source mapping + quote checker).

- Export (Markdown + optional provenance JSON).

## 🔑 API Integration Notes

During development, I attempted to set up API integration for AI features using an OpenAI API key and Supabase.

Generated an OpenAI API key and tried connecting it with the project.

- Explored Supabase as a backend option.

- Due to connection/configuration issues, the integration was not fully successful.

⚠️ Because of this, two core features were not functional in the current version:

- Key Point Extraction → planned feature, but not working due to missing AI integration.

- Quote Checker → planned feature, but not working due to missing AI integration.

The rest of the flow (project creation, transcript/source upload, editor controls, and export) is functional.

## ✨ Features (Planned vs. Implemented)

- ✅ Project creation with custom title 
- ✅ Upload/paste transcript + attach supporting sources
- ✅ Dark/white theme toggle
- ✅ Export as Markdown (with optional provenance JSON placeholder)
- ❌ Key point extraction (not working — depends on API)
- ❌ Quote checker (not working — depends on API)


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



