import Image from "next/image"
import styles from '../Link/Link.module.css'

export default function Page() {
  return(
  <>
    <section className={styles.contentArea}>
      <Image src="/img/Imagen-Link.png" alt="Link" width={326} height={406} />
       <h1 className={styles.mainHeading}>Generar más clics es tan fácil como crear un link</h1>
       <p className={styles.subHeading}> Acorta los links largos y llama la atención al personalizar su texto.</p>
       <button className={styles.ctaButton}>Crear un URLongless</button>
    </section>
  </>
  );
}