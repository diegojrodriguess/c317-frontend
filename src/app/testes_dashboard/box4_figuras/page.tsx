"use client";

import { useEffect, useRef, useState } from "react";
import AudioService from "@/services/AudioService";
import styles from "./page.module.css";
import Image from "next/image";

const MAX_SECONDS = 15;

export default function FluenciaVerbalPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const IMAGE_PROMPTS = [
    { title: "Sequência 1", src: "/images/sequencia1.png", alt: "Sequência 1" },
    { title: "Sequência 2", src: "/images/sequencia2.png", alt: "Sequência 2" },
    { title: "Sequência 3", src: "/images/sequencia3.png", alt: "Sequência 3" },
    { title: "Sequência 4", src: "/images/sequencia4.png", alt: "Sequência 4" },
  ];

  const [selectedImage, setSelectedImage] =
    useState<{ title: string; src: string; alt: string } | null>(null);

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

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      setAudioURL(null);
      setAudioBlob(null);
      chunksRef.current = [];

      const idx = Math.floor(Math.random() * IMAGE_PROMPTS.length);
      setSelectedImage(IMAGE_PROMPTS[idx]);

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
        throw new Error("Formato não suportado");
      }

      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const finalMime = mimeType.split(";")[0];
        const blob = new Blob(chunksRef.current, { type: finalMime });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };

      mr.start(100);
      setIsRecording(true);
      setElapsed(0);
      startTimer();

    } catch (err: any) {
      setErrorMsg("Não foi possível iniciar o áudio.");
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
      const result = await AudioService.uploadAudio(audioBlob, {
        targetWord: selectedImage?.title,
        provider: "gemini",
        mimeType: audioBlob.type,
      });
      setProcessingResult(result);
    } catch {
      setErrorMsg("Erro ao enviar.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) stopRecording();
    else await startRecording();
  }

  const cleanupStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t=>t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupStreams();
    };
  }, []);

  const progress = Math.min(elapsed/MAX_SECONDS,1);

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <h1 className={styles.title}>Teste de nomeaçao de figuras</h1>

        <button
          className={`${styles.micButton} ${isRecording ? styles.micActive : ""}`}
          onClick={toggleRecording}
        >
          {isRecording ? "Gravando..." : "Iniciar"}
        </button>

        <div className={styles.timer}>{mmss(elapsed)}</div>

        <div className={`${styles.prompt} ${isRecording ? styles.promptOpen : ""}`}>
          {selectedImage && (
            <>
              <h2 className={styles.promptTitle}>{selectedImage.title}</h2>
              <div className={styles.promptImage}>
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className={styles.promptImg}
                />
              </div>
              <p className={styles.promptHint}>
                Nomeie as figuras em voz alta, da esquerda para a direita.
              </p>
            </>
          )}
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondary}
            onClick={()=>{
              stopRecording();
              setElapsed(0);
              setAudioURL(null);
              setAudioBlob(null);
              setSelectedImage(null);
            }}
          >
            Recomeçar
          </button>

          {audioURL && (
            <>
              <a className={styles.primary} href={audioURL} download="audio.webm">
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

        {processingResult && (
          <div className={styles.resultBox}>
            <h3>Resultado da Análise</h3>
            <p><strong>Transcrição:</strong> {processingResult.transcription || "-"}</p>
            <p><strong>Pontuação:</strong> {typeof processingResult.score === "number" ? processingResult.score : (processingResult.score ?? "-")}</p>
            {typeof processingResult.match !== "undefined" && (
              <p><strong>Match:</strong> {String(processingResult.match)}</p>
            )}
            {processingResult.evaluation && (
              <p><strong>Avaliação:</strong> {processingResult.evaluation}</p>
            )}
            <p><strong>Feedback:</strong> {processingResult.feedback || processingResult.message || processingResult.audioMessage || "-"}</p>
          </div>
        )}

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
}
