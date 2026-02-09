# Boundaries — What This Will Never Do

This document defines hard limits for hbar.health v0.
These are not "nice to haves" — they are non-negotiable constraints.
They are enforced in code (`constraints.ts`, `postprocess.ts`), not just in prompts.

## 1. No Diagnosis

The system **does not diagnose**. It uses only hedging language:
"Verdacht auf…", "bei entsprechender Klinik…", "differentialdiagnostisch…".
Output containing unqualified diagnoses is redacted automatically.

## 2. No Treatment Decisions

The system **does not recommend, rank, or suggest treatments**.
Imperative treatment language ("muss operiert werden") is softened
or removed by the postprocess layer.

## 3. No Prognosis

The system **does not predict outcomes**. Prognostic statements
are forbidden patterns and are redacted on sight.

## 4. No Uncertainty Reduction

If the physician marks uncertainty as "hoch", the system **must not
produce text that implies lower uncertainty**. Uncertainty is preserved
or increased — never reduced. This is enforced in code.

## 5. No Patient-Facing Output

Generated letters are **physician-to-physician** (Arztbrief). The system
must never produce patient-facing summaries, explanations, or advice.

## 6. No Data Retention Beyond Session

The system **does not store patient data** after the session ends.
No accounts, no analytics, no persistence.

## 7. No Autonomous Action

The system **does not send, fax, or transmit** letters. It produces a draft.
A human physician reviews, edits, and sends. Every output is prepended with:
`ENTWURF – nicht zur direkten Verwendung ohne ärztliche Prüfung`

## 8. No Creative Writing

The tone is **sachlich, medizinisch-formal (Arztdeutsch)**. The LLM fills
structured sections from a fixed template. No hallucinated sections.

## 9. No Guarantee of Correctness

The output is a **draft**. Every output is appended with:
`Dieser Text stellt einen unterstützenden Entwurf dar und ersetzt keine ärztliche Entscheidung.`

## 10. No EHR Integration

v0 is standalone. No integration with electronic health record systems.
