import Image from "next/image"
import styles from '../Code/Code.module.css'

export default function Page() {
  return (
    <>
    <section className={styles.contentArea}>
        <Image src="/img/Imagen-QR.png" alt="Descripción de la imagen" width={326} height={406}/>
        <h1 className={styles.mainHeading}>
          Conecta con tu público con un simple escaneo
        </h1>
        <p className={styles.subHeading}>
          Crea un código QR a partir de cualquier link corto. A continuación, edita, personaliza y rastrea tus códigos QR aquí.
        </p>
        <button className={styles.ctaButton}>Crear un URLongless Code</button>
        </section>
    </>
  )
}