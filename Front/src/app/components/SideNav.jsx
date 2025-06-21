"use client";
import * as React from "react";
import styles from './SideNav.module.css';
import { IoMdLink } from "react-icons/io";
import { MdHome } from "react-icons/md";
import { IoQrCodeOutline } from "react-icons/io5";
import { GrAnalytics } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";
import { usePathname } from 'next/navigation'; 
import Link from 'next/link'

export default function SideNav({ className }) {
  const pathname = usePathname();
  return (
    <>
      <aside className={`${styles.sidebar} ${className}`}>
        <div className={styles.sidebarHeader}>
          <Link className={styles.logo} href="/">URLongless</Link>
          <button className={styles.newButton}>New</button>
       </div>
       <div className={styles.navMenu}>
         <Link href=".\Home" className={`${styles.navItem} ${pathname === '/Home' ? styles.active : ''}`}>
            <MdHome />
            <span>Home</span>
         </Link>
         <Link href='.\Link' className={`${styles.navItem} ${pathname === '/Link' ? styles.active : ''}`}>
            <IoMdLink />
            <span>Links</span>
         </Link>
         <Link href=".\Code" className={`${styles.navItem} ${pathname === '/Code' ? styles.active : ''}`}>
            <IoQrCodeOutline />
            <span>QR Code</span>
         </Link>
         <Link href=".\Analytics" className={`${styles.navItem} ${pathname === '/Analytics' ? styles.active : ''}`}>
            <GrAnalytics />
            <span>Analytics</span>
         </Link>
       </div>
       <a href="#" className={`${styles.navItem} mt-auto`}>
          <IoMdSettings />
          <span>Configuracion</span>
       </a>
      </aside>
    </>
  );
} 