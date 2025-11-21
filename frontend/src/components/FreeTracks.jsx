import React, { useEffect, useState } from "react";

export default function FreeTracks() {
  const [tracks, setTracks] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API}/api/tracks`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setTracks(res.tracks);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="p-6">
      <h2 className="text-3xl font-bold mb-4">5 Canciones Gratis</h2>

      {tracks.length === 0 && (
        <div className="opacity-70">No hay canciones aún.</div>
      )}

      <div className="space-y-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="font-semibold">{track.title}</div>
            <div className="text-xs opacity-70">
              {track.artist} • {track.genre}
            </div>

            <audio controls className="w-full mt-2">
              <source src={track.storage_path} type="audio/mpeg" />
              Your browser does not support audio.
            </audio>
          </div>
        ))}
      </div>
    </section>
  );
}
