"use client";

import styles from "./page.module.css";
import { FaUserCircle, FaHeart } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.welcome}>
          <h2>Bem Vindo</h2>
          <p className={styles.username}>Xxxxxxxxxxx.</p>
        </div>
        <div className={styles.avatar}>
          <FaUserCircle size={70} color="#fff" />
        </div>
      </header>

      {/* Cards */}
      <main className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <FaHeart size={28} />
            <p>Leitura Rápida / Fluência Verbal</p>
          </div>
          <div className={styles.card}>
            <FaHeart size={28} />
            <p>Repetição de Fonemas e Pares Mínimos</p>
          </div>
          <div className={styles.card}>
            <FaHeart size={28} />
            <p>Leitura de Palavras e Pseudopalavras</p>
          </div>
          <div className={styles.card}>
            <FaHeart size={28} />
            <p>Teste de Nomeação de Figuras</p>
          </div>
          <div className={styles.card}>
            <FaHeart size={28} />
            <p>Frases Curtas de Repetição / Leitura</p>
          </div>
          <div className={styles.card}>
            <FaHeart size={28} />
            <p>Repetição de Sílabas e Trava-línguas</p>
          </div>
        </div>
      </main>
    </div>
  );
}
