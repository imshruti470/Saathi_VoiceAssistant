import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p style={styles.footerText}>© 2026 Smart Voice Assistant. All Rights Reserved. Made with ❤️ by Shruti Mishra</p>
    </footer>
  );
};

const styles = {
  footer: {
    background: "linear-gradient(135deg, #1e1e2f, #2a2a3a)",
    color: "#fff",
    padding: "15px 0",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "500",
    position: "fixed",
    bottom: "0",
    width: "100%",
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.2)",
  },
  footerText: {
    margin: 0,
    letterSpacing: "0.5px",
  },
  "@media (max-width: 768px)": {
    footer: {
      fontSize: "12px",
      padding: "10px 0",
    },
  },
};

export default Footer;
