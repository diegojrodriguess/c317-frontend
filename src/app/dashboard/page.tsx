"use client";

import styles from "./page.module.css";
import { FaUserCircle, FaHeart } from "react-icons/fa";
import RouteGuard from "@/components/RouteGuard";
import { useRouter } from "next/navigation";

export default function Dashboard() {
   const router = useRouter();

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   router.push("/login");
  // };

  return (
    // <RouteGuard>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.welcome}>
            <h2>Bem Vindo</h2>
            <p className={styles.username}>Xxxxxxxxxxx.</p>
          </div>
          {/* <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button> */}
          <div className={styles.avatar}>
            <FaUserCircle size={70} color="#fff" />
          </div>
        </header>

        {/* Cards */}
        <main className={styles.main}>
          <div className={styles.grid}>
            <div 
            onClick={() => router.push('/testes_dashboard/box1')}
            className={styles.card}>
              <FaHeart size={28} />
              <p>1. Leitura Rápida / Fluência Verbal</p>
            </div>
            <div 
             onClick={() => router.push('/testes_dashboard/box2')}
            className={styles.card}>
              <FaHeart size={28} />
              <p>2. Repetição de Fonemas e Pares Mínimos</p>
            </div>
            <div
            onClick={() => router.push('/testes_dashboard/box3')}
            className={styles.card}>
              <FaHeart size={28} />
              <p>3. Leitura de Palavras e Pseudopalavras</p>
            </div>
            <div
            onClick={() => router.push('/testes_dashboard/box4_figuras')}
            className={styles.card}>
              <FaHeart size={28} />
              <p>4. Teste de Nomeação de Figuras</p>
            </div>
            <div
            onClick={() => router.push('/testes_dashboard/box5')}
            className={styles.card}>
              <FaHeart size={28} />
              <p>5. Frases Curtas de Repetição / Leitura</p>
            </div>
            <div
            onClick={() => router.push('/testes_dashboard/box6')}
            className={styles.card}>
              <FaHeart size={28} />
              <p>6. Repetição de Sílabas e Trava-línguas</p>
            </div>
            <div
            onClick={() => router.push('/history')}
            className={styles.card}>
              <FaHeart size={28} />
              <p>Histórico de Avaliações</p>
            </div>
          </div>
        </main>
      </div>
    // </RouteGuard>
  );
}
