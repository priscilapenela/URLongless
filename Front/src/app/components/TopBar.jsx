import { IoMdMenu } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import styles from './TopBar.module.css'

export default function TopBar(){
    return(
        <header className={styles.topBar}>
           <div className={styles.mobileMenu}>
             <IoMdMenu/>
           </div>
           <div className={styles.searchContainer}>
             <IoSearch/>
             <span>Search...</span>
          </div>
          <div className={styles.userProfile}>
             <FaUser />
             <span className={styles.userName}>Usuario</span>
             <IoMdArrowDropdown/>
          </div>
        </header>
    )
}