"use client";
import styles from './QRCodeForm.module.css';
import { BsArrowRight } from "react-icons/bs";
import { useState } from 'react';
import Image from "next/image"

export default function Form() {
   const [url, setUrl] = useState('');
   const [qrImageUrl, setQrImageUrl] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const handleSubmit = async (e) => {
    e.preventDefault(); // Previene que el formulario recargue la página

    if (!url.trim()) {
      setError('La URL no puede estar vacía.');
      return;
    }
    if (qrImageUrl) {
      URL.revokeObjectURL(qrImageUrl); // limpiamos el anterior
    }
    
    setLoading(true);
    setError('');

    try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/generate_qr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target_url : url }), // o la URL que querés convertir
  });

  if (!res.ok) {
        throw new Error("No se pudo generar el código QR.");
      }

  const blob = await res.blob(); // obtenemos la imagen
  const objectUrl = URL.createObjectURL(blob); // la convertimos a URL utilizable

  setQrImageUrl(objectUrl); // la guardamos en el estado
  } catch (err) {
    console.error("Error generando el QR:", err);
    setError('Error generando el código QR.');
  } finally {
    setLoading(false);
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
     {qrImageUrl ? (
      <div>
        <p>Código QR generado:</p>
        <img
        src={qrImageUrl}
        alt="QR Code"
        style={{ width: "180px", height: "auto", borderRadius: "20px" }}
        />
      </div>
      ) : (
      <Image
      src="/img/qrCode.png"
      alt="código qr por defecto"
      width={326}
      height={406}
      style={{ borderRadius: '40px' }}
      />
      )}
    </section>
  </>
);}
