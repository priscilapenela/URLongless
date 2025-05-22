import styles from './Home.module.css'
import { FaRegCircle } from "react-icons/fa6";
import MiniForm from '../../components/MiniForm';

export default function Page() {
  return (
    <>
    <section className={styles.featureCards}>
      <MiniForm/>
    </section>
    <section className={styles.gettingStarted}>
      <div className={styles.gettingStartedContainer}>
        <h2 className={styles.gettingStartedTitle}>Primeros pasos en URLongless</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.step1}>
              <FaRegCircle />
              <p className={styles.stepDescription}>Crea un URLongless Link.</p>
           </div>
           <a href="#" className={styles.stepLink}>Crear un Link</a>
          </div>
          <div className={styles.step}>
            <div className={styles.step1}>
              <FaRegCircle />
              <p className={styles.stepDescription}>Crea un URLongless Code.</p> 
            </div>
            <a href="#" className={styles.stepLink}>Crear un Código QR</a>
          </div>
          <div className={styles.step}>
            <div className={styles.step1}>
              <FaRegCircle />
              <p className={styles.stepDescription}>Selecciona, escaneo o comparte.</p>
            </div>
            <a href="#" className={styles.stepLink}>Crear un Código QR</a>
          </div>
          <div className={styles.step}>
            <div className={styles.step1}>
               <FaRegCircle />
               <p className={styles.stepDescription}>Echa un vistazo a URLongless Analytics.</p>
            </div>
            <a href="#" className={styles.stepLink}>Ver la demo de Analytics</a>
          </div>
        </div>
     </div>
    </section>
    </>
  )
}