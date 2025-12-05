"use client";

import { useEffect, useRef, useState } from "react";
import AudioService from "@/services/AudioService";
import styles from "./page.module.css";

const MAX_SECONDS = 30;

<<<<<<< Updated upstream
export default function SilabasTravalLinguaPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
=======
export default function FluenciaVerbalPage() {
  const [isRecording,setIsRecording]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [errorMsg,setErrorMsg]=useState<string|null>(null);
  const [audioURL,setAudioURL]=useState<string|null>(null);
  const [audioBlob,setAudioBlob]=useState<Blob|null>(null);
  const [isUploading,setIsUploading] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);

  // Derive a simple evaluation when the backend doesn't provide one
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
>>>>>>> Stashed changes

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [processingResult, setProcessingResult] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const cancelRef = useRef(false);

  const ACTIVITY_KEY = "silabas_e_traval";
  const ACTIVITY_LABEL = "Repetição de Sílabas e Trava-línguas";

  const FALLBACK_PROMPTS = [
    {
      title: "Sílabas Saltitantes",
      text: "Pa-pe-pi-po-pu, o papagaio pulou! Ta-te-ti-to-tu, o tatu tropeçou!"
    },
    {
      title: "O Rato e o Relojoeiro",
      text: "O rato roeu a roupa do rei de Roma, e o relojoeiro remendou rapidinho."
    },
    {
      title: "Três Tigres",
      text: "Três tigres tristes tropeçaram no trigo..."
    }
  ];

  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);

  // ============================================================
  // TIMER
  // ============================================================
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

  // ============================================================
  // LOAD PROMPTS (IA OU FALLBACK)
  // ============================================================
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
          setSelectedPrompt(items[0]);
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
      cleanupStreams();
      stopTimer();
    };
  }, []);

  // ============================================================
  // GRAVAÇÃO
  // ============================================================
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
        throw new Error("Navegador não suporta gravação de áudio.");
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (cancelRef.current) {
          cancelRef.current = false;
          return;
        }

        const finalMime = mimeType.split(";")[0];
        const blob = new Blob(chunksRef.current, { type: finalMime });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };

      recorder.start(100);

      setIsRecording(true);
      setElapsed(0);
      startTimer();
    } catch {
      setErrorMsg("Erro ao iniciar gravação.");
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

  const cleanupStreams = () => {
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // ============================================================
  // ENVIO PARA IA
  // ============================================================
  const sendToBackend = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);
<<<<<<< Updated upstream

      const result = await AudioService.uploadAudio(audioBlob, {
=======
      const result = await AudioService.uploadAudio(audioBlob,{
>>>>>>> Stashed changes
        targetWord: selectedPrompt?.text,
        provider: "gemini",
        mimeType: audioBlob.type,
      });
<<<<<<< Updated upstream

      setProcessingResult(result.data);
    } catch {
      setErrorMsg("Erro ao enviar áudio.");
    } finally {
=======
      // Normalize in case a wrapper is returned
      setProcessingResult((result as any)?.data ?? result);
    }catch{
      setErrorMsg("Erro ao enviar.");
    }finally{
>>>>>>> Stashed changes
      setIsUploading(false);
    }
  };

  const progress = Math.min(elapsed / MAX_SECONDS, 1);

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <h1 className={styles.title}>{ACTIVITY_LABEL}</h1>

        <button
          className={`${styles.micButton} ${isRecording ? styles.micActive : ""}`}
          onClick={() => (isRecording ? stopRecording() : startRecording())}
        >
          {isRecording ? "Gravando..." : "Iniciar"}
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
          <div
            className={styles.progressFill}
            style={{ width: `${progress * 100}%` }}
          />
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
              setProcessingResult(null);
            }}
          >
            Recomeçar
          </button>

          {audioURL && (
            <>
              <a className={styles.primary} href={audioURL} download="silabas.webm">
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
<<<<<<< Updated upstream
            <p><strong>Transcrição:</strong> {processingResult.transcription}</p>
            <p><strong>Pontuação:</strong> {processingResult.score}</p>
            <p><strong>Mensagem:</strong> {processingResult.audioMessage}</p>
=======
            <p><strong>Transcrição:</strong> {processingResult.transcription || "-"}</p>
            <p><strong>Pontuação:</strong> {typeof processingResult.score === "number" ? processingResult.score : (processingResult.score ?? "-")}</p>
            {typeof processingResult.match !== "undefined" && (
              <p><strong>Match:</strong> {String(processingResult.match)}</p>
            )}
            <p><strong>Avaliação:</strong> {deriveEvaluation(processingResult) || "-"}</p>
            <p><strong>Feedback:</strong> {processingResult.feedback || processingResult.message || processingResult.audioMessage || "-"}</p>
>>>>>>> Stashed changes
          </div>
        )}

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
}
