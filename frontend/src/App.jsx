import { useEffect } from "react";

export default function App() {

  // 🔥 Test: Conexión con tu backend
  useEffect(() => {
    const url = `${import.meta.env.VITE_API_URL}/api/tracks`;

    console.log("Consultando API:", url);

    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log("API MusixOne:", data);
      })
      .catch(err => {
        console.error("Error al conectar con API MusixOne:", err);
      });
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-black text-white'>
      <h1 className='text-4xl font-bold'>MusixOne — Frontend Ready</h1>
    </div>
  );
}
