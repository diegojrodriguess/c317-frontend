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
}

export default AudioService;
