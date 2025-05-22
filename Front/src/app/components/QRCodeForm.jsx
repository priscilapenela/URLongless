"use client";
import styles from './QRCodeForm.module.css';
import { BsArrowRight } from "react-icons/bs";
import { useState } from 'react';
import Image from "next/image"

export default function Form() {
   const [url, setUrl] = useState('');
   const [shortUrl, setShortUrl] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const handleSubmit = async (e) => {
    e.preventDefault(); // Previene que el formulario recargue la página

    if (!url.trim()) {
      setError('La URL no puede estar vacía.');
      return;
    }

    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      const res = await fetch('https://tu-api.execute-api.region.amazonaws.com/prod/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }), // Enviamos la URL al backend
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al acortar la URL.');
      }

      setShortUrl(data.shortUrl); // Guardamos la URL corta
     } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Sea lo que sea, apagamos el estado de carga
    }
  };
 return (
    <>
    <section className={styles.section1}>
     <div className={styles.formSection}>
        <div className={styles.formHeader}>
         <h2 className={styles.formTitle}>Crear un código QR</h2>
         <p className={styles.formSubtitle}>No se requiere tarjeta de crédito.</p>
      </div>
      <form className={styles.urlForm} onSubmit={handleSubmit}>
         <div className={styles.inputContainer}>
             <label htmlFor="long-url" className={styles.inputLabel}>Introduce tu código QR de destino.</label>
             <div className={styles.inputWrapper}>
                 <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} id="long-url" placeholder="http://example.com/my-long-url" className={styles.urlInput} />
             </div>
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
             <span className={styles.buttonText}>Consigue tu Codigo QR gratis</span>
             <BsArrowRight />
          </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
     </div>
     <Image src="/img/qrCode.png" alt="codigo qr" width={326} height={406} style={{ borderRadius: '40px' }}/>
   </section>
   </>
  );
}
