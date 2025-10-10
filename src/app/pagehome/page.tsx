"use client";

import Image from "next/image";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div>
           <div className={styles.logoRow}>
              <h1 className={styles.logo}>
              <span className={styles.star}>★</span> Speech Therapy
              </h1>

              </div>
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
          
              <a
              href="/login"
              className={styles.ctaButton}
              aria-label="Começar"
            >
              Começar Agora
            </a>
          
            
          

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
        <p className={styles.impactsubtitle}>
         De cada palavra, construimos confiança
        </p>
        <h3 className={styles.impact}>
         Veja sua evolução em uma semana!
        </h3>
        <p className={styles.impactdescription}>
          Maximize seus resultados com treinos personalizados por IA, feedback em tempo real e relatórios claros para acompanhar cada conquista..
          </p>
          
        <section className={styles.featureGrid}>
          {/* primeiro quadrado verde */}
          <div className={styles.tile}>
            <div className={styles.tileContent}>
              <div className={styles.tileStat}>4x</div>
              <p className={styles.tileDesc}>
                Mais acertos de pronúncia<br />
                em treinos guiados com feedback imediato.
              </p>
            </div>
          </div>
          {/* segundo quadrado verde */}
          <div className={styles.tile}>
            <div className={styles.tileContent}>
              {/* IMAGEM: alvo com seta (eficiência) */}
              <div className={styles.tileImage} aria-label="Eficiência de prática">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  role="img"
                  aria-hidden="true"
                >
                  
                  <circle cx="128" cy="128" r="96" fill="none" stroke="#143d3b" stroke-width="12"/>
                  <circle cx="128" cy="128" r="64" fill="none" stroke="#143d3b" stroke-width="12" opacity="0.85"/>
                  <circle cx="128" cy="128" r="32" fill="#143d3b" opacity="0.95"/>
                  
                  <path d="M40 180 L110 110 L150 150 L216 84" fill="none" stroke="#143d3b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M216 84 L190 84 L216 110 Z" fill="#143d3b"/>
                </svg>
              </div>

              <p className={styles.tileDesc}>
                Eficiência de prática<br />
                Mais palavras corretas a cada nova tentativa.
              </p>
            </div>
          </div>

          {/* terceiro quadrado verde */}
          <div className={styles.tile}>
            <div className={styles.tileContent}>
              <div className={styles.tileImage} aria-label="Exercícios, histórico e relatórios">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  role="img"
                  aria-hidden="true"
                >
           
                  <rect x="56" y="48" width="144" height="168" rx="14" ry="14" fill="none" stroke="#143d3b" stroke-width="12"/>
                  
                  <rect x="100" y="28" width="56" height="24" rx="6" ry="6" fill="#143d3b"/>
              
                  <line x1="80" y1="96" x2="176" y2="96" stroke="#143d3b" stroke-width="10" stroke-linecap="round"/>
                  <line x1="80" y1="124" x2="176" y2="124" stroke="#143d3b" stroke-width="10" stroke-linecap="round" opacity="0.85"/>
                  <line x1="80" y1="152" x2="176" y2="152" stroke="#143d3b" stroke-width="10" stroke-linecap="round" opacity="0.75"/>
                 
                  <circle cx="90" cy="182" r="6" fill="#143d3b"/>
                  <path d="M108 178 l8 8 l16 -16" fill="none" stroke="#143d3b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                  
                  <path d="M176 196 h20 v-24" fill="none" stroke="#143d3b" stroke-width="10" stroke-linecap="round"/>
                  <path d="M196 172 l-16 -16" fill="none" stroke="#143d3b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M196 172 l16 -16" fill="none" stroke="#143d3b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

              <p className={styles.tileDesc}>
                Exercícios, histórico e relatórios<br />
                Centralize progresso e exporte quando quiser.
              </p>
            </div>
          </div>
          {/* quarto quadrado verde */} 
          <div className={styles.tile}>
            <div className={styles.tileContent}>
              <div className={styles.tileStat}>130%</div>
              <p className={styles.tileDesc}>
                Mais tempo de Prática<br />
                Maior enjamento com metas claras e feedback instantâneo.
              </p>
            </div>

          </div>
          
        </section>

        <h3 
        
        className={styles.impact}>
         Transformando sua vida com facilidade!
        </h3>

        <section className={styles.duoImages}>
          <div className={styles.duoCol}>
          <div className={styles.duoItem}>
            <Image
              src="/images/foto_app.jpg"
              alt="Paciente usando o app de fonoaudiologia"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={styles.duoImg}
              priority={false}
            />
          </div>
          <p className={styles.duoCapTitle}>Treino na Palma da Mão</p>
          <p className={styles.duoCapText}>
            Pratique sua fala onde e quando quiser, direto pelo celular.
          </p>
          </div>
          
          <div className={styles.duoCol}> 

          <div className={styles.duoItem}>
            <Image
              src="/images/medico.jpg"
              alt="Profissional de saúde avaliando relatórios no computador"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={styles.duoImg}
              priority={false}
            />
          </div>
          <p className={styles.duoCapTitle}>Relatórios Profissionais</p>
          <p className={styles.duoCapText}>
            Acompanhe o progresso dos pacientes com relatórios claros e objetivos.
          </p>
          </div>
        </section>
        

        <section className={styles.brandBanner}>
          <div className={styles.starBig} aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              role="img"
            >
              <path d="M12 .6l3.67 7.57L24 9.75l-6 5.85L19.34 24 12 19.9 4.66 24 6 15.6 0 9.75l8.33-1.6z"
                fill="#FFFFFF" />
            </svg>
          </div>

          <h2 className={styles.brandName}>Speech Therapy</h2>
        </section>


      </main>
    </div>
  );
}
