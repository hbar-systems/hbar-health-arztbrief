/**
 * Optional audio ingestion: upload/record → transcribe → extract fields → user confirms → apply to form.
 * Transcription is stubbed (no backend). No data stored. No automatic diagnosis extraction.
 */

import React, { useState, useRef } from "react";
import type { AnamneseInput } from "./inputSchema";
import type { Lang, Strings } from "./i18n";
import type { ThemeColors } from "./theme";

/** ~15 MB ≈ 10 minutes of compressed audio (webm/opus or mp3). */
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

interface AudioModuleProps {
  s: Strings;
  c: ThemeColors;
  lang: Lang;
  onApply: (fields: Partial<AnamneseInput>) => void;
}

// ---------------------------------------------------------------------------
// Stub: transcribe audio → text
// ---------------------------------------------------------------------------

async function stubTranscribe(_file: File, lang: Lang): Promise<string> {
  // TODO: wire to Whisper or other transcription endpoint
  console.warn("[AudioModule] Transcription is stubbed — returning placeholder.");
  await new Promise((r) => setTimeout(r, 1200));
  if (lang === "en") {
    return (
      "Patient presents with retrosternal chest pain since this morning, " +
      "radiating to the left arm, accompanied by dyspnea on exertion. " +
      "Known type 2 diabetes mellitus, arterial hypertension. " +
      "Current medication: Metformin 1000 mg 1-0-1, Ramipril 5 mg 1-0-0. " +
      "Time course: acute."
    );
  }
  return (
    "Patient stellt sich vor mit seit heute Morgen bestehenden retrosternalen Brustschmerzen, " +
    "Ausstrahlung in den linken Arm, begleitend Belastungsdyspnoe. " +
    "Bekannter Diabetes mellitus Typ 2, arterielle Hypertonie. " +
    "Aktuelle Medikation: Metformin 1000\u2009mg 1-0-1, Ramipril 5\u2009mg 1-0-0. " +
    "Zeitlicher Verlauf: akut."
  );
}

// ---------------------------------------------------------------------------
// Stub: extract structured fields from transcript
// ---------------------------------------------------------------------------

async function stubExtractFields(_transcript: string): Promise<Partial<AnamneseInput>> {
  // TODO: wire to LLM extraction endpoint
  console.warn("[AudioModule] Field extraction is stubbed — returning placeholder fields.");
  await new Promise((r) => setTimeout(r, 800));
  return {
    hauptproblem: "Retrosternale Brustschmerzen seit heute Morgen",
    aktuelleBeschwerden: ["Retrosternale Brustschmerzen mit Ausstrahlung in den linken Arm", "Belastungsdyspnoe"],
    zeitlicherVerlauf: "akut",
    vorerkrankungen: ["Diabetes mellitus Typ 2", "Arterielle Hypertonie"],
    medikation: ["Metformin 1000\u2009mg 1-0-1", "Ramipril 5\u2009mg 1-0-0"],
    unsicherheit: "hoch",
  };
}

export function AudioModule({ s, c, lang, onApply }: AudioModuleProps) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [extractedFields, setExtractedFields] = useState<Partial<AnamneseInput> | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Styles ---
  const boxStyle: React.CSSProperties = {
    border: `1px solid ${c.border}`,
    borderRadius: 6,
    padding: open ? "1rem" : "0.6rem 1rem",
    marginBottom: "1rem",
    background: c.card,
  };
  const toggleStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
    color: c.accent,
    padding: 0,
  };
  const btnStyle: React.CSSProperties = {
    padding: "0.4rem 0.9rem",
    fontSize: "0.82rem",
    fontWeight: 500,
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    background: c.card,
    color: c.text,
    cursor: "pointer",
  };
  const primaryBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: c.accent,
    color: c.btnText,
    border: "none",
  };
  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 100,
    padding: "0.5rem",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    background: c.inputBg,
    color: c.text,
    resize: "vertical",
    boxSizing: "border-box",
  };

  // --- Handlers ---

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      setError(s.audioFileTooLarge);
      return;
    }
    setAudioFile(file);
    setTranscript("");
    setExtractedFields(null);
    setApplied(false);
    setError("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > MAX_AUDIO_BYTES) {
          setError(s.audioFileTooLarge);
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setAudioFile(file);
        setTranscript("");
        setExtractedFields(null);
        setApplied(false);
        stream.getTracks().forEach((tr) => tr.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setError("");
    } catch {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleTranscribe = async () => {
    if (!consent) {
      setError(s.audioNoConsent);
      return;
    }
    if (!audioFile) {
      setError(s.audioNoFile);
      return;
    }
    setError("");
    setTranscribing(true);
    try {
      const text = await stubTranscribe(audioFile, lang);
      setTranscript(text);
    } finally {
      setTranscribing(false);
    }
  };

  const handleExtract = async () => {
    setExtracting(true);
    setError("");
    try {
      const fields = await stubExtractFields(transcript);
      setExtractedFields(fields);
      setApplied(false);
    } finally {
      setExtracting(false);
    }
  };

  const handleApply = () => {
    if (extractedFields) {
      onApply(extractedFields);
      setApplied(true);
    }
  };

  return (
    <div style={boxStyle}>
      <button type="button" onClick={() => setOpen(!open)} style={toggleStyle}>
        {open ? "▾" : "▸"} {s.audioTitle}
      </button>

      {open && (
        <div style={{ marginTop: "0.75rem" }}>
          {/* Consent */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.82rem", color: c.text, marginBottom: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginTop: "0.15rem", accentColor: c.accent }}
            />
            <span>{s.audioConsent}</span>
          </label>

          {/* Upload / Record */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button type="button" onClick={handleUpload} style={btnStyle}>
              {s.audioUpload}
            </button>
            {!recording ? (
              <button type="button" onClick={startRecording} style={btnStyle}>
                {s.audioRecord}
              </button>
            ) : (
              <button type="button" onClick={stopRecording} style={{ ...btnStyle, color: c.errorText }}>
                {s.audioStopRecord}
              </button>
            )}
          </div>

          {/* Max size hint */}
          <p style={{ fontSize: "0.75rem", color: c.muted, margin: "0 0 0.5rem 0", fontStyle: "italic" }}>
            {s.audioMaxHint}
          </p>

          {/* File indicator */}
          {audioFile && (
            <p style={{ fontSize: "0.8rem", color: c.muted, margin: "0 0 0.5rem 0" }}>
              {audioFile.name} ({(audioFile.size / 1024).toFixed(1)} KB)
            </p>
          )}

          {/* Transcribe button */}
          {audioFile && !transcript && (
            <button
              type="button"
              onClick={handleTranscribe}
              disabled={transcribing}
              style={primaryBtnStyle}
            >
              {transcribing ? s.audioTranscribing : s.audioTranscribeBtn}
            </button>
          )}

          {/* Error */}
          {error && (
            <p style={{ color: c.errorText, fontSize: "0.82rem", margin: "0.5rem 0 0 0" }}>{error}</p>
          )}

          {/* Transcript */}
          {transcript && (
            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: c.text, display: "block", marginBottom: "0.3rem" }}>
                {s.audioTranscriptLabel}
              </label>
              <textarea
                style={textareaStyle}
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setExtractedFields(null);
                  setApplied(false);
                }}
              />

              {/* Extract button */}
              {!extractedFields && (
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting}
                  style={{ ...primaryBtnStyle, marginTop: "0.5rem" }}
                >
                  {extracting ? s.audioExtracting : s.audioExtractFields}
                </button>
              )}
            </div>
          )}

          {/* Extracted fields preview + apply */}
          {extractedFields && (
            <div style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              background: c.codeBg,
              borderRadius: 4,
              fontSize: "0.82rem",
              color: c.text,
              lineHeight: 1.6,
            }}>
              <strong style={{ display: "block", marginBottom: "0.4rem" }}>
                {s.audioExtractFields}:
              </strong>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {JSON.stringify(extractedFields, null, 2)}
              </pre>
              <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button type="button" onClick={handleApply} style={primaryBtnStyle} disabled={applied}>
                  {s.audioApplyToForm}
                </button>
                {applied && (
                  <span style={{ color: c.accent, fontSize: "0.8rem", fontWeight: 500 }}>
                    {s.audioApplied}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
