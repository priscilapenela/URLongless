'use client';
import ShortForm from './components/ShortForm.jsx';
import QRCodeForm from './components/QRCodeForm.jsx';
import styles from './styles/Home.module.css';
import { IoMdLink } from "react-icons/io";
import { IoQrCodeOutline } from "react-icons/io5";
import { MdCheckCircleOutline } from "react-icons/md";
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { useState } from 'react';
import { Fade } from "react-awesome-reveal";


export default function Page() {
  const [activeForm, setActiveForm] = useState('short'); // 'short' o 'qr'
  const [formKey, setFormKey] = useState(0);

  const handleFormChange = (type) => {
    setActiveForm(type);
    setFormKey(prev => prev + 1); // fuerza un nuevo render
  };

  return (
    <>
    <Header/>
    <main className={styles.mainContent}>
      <section className={styles.heroSection}>
        <h2 className={styles.heroTitle}>Construí fuertes conexiones digitales</h2>
        <p className={styles.heroDescription}>Utilice acortadores de URL y códigos QR para atraer a su audiencia y conectarlos con la información correcta.</p>
      </section>
      <section className={styles.featuresContainer}>
        <div className={styles.buttons}>
          <button onClick={() => { handleFormChange('short'); setActiveForm('short');}} className={`${styles.featureCard} ${activeForm === 'short' ? styles.featureCardActive : ''}`}>
          <IoMdLink />
          <h3 className={styles.featureTitle}>Link corto</h3>
        </button>
        <button onClick={() => { handleFormChange('qr'); setActiveForm('qr');}} className={`${styles.featureCard} ${activeForm === 'qr' ? styles.featureCardActive : ''}`}>
          <IoQrCodeOutline />
          <h3 className={styles.featureTitle}>Código QR</h3>
        </button>
        </div>
        <Fade key={formKey} triggerOnce={false}>
        {activeForm === 'short' ? <ShortForm /> : <QRCodeForm />}
        </Fade>
      </section>
      <section className={styles.benefitsSection}>
        <h2 className={styles.benefitsTitle}>Regístrate GRATIS. Tu plan gratuito incluye:</h2>
        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <MdCheckCircleOutline />
            <p className={styles.benefitText}>5 enlaces cortos/mes</p>
          </div>
          <div className={styles.benefitItem}>
            <MdCheckCircleOutline />
            <p className={styles.benefitText}>Clics en enlaces ilimitados</p>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
    </>
  );
}