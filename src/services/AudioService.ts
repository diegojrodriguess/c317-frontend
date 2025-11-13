class AudioService {
  static async uploadAudio(blob: Blob) {
    const formData = new FormData();
    const file = new File([blob], "gravacao.ogg", { type: "audio/ogg" });

    formData.append("audio", file);

    const response = await fetch("http://localhost:3000/audio/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    return response.json();
  }
}

export default AudioService;
