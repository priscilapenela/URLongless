"use client";
import styles from './ShortForm.module.css';
import { BsArrowRight } from "react-icons/bs";
import { useState } from 'react';

export default function Form() {
   const [url, setUrl] = useState('');
   const [short_Url, setShortUrl] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

  async function handleSubmit(e){
    e.preventDefault();

    if (!url.trim()) {
      setError('La URL no puede estar vacía.');
      return;
    }

    function isValidHttpUrl() {
      try {
        const newUrl = new URL(url);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
      } catch (err) {
        return false;
      }
    }

    if(isValidHttpUrl()){
      setLoading(true);
      setError('');
      setShortUrl('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_url: url, custom_key: null }), // Enviamos la URL al backend
        });
        
        const data = await res.json();

        if (!res.ok) {
          if (data.detail === "Custom key already in use.") {
            throw new Error('La clave personalizada ya está en uso.');
          }else{throw new Error('Error al acortar la URL.');}
        }
        
        setShortUrl(data.url); // Guardamos la URL corta
        } catch (err) {
        setError(err.message);
        } finally {
          setLoading(false); // Sea lo que sea, apagamos el estado de carga
        }
    }else{
      setError('La URL no es válida')
      return;
    }

  };
 return (
    <>
    <section className={styles.formSection}>
    <div className={styles.formDisplay}>
      <div className={styles.formHeader}>
         <h2 className={styles.formTitle}>Acortar un enlace largo</h2>
         <p className={styles.formSubtitle}>No se requiere tarjeta de crédito.</p>
      </div>
      <form className={styles.urlForm} onSubmit={handleSubmit}>
         <div className={styles.inputContainer}>
             <label htmlFor="long-url" className={styles.inputLabel}>Pegue su enlace largo aquí.</label>
             <div className={styles.inputWrapper}>
                 <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} id="long-url" placeholder="http://example.com/my-long-url" className={styles.urlInput} />
             </div>
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
             <span className={styles.buttonText}>Consigue tu enlace gratis</span>
             <BsArrowRight />
          </button>
      </form>
    </div>
      
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {short_Url && (
        <div className={styles.formDisplayShort}>
          <p className="text-sm text-gray-700">Tu URL acortada:</p>
          <a
            href={short_Url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {short_Url}
          </a>
        </div>
      )}
   </section>
   </>
  );
}