'use client';
import { useState } from 'react';
import { IoMdLink } from 'react-icons/io';
import { FaQrcode } from 'react-icons/fa';
import styles from './MiniForm.module.css';

export default function FormSwitcher() {
  const [activeForm, setActiveForm] = useState('short');
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
    <div className={styles.minFormContainer}>
    <div className={styles.form}>
        <h2 className={styles.title}>Creación Rápida</h2> 
      <div className={styles.toggleContainer}>
        <button
          onClick={() => setActiveForm('short')}
          className={`${styles.toggleButton} ${activeForm === 'short' ? styles.toggleButtonActive : ''}`}
        >
          <IoMdLink />
          Link corto
        </button>
        <button
          onClick={() => setActiveForm('qr')}
          className={`${styles.toggleButton} ${activeForm === 'qr' ? styles.toggleButtonActive : ''}`}
        >
          <FaQrcode />
          Código QR
        </button>
      </div>
    </div>
      {activeForm === 'short' ? (
        <div>
          <form className={styles.urlForm} onSubmit={handleSubmit}>
          <p>Puedes crear 5 links cortos más este mes.</p>  
          <div className={styles.inputContainer2}>
             <label htmlFor="long-url" className={styles.inputLabel}>Introducir tu URL de destino.</label>
             <div className={styles.inputContainer}>
             <div className={styles.inputWrapper}>
                 <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} id="long-url" placeholder="http://example.com/my-long-url" className={styles.urlInput} />
             </div>
             <div className={styles.buttonContainer}>
             <button type="submit" disabled={loading} className={styles.submitButton}>
             <span className={styles.buttonText}>Crea tu Link</span>
             </button>
             </div>
             </div>
          </div>
          </form>
          {error && <p className="text-red-600 mt-2">{error}</p>}

          {shortUrl && (
             <div className="mt-4 p-3 bg-gray-100 border rounded">
                 <p className="text-sm text-gray-700">Tu URL acortada:</p>
                 <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                     {shortUrl}
                   </a>
             </div>
            )}
        </div>
      ) : (
        <div>
          <form className={styles.urlForm} onSubmit={handleSubmit}>
          <p>Puedes crear 2 códigos QR más este mes.</p>  
          <div className={styles.inputContainer2}>
             <label htmlFor="long-url" className={styles.inputLabel}>Introducir tu URL de destino.</label>
             <div className={styles.inputContainer}>
             <div className={styles.inputWrapper}>
                 <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} id="long-url" placeholder="http://example.com/my-long-url" className={styles.urlInput} />
             </div>
             <div className={styles.buttonContainer}>
             <button type="submit" disabled={loading} className={styles.submitButton}>
             <span className={styles.buttonText}>Crea tu QR</span>
             </button>
             </div>
             </div>
          </div>
          </form>
          {error && <p className="text-red-600 mt-2">{error}</p>}

          {shortUrl && (
             <div className="mt-4 p-3 bg-gray-100 border rounded">
                 <p className="text-sm text-gray-700">Tu QR</p>
                 <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                     {shortUrl}
                   </a>
             </div>
            )}
        </div>
    )}
    </div>
)}
