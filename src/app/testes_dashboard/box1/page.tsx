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
  const cancelRef = useRef<boolean>(false);

  // Activity is fixed for this page (selected on the dashboard before arriving here)
  const ACTIVITY_KEY = "leitura_rapida";
  const ACTIVITY_LABEL = "Leitura Rápida / Fluência Verbal";

  // fallback prompts (used if backend unavailable)
  const FALLBACK_PROMPTS = [
    { title: "O Despertar da Manhã", text: "Quando o sol começa..." },
    { title: "A Corrida da Chuva", text: "As nuvens se juntaram..." },
    { title: "O Valor do Silêncio", text: "Nem sempre o silêncio..." },
  ];

  // prompts may come from backend generator; each item may be a string or object with .text
  const [prompts, setPrompts] = useState<Array<any>>([]);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null);

  const [selectedPrompt, setSelectedPrompt] = useState<{ title?: string; text: string; instructions?: string } | null>(null);
  // Gemini is always used for generation in this page
  const useGemini = true;

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
      if (isUploading) {
        setErrorMsg("Aguarde a análise terminar antes de gravar novamente.");
        return;
      }

      // ensure we have prompts available (try fetch on demand)
      if (!prompts || prompts.length === 0) {
        try {
          const res = await AudioService.generateTasks(ACTIVITY_KEY, 5, { include_meta: true, use_ai: useGemini });
          // res.items expected to be array of { text, target_words, instructions }
          const items = Array.isArray(res?.items) ? res.items : [];
          if (items.length) setPrompts(items);
        } catch (e) {
          // fallback: keep using local hardcoded ones
          console.warn("generateTasks falhou, usando fallback prompts:", e);
          setPrompts(FALLBACK_PROMPTS);
        }
      }
      // keep the current selected prompt if exists; otherwise choose the first available
      if (!selectedPrompt) {
        const pool = (prompts && prompts.length ? prompts : FALLBACK_PROMPTS);
        const first = pool[0] || FALLBACK_PROMPTS[0];
        setSelectedPromptIndex(0);
        const normalized = typeof first === "string" ? { text: first } : { text: first.text || "", title: first.title || "", instructions: first.instructions || "" };
        setSelectedPrompt(normalized as any);
      }

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
        // Se o usuário cancelou, não gerar blob/URL
        if (cancelRef.current) {
          cancelRef.current = false;
          chunksRef.current = [];
          setAudioURL(null);
          setAudioBlob(null);
          return;
        }
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

  const cancelRecording = () => {
    if (!isRecording && !mediaRecorderRef.current) return;
    // Sinaliza cancelamento para que onstop não crie Blob
    cancelRef.current = true;
    stopRecording();
    // estado já é limpo no onstop/cleanup
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

  // Fetch prompts on mount for this fixed activity
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await AudioService.generateTasks(ACTIVITY_KEY, 5, { include_meta: true, use_ai: useGemini });
        const items = Array.isArray(res?.items) ? res.items : [];
        if (mounted && items.length) {
          setPrompts(items);
          // pick first by default
          setSelectedPromptIndex(0);
          const chosen = items[0];
          const normalized = typeof chosen === "string" ? { text: chosen } : { text: chosen.text || "", title: chosen.title || "", instructions: chosen.instructions || "" };
          setSelectedPrompt(normalized as any);
        } else if (mounted) {
          setPrompts(FALLBACK_PROMPTS);
          setSelectedPromptIndex(0);
          setSelectedPrompt(FALLBACK_PROMPTS[0] as any);
        }
      } catch (e) {
        console.warn("Prefetch generateTasks falhou, usando fallback.", e);
        if (mounted) {
          setPrompts(FALLBACK_PROMPTS);
          setSelectedPromptIndex(0);
          setSelectedPrompt(FALLBACK_PROMPTS[0] as any);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sendToBackend = async () => {
    if (!audioBlob) return;

    try {
      setIsUploading(true);
      // Garante que o microfone está liberado durante a análise
      cleanupStreams();
      const result = await AudioService.uploadAudio(audioBlob, {
        // send the selected prompt text as the target (backend will use this to evaluate)
        targetWord: selectedPrompt?.text,
        provider: "gemini",
        mimeType: audioBlob.type || "audio/ogg",
      });
      // Backend returns a JSON object with fields like transcription, score and message/audioMessage.
      // Use it directly (no nested .data) and normalize feedback for UI.
      setProcessingResult(result);
    } catch (err) {
      setErrorMsg("Erro ao enviar áudio.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const discardAudio = () => {
    // allow user to cancel/discard after a recording finished
    setAudioURL(null);
    setAudioBlob(null);
    setProcessingResult(null);
    setElapsed(0);
  };

  const progress = Math.min(elapsed / MAX_SECONDS, 1);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>{ACTIVITY_LABEL}</h1>
          <p className={styles.subtitle}>
            Pressione o microfone e leia o texto abaixo. O teste encerra em {MAX_SECONDS}s.
          </p>
        </div>

        {/* Texto alvo em destaque, acima do botão de gravação */}
        {selectedPrompt && (
          <div className={`${styles.prompt} ${styles.promptOpen}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className={styles.promptTitle} style={{ margin: 0 }}>{selectedPrompt.title || "Tarefa"}</h2>
              <small style={{ color: "#666" }}>
                {selectedPromptIndex !== null ? `Item ${selectedPromptIndex + 1} de ${prompts && prompts.length ? prompts.length : FALLBACK_PROMPTS.length}` : ""}
              </small>
            </div>
            <p className={styles.promptBody}>{selectedPrompt.text}</p>
            {selectedPrompt.instructions && <p className={styles.promptBody} style={{ fontStyle: "italic", color: "#222" }}>{selectedPrompt.instructions}</p>}
          </div>
        )}

        <button
          className={`${styles.micButton} ${isRecording ? styles.micActive : ""}`}
          onClick={toggleRecording}
          disabled={isUploading}
          title={isUploading ? "Aguardando análise" : undefined}
        >
          <span>{isRecording ? "Parar" : "Iniciar"}</span>
        </button>

        {isRecording && (
          <div className={styles.actions}>
            <button className={styles.secondary} onClick={cancelRecording}>Cancelar</button>
          </div>
        )}

        <div className={styles.timer}>{mmss(elapsed)}</div>

        {audioURL && (
          <>
            <audio controls src={audioURL} style={{ marginTop: 20 }} />
            <div className={styles.actions} style={{ marginTop: 12 }}>
              <button
                className={styles.secondary}
                onClick={discardAudio}
                disabled={isUploading}
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
            {/* Show feedback message for the patient; backend may return either `message` or `audioMessage` */}
            <p><strong>Feedback:</strong> {processingResult.feedback || processingResult.message || processingResult.audioMessage || "-"}</p>
          </div>
        )}

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
}
