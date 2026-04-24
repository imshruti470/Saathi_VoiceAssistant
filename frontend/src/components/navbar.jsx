import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = () => {
    setIsAuthenticated(!!sessionStorage.getItem('token'));
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="glass-card" style={styles.navbar}>
      <div style={styles.brand}>
        <Link to="/" style={styles.navLinkBrand}>
          <span style={{color: 'var(--accent-blue)'}}>Smart</span>Assistant
        </Link>
      </div>
      <ul style={styles.navList}>
        <li style={styles.navItem}><Link to="/" style={styles.navLink}>Home</Link></li>
        <li style={styles.navItem}><Link to="/recording" style={styles.navLink}>Services</Link></li>
        <li style={styles.navItem}><Link to="/contact" style={styles.navLink}>Contact</Link></li>
        
        {isAuthenticated ? (
          <li style={styles.navItem}>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </li>
        ) : (
          <>
            <li style={styles.navItem}><Link to="/login" style={styles.navLink}>Log In</Link></li>
            <li style={styles.navItem}>
              <Link to="/signup" style={{...styles.navLink, background: 'var(--accent-blue)', color: '#0b0f19', padding: '8px 16px'}}>Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 30px",
    position: "fixed",
    width: "calc(100% - 40px)",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    border: "1px solid var(--glass-border)",
  },
  brand: {
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  navList: {
    listStyleType: "none",
    display: "flex",
    gap: "30px",
    margin: 0,
    padding: 0,
  },
  navItem: {
    display: "inline-block",
  },
  navLinkBrand: {
    textDecoration: "none",
    color: "var(--text-primary)",
  },
  navLink: {
    textDecoration: "none",
    color: "var(--text-secondary)",
    fontSize: "16px",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid var(--accent-purple)",
    color: "var(--accent-purple)",
    fontSize: "16px",
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  }
};

export default Navbar;
