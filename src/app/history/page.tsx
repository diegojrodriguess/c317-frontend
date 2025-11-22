"use client";

import { useEffect, useState } from "react";
import AudioService from "@/services/AudioService";
import styles from "./page.module.css";

type Consultation = {
  _id: string;
  userId: string;
  targetWord?: string;
  transcription?: string;
  score?: number;
  feedback?: string;
  pdfPath?: string;
  audioFilename?: string;
  transcriptionProvider?: string;
  createdAt?: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await AudioService.getHistory();
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError("Não foi possível carregar o histórico.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Histórico de Avaliações</h1>

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <ul className={styles.list}>
          {items.length === 0 && <li>Nenhum registro encontrado.</li>}
          {items.map((it) => (
            <li key={it._id} className={styles.card}>
              <div className={styles.row}>
                <span className={styles.label}>Data:</span>
                <span>{it.createdAt ? new Date(it.createdAt).toLocaleString() : "-"}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Texto:</span>
                <span className={styles.mono}>{it.targetWord || "-"}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Transcrição:</span>
                <span className={styles.mono}>{it.transcription || "-"}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Pontuação:</span>
                <span>{it.score ?? "-"}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Feedback:</span>
                <span>{it.feedback || "-"}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>PDF:</span>
                {it.pdfPath ? (
                  <a href={it.pdfPath} target="_blank" rel="noreferrer" className={styles.link}>
                    Abrir relatório
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
