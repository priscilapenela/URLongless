import * as React from "react";
import Link from 'next/link';
import styles from './Header.module.css';
import { TbWorld } from "react-icons/tb";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdMenu } from "react-icons/io";


export default function Header() {
  return (
    <>
      <header className={styles.siteHeader}>
        <div className= {styles.headerContent}>
    <h1 className={styles.logo}><Link href="/">URLongless</Link></h1>
    <nav className={styles.navLinks}>
      <a href="#" className={styles.navLink}>Plataforma</a>
      <a href="#" className={styles.navLink}>Soluciones</a>
      <a href="#" className={styles.navLink}>Precios</a>
    </nav>
    <div className={styles.headerActions}>
      <div className={styles.languageSelector}>
        <div className={styles.languageIconText}>
          <TbWorld />
          <span className={styles.languageText}>ES</span>
        </div>
        <IoMdArrowDropdown />
      </div>
      <Link className={styles.loginButton} href=".\Home">Ingresar</Link>
      <a className={styles.signupButton}>Registrate Gratis</a>
    </div>
    <div className={styles.mobileMenu}>
      <IoMdMenu />
    </div>
  </div>
</header>
    </>
  );
}

