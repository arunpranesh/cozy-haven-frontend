import React from 'react';
import '../styles/base.css';
import '../styles/about.css';
import { MdHotelClass, MdExplore } from 'react-icons/md';
import { RiFlashlightLine, RiPriceTag3Line, RiShieldCheckLine } from 'react-icons/ri';

const features = [
  { icon: <MdHotelClass />, title: 'Handpicked Hotels', desc: 'A wide range of quality stays, from luxury resorts to cozy homestays.' },
  { icon: <RiFlashlightLine />, title: 'Easy Booking', desc: 'User-friendly platform for quick, hassle-free reservations.' },
  { icon: <RiPriceTag3Line />, title: 'Best Prices', desc: 'Transparent pricing and exclusive deals for the best value.' },
  { icon: <MdExplore />, title: 'Local Experiences', desc: 'Discover hidden gems and local favorites in every destination.' },
  { icon: <RiShieldCheckLine />, title: 'Secure & Reliable', desc: 'Your safety and satisfaction are our top priorities.' },
];

const About = () => (
  <div className="about-container">
    <h2>About CozyHaven</h2>
    <p className="about-lead">
      Welcome to <span className="about-brand">CozyHaven</span> – your trusted partner for discovering and booking the perfect stay across South India and beyond!
    </p>
    <div className="about-section">
      <h3>Our Mission</h3>
      <p>
        At CozyHaven, we believe every journey deserves a comfortable, memorable, and hassle-free stay. Our mission is to connect travelers with a curated selection of hotels, resorts, and unique stays, making it easy to find the right place for every occasion and budget.
      </p>
    </div>
    <div className="about-section">
      <h3>Why Choose CozyHaven?</h3>
      <div className="about-features-row">
        {features.map(f => (
          <div className="about-feature-card" key={f.title}>
            <span className="about-feature-icon">{f.icon}</span>
            <div className="about-feature-title">{f.title}</div>
            <div className="about-feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="about-section">
      <h3>For Hotel Owners</h3>
      <p>
        CozyHaven empowers hotel owners to reach a wider audience, manage bookings efficiently, and grow their business with powerful tools and insights. Join our network and let your property shine!
      </p>
    </div>
    <div className="about-section">
      <h3>Start Your Journey</h3>
      <p>
        Whether you’re planning a family vacation, a romantic getaway, or a business trip, CozyHaven is here to help you find your perfect stay. Explore our platform, discover top destinations, and book with confidence.
      </p>
    </div>
    <div className="about-footer">Thank you for choosing CozyHaven. Your comfort is our promise!</div>
  </div>
);

export default About; 