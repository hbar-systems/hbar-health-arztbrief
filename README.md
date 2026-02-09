# hbar.health v0 — Anamnese → Arztbrief (German, draft-only)

A boring, predictable, safe prototype that converts structured anamnesis input
into a draft Arztbrief in conservative medical German.

**This system does not diagnose, does not recommend treatment, and does not decide.**

## Quick Start

```bash
npm install
npm run dev
```

## Structure

```
app/          – UI, schema, constraints, template, orchestration, postprocess
prompts/      – plain-text prompt template (dumb, literal, non-creative)
docs/         – boundaries ("what this will never do")
```

## Pipeline

1. Structured input: Hauptproblem, Beschwerden, Zeitlicher Verlauf, Vorerkrankungen, Medikation, Unsicherheit
2. Input validation (code, not prompt)
3. LLM generates prose for 4 sections (Anamnese, Klinischer Befund, Beurteilung, Weiteres Vorgehen)
4. Deterministic template assembly with ENTWURF header + disclaimer
5. Post-processing: forbidden pattern redaction, tone enforcement, imperative softening
6. Output validation: no diagnosis injection, uncertainty preservation, hedging check

## Non-Goals

- No diagnosis engine
- No treatment recommendations
- No EHR integration
- No storage, accounts, or analytics

## Boundaries

See `docs/boundaries.md`.
