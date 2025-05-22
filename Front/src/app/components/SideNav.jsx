import * as React from "react";
import styles from './SideNav.module.css';
import { IoMdLink } from "react-icons/io";
import { MdHome } from "react-icons/md";
import { IoQrCodeOutline } from "react-icons/io5";
import { GrAnalytics } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";
import Link from 'next/link'

export default function Aside() {
  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link className={styles.logo} href="/">URLongless</Link>
          <button className={styles.newButton}>New</button>
       </div>
       <div className={styles.navMenu}>
         <Link href=".\Home" className={styles.navItem}>
            <MdHome />
            <span>Home</span>
         </Link>
         <Link href='.\Link' className={styles.navItem}>
            <IoMdLink />
            <span>Links</span>
         </Link>
         <Link href=".\Code" className={styles.navItem}>
            <IoQrCodeOutline />
            <span>QR Code</span>
         </Link>
         <Link href=".\Analytics" className={styles.navItem}>
            <GrAnalytics />
            <span>Analytics</span>
         </Link>
       </div>
       <a href="#" className={styles.navItem}>
          <IoMdSettings />
          <span>Configuracion</span>
       </a>
      </aside>
    </>
  );
} 