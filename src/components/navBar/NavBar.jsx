import React from 'react';
import styles from './NavBar.module.css'
import { useNavigate } from 'react-router-dom'

function NavBar() {
    const navigate = useNavigate()
    const handleButtonClick = (ruta) => {
        navigate(ruta)
    }
    return (
        <nav className={styles.navbar}>
            <div className={styles.avbarMenu}>
                <div className={styles.navbarEnd}>
                    <a onClick={() => handleButtonClick('/')} className={styles.navbarItem}>
                        Home
                    </a>
                    <a onClick={() => handleButtonClick('/newData')} className={styles.navbarItem}>
                        Agregar Info
                    </a>
                    <a href="#" className={styles.navbarItem}>
                        Analizar Info
                    </a>
                </div>
            </div>
        </nav>
  );
}

export default NavBar;
