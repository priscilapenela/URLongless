import * as React from "react";
import styles from './Footer.module.css';
import { FaGithub } from 'react-icons/fa';

export default function Footer() {
 return (
    <>
    <footer className={styles.siteFooter}>
        <div className={styles.footerContent}>
            <h2 className={styles.footerLogo}>URLongless</h2>
            <p className={styles.footerCopyright}>© 2025 URLongless | Handmade in Argentina</p>
            <a href="https://github.com/priscilapenela/URLongless" target="_blank"><i className={styles.fa}><FaGithub /></i></a>
        </div>
    </footer>
    </>
 );

}