"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AuthService from "@/services/AuthService";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmarPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await AuthService.register(name, age, email, password);

      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao registrar:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cadastre-se</h1>

        <div className={styles.avatar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#74c0fc"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Nome e sobrenome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="number"
            placeholder="Idade"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Confirme a senha"
            value={confirmPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
}
