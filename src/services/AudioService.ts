import { API_BASE_URL, getAuthToken, getUserIdFromToken } from "./config";

type UploadOptions = {
  userId?: string;
  targetWord?: string;
  provider?: string; // default 'gemini'
  filename?: string; // default derived from blob type
  mimeType?: string; // override
};

class AudioService {
  /**
   * Envia áudio para o backend. Se userId não for informado, tenta extrair do JWT salvo no localStorage.
   */
  static async uploadAudio(blob: Blob, opts: UploadOptions = {}) {
    const formData = new FormData();

    const mime = opts.mimeType || blob.type || "audio/ogg";
    const defaultExt = mime.includes("webm") ? "webm" : mime.includes("ogg") ? "ogg" : "opus";
    const name = opts.filename || `gravacao.${defaultExt}`;
    const file = new File([blob], name, { type: mime });

    formData.append("audio", file);

    // Metadados esperados pelo backend
    const tokenUserId = getUserIdFromToken();
    const userId = opts.userId || tokenUserId || "anonymous";
    if (userId) formData.append("user_id", userId);
    if (opts.targetWord) formData.append("target_word", opts.targetWord);
    formData.append("provider", opts.provider || "gemini");

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/audio/upload`, {
      method: "POST",
      body: formData,
      headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Falha ao enviar áudio (${response.status})`);
    }

    return response.json();
  }

  static async getHistory(userId?: string) {
    const id = userId || getUserIdFromToken();
    if (!id) throw new Error("Usuário não autenticado");

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/audio/history/${id}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) throw new Error("Falha ao buscar histórico");
    return response.json();
  }

  /**
   * Gera/pega itens de uma categoria de tarefas no backend.
   * Retorna o JSON bruto do endpoint `/tarefas/gerar`.
   */
  static async generateTasks(
    category: string,
    count = 5,
    opts: { age_group?: string; difficulty?: string; include_meta?: boolean; use_ai?: boolean } = {}
  ) {
    const form = new FormData();
    form.append("category", category);
    form.append("count", String(count));
    form.append("age_group", opts.age_group || "adulto");
    form.append("difficulty", opts.difficulty || "medio");
    form.append("include_meta", String(Boolean(opts.include_meta ?? true)));
    if (opts.use_ai) form.append("use_ai", String(true));

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/tarefas/gerar`, {
      method: "POST",
      body: form,
      headers,
    });
    // If backend doesn't expose /tarefas/gerar (404) try IA service directly as a fallback
    if (!response.ok) {
      if (response.status === 404) {
        // try IA directly (development fallback)
        try {
          const iaRes = await fetch(`http://127.0.0.1:8000/tarefas/gerar`, {
            method: "POST",
            body: form,
          });
          if (iaRes.ok) return iaRes.json();
        } catch (e) {
          // fallthrough to throw original error below
        }
      }
      const txt = await response.text();
      throw new Error(txt || `Falha ao gerar tarefas (${response.status})`);
    }

    return response.json();
  }
}

export default AudioService;
