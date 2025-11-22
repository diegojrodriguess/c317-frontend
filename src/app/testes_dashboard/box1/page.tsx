"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import AudioService from "@/services/AudioService";

const MAX_SECONDS = 30;

export default function FluenciaVerbalPage() {
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

  const PROMPTS = [
    { title: "O Despertar da Manhã", text: "Quando o sol começa..." },
    { title: "A Corrida da Chuva", text: "As nuvens se juntaram..." },
    { title: "O Valor do Silêncio", text: "Nem sempre o silêncio..." },
  ];

  const [selectedPrompt, setSelectedPrompt] = useState<{ title: string; text: string } | null>(null);

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
      setProcessingResult(null);
      chunksRef.current = [];

      const idx = Math.floor(Math.random() * PROMPTS.length);
      setSelectedPrompt(PROMPTS[idx]);

      // Solicita permissão de áudio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Seleção dinâmica de MIME suportado
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
      const mimeType = supported || "audio/webm"; // fallback final

      let recorder: MediaRecorder;
      try {
        recorder = supported ? new MediaRecorder(stream, supported ? { mimeType } : undefined) : new MediaRecorder(stream);
      } catch (recErr: any) {
        throw new Error("Formato de gravação não suportado pelo navegador.");
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalMime = mimeType && mimeType !== "" ? mimeType.split(";")[0] : "audio/webm";
        const blob = new Blob(chunksRef.current, { type: finalMime });
        setAudioURL(URL.createObjectURL(blob));
        setAudioBlob(blob);
      };

      recorder.start(100);
      setIsRecording(true);
      setElapsed(0);
      startTimer();
    } catch (err: any) {
      let msg = "Erro ao iniciar gravação.";
      if (err?.name === "NotAllowedError") msg = "Permissão de microfone negada. Autorize o acesso nas configurações do navegador.";
      else if (/Formato de gravação não suportado/i.test(err?.message)) msg = "Seu navegador não suporta os formatos necessários. Tente Chrome ou Firefox.";
      setErrorMsg(msg);
      cleanupStreams();
    }
  };

  const stopRecording = (auto = false) => {
    stopTimer();
    setIsRecording(false);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    cleanupStreams();
    if (auto) setElapsed(MAX_SECONDS);
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

  const sendToBackend = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);
      const result = await AudioService.uploadAudio(audioBlob, {
        targetWord: selectedPrompt?.text,
        provider: "gemini",
        mimeType: audioBlob.type || "audio/ogg",
      });
      setProcessingResult(result.data);
    } catch (err) {
      setErrorMsg("Erro ao enviar áudio.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const progress = Math.min(elapsed / MAX_SECONDS, 1);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Leitura Rápida / Fluência Verbal</h1>
        <p className={styles.subtitle}>
          Pressione o microfone e leia o texto abaixo. O teste encerra em {MAX_SECONDS}s.
        </p>

        <button
          className={`${styles.micButton} ${isRecording ? styles.micActive : ""}`}
          onClick={toggleRecording}
        >
          <span>{isRecording ? "Gravando..." : "Iniciar"}</span>
        </button>

        <div className={styles.timer}>{mmss(elapsed)}</div>

        {selectedPrompt && isRecording && (
          <div className={styles.prompt}>
            <h2>{selectedPrompt.title}</h2>
            <p>{selectedPrompt.text}</p>
          </div>
        )}

        {audioURL && (
          <>
            <audio controls src={audioURL} style={{ marginTop: 20 }} />

            <button
              className={styles.primary}
              onClick={sendToBackend}
              disabled={isUploading}
              style={{ marginTop: 20 }}
            >
              {isUploading ? "Enviando..." : "Enviar para análise"}
            </button>
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
