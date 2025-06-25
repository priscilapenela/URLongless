// Front/src/app/components/MiniForm.jsx
'use client';
import { useState } from 'react';
import { IoMdLink } from 'react-icons/io';
import { FaQrcode } from 'react-icons/fa';
import styles from './MiniForm.module.css';

export default function FormSwitcher() {
  const [activeForm, setActiveForm] = useState('short');
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState(''); // Para la URL corta del link
  const [qrCodeImage, setQrCodeImage] = useState(null); // Estado para la URL del objeto del QR (blob URL)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [showCustomKey, setShowCustomKey] = useState(false);

  // Define la URL base de tu API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('La URL de destino no puede estar vacía.');
      return;
    }

    setLoading(true);
    setError('');
    setShortUrl(''); // Limpia la URL corta
    
    // Limpia la imagen QR anterior y revoca la URL del objeto si existe
    if (qrCodeImage) {
      URL.revokeObjectURL(qrCodeImage); // Limpiar URL del blob anterior
    }
    setQrCodeImage(null); 

    try {
      let apiUrl = '';
      let requestBody = {};

      if (activeForm === 'short') {
        apiUrl = `${API_BASE_URL}/url`;
        requestBody = {
          target_url: url,
          custom_key: showCustomKey && customKey.trim() !== '' ? customKey.trim() : null,
        };
      } else { // activeForm === 'qr'
        apiUrl = `${API_BASE_URL}/generate_qr`; // Endpoint para generar QR
        requestBody = {
          target_url: url, // Tu API espera 'target_url'
        };
      }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        // Para errores, tu API puede seguir enviando JSON,
        // pero para evitar errores al intentar parsear un blob como JSON,
        // primero verifica el tipo de contenido o intenta parsear como texto.
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            const message = errorData?.detail || `Error al ${activeForm === 'short' ? 'acortar la URL' : 'generar el QR'}.`;
            if (message === "Custom key already in use.") {
                throw new Error('La clave personalizada ya está en uso.');
            } else {
                throw new Error(message);
            }
        } else {
            // Si no es JSON, es un error genérico o inesperado
            throw new Error(`Error HTTP: ${res.status} - ${res.statusText || 'Respuesta no JSON de error.'}`);
        }
      }

      // Procesar la respuesta según el formulario activo
      if (activeForm === 'short') {
        const data = await res.json(); // La respuesta para URL corta es JSON
        setShortUrl(data.url);
      } else { // activeForm === 'qr'
        // NUEVO: La respuesta es directamente la imagen binaria (blob)
        const imageBlob = await res.blob();
        const imageUrl = URL.createObjectURL(imageBlob); // Crea una URL de objeto temporal
        setQrCodeImage(imageUrl);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para limpiar la URL del objeto cuando el componente se desmonte
  // Esto es importante para evitar fugas de memoria
  useState(() => {
    return () => {
      if (qrCodeImage) {
        URL.revokeObjectURL(qrCodeImage);
      }
    };
  }, [qrCodeImage]); // Se ejecuta cuando qrCodeImage cambia o el componente se desmonta


  return (
    <div className={styles.minFormContainer}>
      <div className={styles.form}>
        <h2 className={styles.title}>Creación Rápida</h2>
        <div className={styles.toggleContainer}>
          <button
            onClick={() => { setActiveForm('short'); setShortUrl(''); setQrCodeImage(null); setError(''); setUrl(''); setCustomKey(''); setShowCustomKey(false); }} // Limpia estados al cambiar
            className={`${styles.toggleButton} ${activeForm === 'short' ? styles.toggleButtonActive : ''}`}
          >
            <IoMdLink />
            Link corto
          </button>
          <button
            onClick={() => { setActiveForm('qr'); setShortUrl(''); setQrCodeImage(null); setError(''); setUrl(''); setCustomKey(''); setShowCustomKey(false); }} // Limpia estados al cambiar
            className={`${styles.toggleButton} ${activeForm === 'qr' ? styles.toggleButtonActive : ''}`}
          >
            <FaQrcode />
            Código QR
          </button>
        </div>
      </div>

      {/* Formulario de URL corta */}
      {activeForm === 'short' && (
        <div className={styles.displayShort}>
          <form className={styles.urlForm} onSubmit={handleSubmit}>
            <p>Puedes crear 5 links cortos más este mes.</p>
            <div className={styles.inputContainer2}>
              <label htmlFor="long-url-short" className={styles.inputLabel}>Introducir tu URL de destino.</label>
              <div className={styles.inputContainer}>
                <div className={styles.displayInput}>
                  <div className={styles.inputWrapper}>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} id="long-url-short" placeholder="http://example.com/my-long-url" className={styles.urlInput} />
                  </div>
                  {showCustomKey && (
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        id="custom-key"
                        placeholder="e.g. brand name"
                        className={styles.urlInput}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.buttonContainer}>
                  <button type="submit" disabled={loading} className={styles.submitButton}>
                    <span className={styles.buttonText}>Crea tu Link</span>
                  </button>
                </div>
              </div>
            </div>
            <label className={styles.displayCheck}>
              <input
                type="checkbox"
                name="miCheck"
                onChange={() => setShowCustomKey((prev) => !prev)}
                checked={showCustomKey}
              />
              {showCustomKey ? 'Ocultar personalización' : 'Personalizar'}
            </label>
          </form>
          {error && <p className="text-red-600 mt-2">{error}</p>}

          {shortUrl && (
            <div className={styles.formDisplayShort}>
              <p className="text-sm text-gray-700">Tu URL acortada:</p>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                {shortUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Formulario de Código QR */}
      {activeForm === 'qr' && (
        <div className={styles.displayQr}>
          <form className={styles.urlForm} onSubmit={handleSubmit}>
            <p>Puedes crear 2 códigos QR más este mes.</p>
            <div className={styles.inputContainer2}>
              <label htmlFor="long-url-qr" className={styles.inputLabel}>Introducir tu URL de destino.</label>
              <div className={styles.inputContainer}>
                <div className={styles.inputWrapper}>
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} id="long-url-qr" placeholder="http://example.com/my-long-url" className={styles.urlInput} />
                </div>
                <div className={styles.buttonContainer}>
                  <button type="submit" disabled={loading} className={styles.submitButton}>
                    <span className={styles.buttonText}>Crea tu QR</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Sección para mostrar el QR */}
          <div className={styles.qrResultSection}>
            {loading && <p>Generando código QR...</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
            {qrCodeImage && (
              <div className={styles.qrDisplay}>
                <h4>QR Resultado:</h4>
                <div className={styles.conteinerqr}><img src={qrCodeImage} alt="Código QR generado" className={styles.qrImage} /></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}