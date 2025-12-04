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

      recorder.start(100);
      setIsRecording(true);
      setElapsed(0);
      startTimer();
    } catch (err: any) {
      setErrorMsg("Erro ao iniciar gravação. Verifique o microfone.");
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
      cleanupStreams();

      const result = await AudioService.uploadAudio(audioBlob, {
        targetWord: selectedPrompt?.text,
        provider: "gemini",
        mimeType: audioBlob.type || "audio/ogg",
      });

      setProcessingResult(result.data);
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
            <p><strong>Transcrição:</strong> {processingResult.transcription}</p>
            <p><strong>Pontuação:</strong> {processingResult.score}</p>
            <p><strong>Mensagem:</strong> {processingResult.audioMessage}</p>
          </div>
        )}

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
}
