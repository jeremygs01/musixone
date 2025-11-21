import React, { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Pop");

  const API = import.meta.env.VITE_API_URL;

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("Selecciona un archivo");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("artist", artist);
    fd.append("genre", genre);

    const res = await fetch(`${API}/api/upload`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token") // si usas login
      },
      body: fd
    });

    const json = await res.json();

    if (json.ok) {
      alert("Canción subida correctamente");
      window.location.reload();
    } else {
      alert("Error: " + json.error);
    }
  }

  return (
    <section className="p-6">
      <h2 className="text-3xl font-bold mb-4">Sube tu Música</h2>

      <form onSubmit={handleUpload} className="space-y-3">
        <input
          className="p-2 bg-gray-900 rounded w-full"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="p-2 bg-gray-900 rounded w-full"
          placeholder="Artista"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />

        <select
          className="p-2 bg-gray-900 rounded w-full"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option>Pop</option>
          <option>Urbano</option>
          <option>Indie</option>
          <option>Rock</option>
        </select>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button className="px-4 py-2 bg-[#1DB954] rounded text-white">
          Subir Canción
        </button>
      </form>
    </section>
  );
}
