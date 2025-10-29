"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const MAX_SECONDS = 30; //tempo do teste

export default function FluenciaVerbalPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const PROMPTS = [
    {
      title: "O Despertar da Manhã",
      text:
        "Quando o sol começa a surgir no horizonte, o mundo desperta em cores e sons. Os pássaros cantam, o vento sopra leve entre as árvores e o ar fresco traz uma sensação de recomeço. Cada manhã é uma nova chance de viver, aprender e seguir em frente com mais energia e esperança.",
    },
    {
      title: "A Corrida da Chuva",
      text:
         "As nuvens se juntaram no céu como um grande exército cinza. De repente, o vento soprou forte e as primeiras gotas caíram apressadas, disputando quem chegaria primeiro ao chão. As pessoas correram, rindo e se protegendo, enquanto a cidade ganhava um novo brilho sob a chuva.",
    },
    {
      title: "O Valor do Silêncio",
      text:
        "Nem sempre o silêncio é vazio. Às vezes, ele é o espaço onde nascem as melhores ideias. Quando tudo se cala, a mente encontra tempo para respirar e o coração para escutar. Falar é importante, mas saber quando parar e ouvir é um sinal de sabedoria.",
    },
  ];
  
  const [selectedPrompt, setSelectedPrompt] = useState<{ title: string; text: string } | null>(null);

  

  


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
          stopRecording(true); // auto stop ao atingir limite
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
    chunksRef.current = [];

    // sorteador de prompt
    const idx = Math.floor(Math.random() * PROMPTS.length);
    setSelectedPrompt(PROMPTS[idx]);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));
    };

    mr.start(100);
    setIsRecording(true);
    setElapsed(0);
    startTimer();
  } catch (err: any) {
    setErrorMsg(
      err?.name === "NotAllowedError"
        ? "Permissão de microfone negada. Ative o acesso nas configurações do navegador."
        : "Não foi possível iniciar a captura de áudio."
    );
    cleanupStreams();
  }
};

  const stopRecording = (auto = false) => {
    stopTimer();
    setIsRecording(false);
    mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current.stop();
    cleanupStreams();
    if (auto) {
      // caso pare por atingir o tempo
      setElapsed(MAX_SECONDS);
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
        <h1 className={styles.title}>Leitura Rápida / Fluência Verbal</h1>
        <p className={styles.subtitle}>
          Pressione o microfone e leia o texto proposto. O teste encerra em {MAX_SECONDS}s.
        </p>

        <button
          className={`${styles.micButton} ${isRecording ? styles.micActive : ""}`}
          onClick={toggleRecording}
          aria-pressed={isRecording}
          aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
        >
          {/* ícone */}
          <svg viewBox="0 0 24 24" className={styles.micIcon} aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" fill="currentColor" />
            <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V20H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2.08A7 7 0 0 0 19 11z" fill="currentColor" />
          </svg>
          <span className={styles.micLabel}>{isRecording ? "Gravando..." : "Iniciar"}</span>
        </button>

        <div className={styles.timer}>{mmss(elapsed)}</div>

        {/*  Texto para leitura */}
        <div
          className={`${styles.prompt} ${isRecording ? styles.promptOpen : ""}`}
          aria-hidden={!isRecording}
        >
          {selectedPrompt && (
            <>
              <h2 className={styles.promptTitle}>{selectedPrompt.title}</h2>
              <p className={styles.promptBody}>{selectedPrompt.text}</p>
            </>
          )}
        </div>

        <div className={styles.progressTrack} aria-label="Progresso do tempo">
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondary}
            onClick={() => {
              stopRecording();
              setElapsed(0);
              setAudioURL(null);
              setSelectedPrompt(null); // sorteia dnv
            }}
          >
            Recomeçar
          </button>

          {audioURL && (
            <a className={styles.primary} href={audioURL} download="fluencia.webm">
              Baixar Áudio
            </a>
          )}
        </div>

        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
}
