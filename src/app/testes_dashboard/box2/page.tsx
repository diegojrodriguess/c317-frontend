"use client";

import { useEffect, useRef, useState } from "react";
import AudioService from "@/services/AudioService";
import styles from "./page.module.css";

const MAX_SECONDS = 30;

export default function FonemasPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Derive evaluation when backend doesn't provide one
  const deriveEvaluation = (res: any) => {
    const explicit = res?.evaluation || res?.assessment;
    if (explicit) return explicit;
    const s = res?.score;
    if (typeof s === "number") {
      if (s >= 80) return "Excelente";
      if (s >= 60) return "Bom";
      if (s >= 40) return "Regular";
      return "Precisa melhorar";
    }
    return undefined;
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const cancelRef = useRef<boolean>(false);

  const ACTIVITY_KEY = "repeticao_fonemas";
  const ACTIVITY_LABEL = "Repetição de Fonemas e Pares Mínimos";

  const FALLBACK_PROMPTS = [
    {
      title: "O Pato e o Bato",
      text: "O pato pulou na poça, mas o bato bateu na borda...",
    },
    {
      title: "Tina e Dina",
      text: "Tina toca tambor toda tarde, enquanto Dina dança...",
    },
    {
      title: "Sapo Sábio",
      text: "O sapo sabia saltar sem se sujar. Mas o xale do xamã...",
    },
  ];

  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);

  const mmss = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= MAX_SECONDS) stopRecording(true);
        return next;
      });
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await AudioService.generateTasks(ACTIVITY_KEY, 5, {
          include_meta: true,
          use_ai: true,
        });

        const items = Array.isArray(res?.items) ? res.items : [];

        if (mounted && items.length) {
          setPrompts(items);
          const first = items[0];
          setSelectedPrompt(first);
        } else {
          setPrompts(FALLBACK_PROMPTS);
          setSelectedPrompt(FALLBACK_PROMPTS[0]);
        }
      } catch {
        if (mounted) {
          setPrompts(FALLBACK_PROMPTS);
          setSelectedPrompt(FALLBACK_PROMPTS[0]);
        }
      }
    })();

    return () => {
      mounted = false;
      stopTimer();
      cleanupStreams();
    };
  }, []);

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      setAudioURL(null);
      setAudioBlob(null);
      setProcessingResult(null);
      chunksRef.current = [];

      // Feature checks for better diagnostics
      if (!navigator?.mediaDevices?.getUserMedia) {
        setErrorMsg("Seu navegador não suporta captura de áudio (getUserMedia). Tente Chrome ou Firefox.");
        return;
      }
      if (typeof MediaRecorder === "undefined") {
        setErrorMsg("Seu navegador não suporta gravação de áudio (MediaRecorder). Tente Chrome ou Firefox.");
        return;
      }

      if (!selectedPrompt) {
        const pool = prompts.length ? prompts : FALLBACK_PROMPTS;
        const idx = Math.floor(Math.random() * pool.length);
        setSelectedPrompt(pool[idx]);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const MIME_CANDIDATES = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/mp4",
        "audio/wav",
        ""
      ];
      const supported = MIME_CANDIDATES.find((m) => !m || MediaRecorder.isTypeSupported(m)) || "";
      const mimeType = supported || "audio/webm";

      let recorder: MediaRecorder;
      try {
        recorder = supported
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch {
        throw new Error("Formato não suportado pelo navegador.");
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (cancelRef.current) {
          cancelRef.current = false;
          chunksRef.current = [];
          return;
        }

        const finalMime = mimeType.split(";")[0] || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: finalMime });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };

      // Start recording with a time slice if supported; fallback to start() otherwise
      try {
        recorder.start(100);
      } catch (e) {
        try { recorder.start(); } catch (e2) {
          throw new Error("Não foi possível iniciar a gravação.");
        }
      }
      setIsRecording(true);
      setElapsed(0);
      startTimer();
    } catch (err: any) {
      let msg = "Erro ao iniciar gravação.";
      if (err?.name === "NotAllowedError") msg = "Permissão de microfone negada. Autorize o acesso nas configurações do navegador.";
      else if (/Formato/i.test(err?.message) || /MediaRecorder/i.test(err?.message)) msg = "Seu navegador não suporta os formatos necessários. Tente Chrome ou Firefox.";
      setErrorMsg(msg);
      cleanupStreams();
    }
  };

  const stopRecording = (auto = false) => {
    stopTimer();
    setIsRecording(false);
    if (mediaRecorderRef.current?.state === "recording")
      mediaRecorderRef.current.stop();

    cleanupStreams();
    if (auto) setElapsed(MAX_SECONDS);
  };

  const sendToBackend = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);
  // Libere o microfone durante o upload
  cleanupStreams();
      const result = await AudioService.uploadAudio(audioBlob, {
        targetWord: selectedPrompt?.text,
        provider: "gemini",
        mimeType: audioBlob.type || "audio/ogg",
      });
      // Some backends wrap the payload in { data: ... }; normalize it
      setProcessingResult((result as any)?.data ?? result);
    } catch {
      setErrorMsg("Erro ao enviar áudio para análise.");
    } finally {
      setIsUploading(false);
    }
  };

  const cleanupStreams = () => {
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{ACTIVITY_LABEL}</h1>
        <p className={styles.subtitle}>
          Pressione o microfone e leia o texto abaixo. O teste encerra em {MAX_SECONDS}s.
        </p>

        {selectedPrompt && (
          <div className={`${styles.prompt} ${styles.promptOpen}`}>
            <h2 className={styles.promptTitle}>{selectedPrompt.title}</h2>
            <p className={styles.promptBody}>{selectedPrompt.text}</p>
          </div>
        )}

        <button
          className={`${styles.micButton} ${isRecording ? styles.micActive : ""}`}
          onClick={() => (isRecording ? stopRecording() : startRecording())}
        >
          {isRecording ? "Parar" : "Iniciar"}
        </button>

        <div className={styles.timer}>{mmss(elapsed)}</div>

        {audioURL && (
          <>
            <audio controls src={audioURL} style={{ marginTop: 20 }} />

            <div className={styles.actions}>
              <button
                className={styles.secondary}
                onClick={() => {
                  setAudioURL(null);
                  setAudioBlob(null);
                  setProcessingResult(null);
                  setElapsed(0);
                }}
              >
                Descartar
              </button>

              <button
                className={styles.primary}
                onClick={sendToBackend}
                disabled={isUploading}
              >
                {isUploading ? "Enviando..." : "Enviar para análise"}
              </button>
            </div>
          </>
        )}

        {processingResult && (
          <div className={styles.resultBox}>
            <h3>Resultado da Análise</h3>
            <p><strong>Transcrição:</strong> {processingResult.transcription || "-"}</p>
            <p><strong>Pontuação:</strong> {typeof processingResult.score === "number" ? processingResult.score : (processingResult.score ?? "-")}</p>
            {typeof processingResult.match !== "undefined" && (
              <p><strong>Match:</strong> {String(processingResult.match)}</p>
            )}
            <p><strong>Avaliação:</strong> {deriveEvaluation(processingResult) || "-"}</p>
            <p><strong>Feedback:</strong> {processingResult.feedback || processingResult.message || processingResult.audioMessage || "-"}</p>
          </div>
        )}

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
}
