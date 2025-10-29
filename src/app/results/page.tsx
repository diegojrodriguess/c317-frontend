"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

type Rating = 1 | 2 | 3;

const LABELS: Record<Rating, string> = {
  1: "Ruim",
  2: "Bom",
  3: "Perfeito",
};

export default function ResultadosPage() {
  const search = useSearchParams();
  // você pode passar dados pela URL: ?duracao=30&acertos=12
  const duracao = search.get("duracao"); // em segundos
  const acertos = search.get("acertos");

  const [rating, setRating] = useState<Rating>(3);
  const exportRef = useRef<HTMLDivElement>(null);

  const mmss = (total?: string | null) => {
    if (!total) return "-";
    const s = Number(total);
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const shareText = useMemo(() => {
    const linhas = [
      `Resultado do Teste de Fala`,
      `Classificação: ${LABELS[rating]} (${rating} estrela${rating > 1 ? "s" : ""})`,
      duracao ? `Duração: ${mmss(duracao)}` : undefined,
      acertos ? `Acertos: ${acertos}` : undefined,
      `Gerado em: ${new Date().toLocaleString()}`,
    ].filter(Boolean);
    return linhas.join("\n");
  }, [rating, duracao, acertos]);

  const handlePrint = () => {
    // imprime apenas a área exportável (CSS usa @media print)
    window.print();
  };

  const handleWhatsapp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleEmail = () => {
    const subject = "Resultado do Teste de Fala";
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      shareText
    )}`;
    window.location.href = url;
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}${window.location.pathname}?duracao=${duracao ?? ""}&acertos=${acertos ?? ""}&rating=${rating}`;
    await navigator.clipboard.writeText(link);
    alert("Link copiado!");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Resultados</h1>
        <p className={styles.subtitle}>
          Selecione a classificação e exporte/compartilhe o resultado.
        </p>

        {/* Grade de cartões de avaliação */}
        <section className={styles.ratingGrid}>
          <button
            className={`${styles.ratingCard} ${rating === 1 ? styles.active : ""}`}
            onClick={() => setRating(1)}
            aria-pressed={rating === 1}
          >
            <div className={styles.stars}>
              <Star filled />
              <Star />
              <Star />
            </div>
            <span className={styles.ratingLabel}>Ruim</span>
          </button>

          <button
            className={`${styles.ratingCard} ${rating === 2 ? styles.active : ""}`}
            onClick={() => setRating(2)}
            aria-pressed={rating === 2}
          >
            <div className={styles.stars}>
              <Star filled />
              <Star filled />
              <Star />
            </div>
            <span className={styles.ratingLabel}>Bom</span>
          </button>

          <button
            className={`${styles.ratingCard} ${rating === 3 ? styles.active : ""}`}
            onClick={() => setRating(3)}
            aria-pressed={rating === 3}
          >
            <div className={styles.stars}>
              <Star filled />
              <Star filled />
              <Star filled />
            </div>
            <span className={styles.ratingLabel}>Perfeito</span>
          </button>
        </section>

        {/* Área exportável */}
        <section className={styles.exportBox} ref={exportRef}>
          <h2 className={styles.exportTitle}>Resumo</h2>
          <ul className={styles.summaryList}>
            <li><strong>Classificação:</strong> {LABELS[rating]}</li>
            <li><strong>Duração:</strong> {duracao ? mmss(duracao) : "-"}</li>
            <li><strong>Acertos:</strong> {acertos ?? "-"}</li>
            <li><strong>Data/Hora:</strong> {new Date().toLocaleString()}</li>
          </ul>
        </section>

        {/* Ações de exportação */}
        <div className={styles.actions}>
          <button className={styles.secondary} onClick={handlePrint}>
            Exportar PDF
          </button>
          <button className={styles.primary} onClick={handleWhatsapp}>
            WhatsApp
          </button>
          <button className={styles.primary} onClick={handleEmail}>
            E-mail
          </button>
          <button className={styles.secondary} onClick={handleCopyLink}>
            Copiar Link
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------- componente estrela ------- */
function Star({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      className={filled ? styles.starFilled : styles.star}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 .6l3.67 7.57L24 9.75l-6 5.85L19.34 24 12 19.9 4.66 24 6 15.6 0 9.75l8.33-1.6z" />
    </svg>
  );
}
