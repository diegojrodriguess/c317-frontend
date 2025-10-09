"use client";

import Image from "next/image";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div>
          <h1 className={styles.logo}>
          <span className={styles.star}>★</span> Speech Therapy
          </h1>
          <p className={styles.headline}>
          Falando <span className={styles.highlight}>Melhor</span>, <br />
          Vivendo <span className={styles.highlight}>Melhor</span>.
          </p>

          <p className={styles.subheadline}>
          Sem burocracia, só evolução na sua fala.
          </p>

          <p className={styles.offer}>
          Nós oferecemos
          </p>

          <div className={styles.cardsContainer}>
            {/* primeiro quadrado bege */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <svg
               xmlns="http://www.w3.org/2000/svg"
                width="48"
               height="48"
               viewBox="0 0 24 24"
               fill="none"
               stroke="#A8C030"
               strokeWidth="2.5"
               strokeLinecap="round"
               strokeLinejoin="round"
              >
               <path d="M20 6L9 17l-5-5" />
              </svg>
              </div>
              <p className={styles.cardText}>Feedback em Tempo Real</p>
          </div>
            {/* segundo quadrado bege */}
          <div className={styles.card}><div className={styles.iconWrapper}>
                
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A8C030"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Pessoa"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className={styles.cardText}>Treino Personalizado</p></div>
            {/* terceiro quadrado bege */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A8C030"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Notas"
                >
                  <rect x="6" y="3" width="12" height="18" rx="2" ry="2" />
                  <path d="M9 7h6" />
                  <path d="M9 11h6" />
                  <path d="M9 15h6" />
                </svg>
              </div>
              <p className={styles.cardText}>Relatório de Progresso</p>
          </div>
          </div>
        </div>

        <div className={styles.footer}>
          {new Date().getFullYear()} Speech Therapy
        </div>
      </aside>


      <main className={styles.content}>
        <div className={styles.hero}>
          <Image
            src="/images/foto_fono_homepage.jpg"
            alt="Fonoaudióloga orientando paciente durante sessão"
            fill          // preenche o container .hero
            priority      // carrega mais rápido por estar no topo
            sizes="(min-width: 1024px) 900px, 100vw"
            className={styles.heroImg}
          />
        </div>
        <h2 className={styles.title}>Veja Sua Evolução Em Uma Semana</h2>
        <p className={styles.text}>
          Espaço para texto, cards e imagens...
        </p>
      </main>
    </div>
  );
}
