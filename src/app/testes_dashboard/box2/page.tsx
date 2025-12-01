"use client";

import { useEffect, useRef, useState } from "react";
import AudioService from "@/services/AudioService";
import styles from "./page.module.css";

const MAX_SECONDS = 30; //tempo do teste

export default function FluenciaVerbalPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const PROMPTS = [
    {
      title: "O Pato e o Bato",
      text:
        "O pato pulou na poça, mas o bato bateu na borda. Pato, poça, pote, papel.Bato, bola, beco, banco. No final, o pato parou e o bato brincou — parecia um jogo de sons entre P e B!",
    },
    {
      title: "Tina e Dina",
      text:
        "Tina toca tambor toda tarde, enquanto Dina dança devagar. Teco, taco, toco, teto. Deco, daco, doco, dedo. Quando se encontram, trocam travessuras e testam quem tem a língua mais rápida.",
    },
    {
      title: "Sapo Sábio",
      text:
        "O sapo sabia saltar sem se sujar. Mas o xale do xamã chamava sua atenção. Sapo, saco, sela, sino. Chave, xale, chão, cheio. Entre o s e o x, o som muda e a boca também!",
    },
  ];
  
  const [selectedPrompt, setSelectedPrompt] =
    useState<{ title: string; text: string } | null>(null);

  // formata mm:ss
  const mmss = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const startTimer = () => {
    stopTimer(); // segurança
    timerRef.current = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1; 
        if (next >= MAX_SECONDS) {
          stopRecording(true); 
        }
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

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      setAudioURL(null);
      setAudioBlob(null);
      chunksRef.current = [];

      const idx = Math.floor(Math.random() * PROMPTS.length);
      setSelectedPrompt(PROMPTS[idx]);

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
      const supported = MIME_CANDIDATES.find(m => !m || MediaRecorder.isTypeSupported(m)) || "";
      const mimeType = supported || "audio/webm";

      let mr: MediaRecorder;
      try {
        mr = supported
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch {
        throw new Error("Formato de gravação não suportado pelo navegador.");
      }

      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const finalMime = mimeType.split(";")[0] || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: finalMime });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };

      mr.start(100);
      setIsRecording(true);
      setElapsed(0);
      startTimer();
    } catch (err: any) {
      let msg = "Não foi possível iniciar a captura de áudio.";
      if (err?.name === "NotAllowedError") msg = "Permissão de microfone negada.";
      else if (/Formato/.test(err?.message))
        msg = "Seu navegador não suporta os formatos necessários.";
      setErrorMsg(msg);
      cleanupStreams();
    }
  };

  const stopRecording = (auto = false) => {
    stopTimer();
    setIsRecording(false);

    mediaRecorderRef.current?.state === "recording" &&
      mediaRecorderRef.current.stop();

    cleanupStreams();
    if (auto) setElapsed(MAX_SECONDS);
  };

  const sendToBackend = async () => {
    if (!audioBlob) return;
    try {
      setIsUploading(true);
      await AudioService.uploadAudio(audioBlob, {
        targetWord: selectedPrompt?.text,
        provider: "gemini",
        mimeType: audioBlob.type || "audio/webm",
      });
    } catch {
      setErrorMsg("Erro ao enviar áudio.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) stopRecording();
    else await startRecording();
  };

  const cleanupStreams = () => {
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupStreams();
    };
  }, []);

  const progress = Math.min(elapsed / MAX_SECONDS, 1);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Repetição de Fonemas e Pares Mínimos</h1>
        <p className={styles.subtitle}>
          Pressione o microfone e leia o texto proposto. O teste encerra em {MAX_SECONDS}s.
        </p>

        <button
          className={`${styles.micButton} ${isRecording ? styles.micActive : ""}`}
          onClick={toggleRecording}
          aria-pressed={isRecording}
          aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
        >
          <svg viewBox="0 0 24 24" className={styles.micIcon} aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
            <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V20H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2.08A7 7 0 0 0 19 11z" />
          </svg>
          <span className={styles.micLabel}>{isRecording ? "Gravando..." : "Iniciar"}</span>
        </button>

        <div className={styles.timer}>{mmss(elapsed)}</div>

        <div className={`${styles.prompt} ${isRecording ? styles.promptOpen : ""}`}>
          {selectedPrompt && (
            <>
              <h2 className={styles.promptTitle}>{selectedPrompt.title}</h2>
              <p className={styles.promptBody}>{selectedPrompt.text}</p>
            </>
          )}
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondary}
            onClick={() => {
              stopRecording();
              setElapsed(0);
              setAudioURL(null);
              setAudioBlob(null);
              setSelectedPrompt(null);
            }}
          >
            Recomeçar
          </button>

          {audioURL && (
            <>
              <a className={styles.primary} href={audioURL} download="fluencia.webm">
                Baixar Áudio
              </a>

              <button
                className={styles.primary}
                onClick={sendToBackend}
                disabled={isUploading}
              >
                {isUploading ? "Enviando..." : "Enviar para análise"}
              </button>
            </>
          )}
        </div>

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
}
