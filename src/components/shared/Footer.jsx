import React from 'react';
import '../../styles/footer.css';

const Footer = () => (
  <footer className="footer-container">
    <div className="footer-content">
      <div className="footer-brand">CozyHaven</div>
      <div className="footer-links">
        <a href="/hotels">Hotels</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
      <div className="footer-copy">&copy; {new Date().getFullYear()} CozyHaven. Find our Perfect Stay</div>
    </div>
  </footer>
);

export default Footer; 