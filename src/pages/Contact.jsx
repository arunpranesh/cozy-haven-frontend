import React from 'react';
import '../styles/contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p className="contact-lead">
        We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out to us through any of the channels below. Our team is always happy to help and connect with our community.
      </p>
      <div className="contact-info">
        <h4>Connect with us</h4>
        <p>
          <strong>Instagram:</strong> <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">@cozyhaven</a>
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:info@cozyhaven.com">info@cozyhaven.com</a>
        </p>
        <p>
          <strong>Phone:</strong> <a href="tel:+911234567890">+91 9988774411</a>
        </p>
        <p>
          <strong>Office:</strong> 574, 2nd Cozy Street, Haven City, 560001, Hexaware, India
        </p>
      </div>
      <div className="about-footer" style={{marginTop: 32, textAlign: 'center'}}>
        Thank you for being a part of the Cozy Haven family! We look forward to making your stay memorable and delightful.
      </div>
    </div>
  );
};

export default Contact; 