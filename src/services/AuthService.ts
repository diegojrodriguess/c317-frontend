class AuthService {
  static async login(email: string, password: string) {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login falhou");
    return response.json();
  }

  static async register(name: string, age: string, email: string, password: string) {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, email, password }),
    });
    if (!response.ok) throw new Error("Registro falhou");
    return response.json();
  }
}

export default AuthService;