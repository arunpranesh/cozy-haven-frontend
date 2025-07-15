import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import '../styles/base.css';
import '../styles/hotels.css';
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import bangaloreImg from '../assets/locations/banglore.jpg';
import ootyImg from '../assets/locations/Ooty.webp';
import chennaiImg from '../assets/locations/Chennai.jpg';
import coimbatoreImg from '../assets/locations/coimbatore.jpeg';
import pondyImg from '../assets/locations/pondy.jpg';
import hyderabadImg from '../assets/locations/hyderabad.webp';
import kochiImg from '../assets/locations/kochi.jpg';
import mysoreImg from '../assets/locations/mysore.jpg';
import munnarImg from '../assets/locations/munnar.webp';
import maduraiImg from '../assets/locations/madurai.jpeg';
import kodaiImg from '../assets/locations/kodai.jpg';
import trivandrumImg from '../assets/locations/trivandrum.jpeg';

const FAMOUS_LOCATIONS = [
  { name: 'Bangalore', image: bangaloreImg },
  { name: 'Ooty', image: ootyImg },
  { name: 'Chennai', image: chennaiImg },
  { name: 'Coimbatore', image: coimbatoreImg },
  { name: 'Pondicherry', image: pondyImg },
  { name: 'Hyderabad', image: hyderabadImg },
  { name: 'Kochi', image: kochiImg },
  { name: 'Mysore', image: mysoreImg },
  { name: 'Munnar', image: munnarImg },
  { name: 'Madurai', image: maduraiImg },
  { name: 'Kodaikanal', image: kodaiImg },
  { name: 'Trivandrum', image: trivandrumImg },
];

const locationImages = {
  'Bangalore': bangaloreImg,
  'Ooty': ootyImg,
  'Chennai': chennaiImg,
  'Coimbatore': coimbatoreImg,
  'Pondicherry': pondyImg,
  'Hyderabad': hyderabadImg,
  'Kochi': kochiImg,
  'Mysore': mysoreImg,
  'Munnar': munnarImg,
  'Madurai': maduraiImg,
  'Kodaikanal': kodaiImg,
  'Trivandrum': trivandrumImg,
};

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [hotelPrices, setHotelPrices] = useState({});
  const [filters, setFilters] = useState({
    location: '',
    ac: '',
    bedType: '',
    minPrice: '',
    maxPrice: ''
  });
  const [locations, setLocations] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // fallback if needed

  const fetchHotels = async () => {
    try {
      const res = await api.get('/api/Hotel', { headers: { Authorization: `Bearer ${token}` } });
      setHotels(res.data);
      // Extract unique locations
      const locs = Array.from(new Set(res.data.map(h => h.location).filter(Boolean)));
      setLocations(locs);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    }
  };

  const searchHotels = async () => {
    const { location, ac, bedType, minPrice, maxPrice } = filters;
    try {
      const res = await api.get(`/api/Hotel/search`, {
        params: { location, ac, bedType, minPrice, maxPrice },
        headers: { Authorization: `Bearer ${token}` }
      });
      setHotels(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    // Fetch min price for each hotel after hotels are loaded
    const fetchPrices = async () => {
      const prices = {};
      await Promise.all(hotels.map(async (hotel) => {
        try {
          const res = await api.get(`/api/Room/by/${hotel.id}`, { headers: { Authorization: `Bearer ${token}` } });
          const rooms = res.data;
          if (rooms && rooms.length > 0) {
            const minPrice = Math.min(...rooms.map(r => r.baseFare));
            prices[hotel.id] = minPrice;
          }
        } catch {}
      }));
      setHotelPrices(prices);
    };
    if (hotels.length > 0) fetchPrices();
  }, [hotels]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    if (name === 'location') {
      if (value.trim() === '') {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      } else {
        const filtered = locations.filter(loc =>
          loc.toLowerCase().includes(value.toLowerCase())
        );
        setLocationSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    }
  };

  const handleSuggestionClick = (loc) => {
    setFilters(f => ({ ...f, location: loc }));
    setShowSuggestions(false);
    locationInputRef.current.blur();
  };

  const handleLocationBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  const handleSearch = e => {
    e.preventDefault();
    searchHotels();
  };

  // Famous location click handler
  const handleFamousLocation = (loc) => {
    setFilters(f => ({ ...f, location: loc }));
    // Optionally, trigger search immediately:
    searchHotelsWithLocation(loc);
  };

  const searchHotelsWithLocation = async (loc) => {
    try {
      const res = await api.get(`/api/Hotel/search`, {
        params: { ...filters, location: loc },
        headers: { Authorization: `Bearer ${token}` }
      });
      setHotels(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  return (
    <div className="hotel-list-container">
      <h2>Find Your Stay</h2>
      <form className="search-form" onSubmit={handleSearch} autoComplete="off">
        <div style={{ position: 'relative', flex: '1 1 160px' }}>
          <input
            name="location"
            placeholder="Location"
            onChange={handleChange}
            value={filters.location}
            ref={locationInputRef}
            onFocus={() => {
              if (filters.location && locationSuggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={handleLocationBlur}
            autoComplete="off"
          />
          {showSuggestions && (
            <div className="location-suggestions-dropdown">
              {locationSuggestions.map((loc, i) => (
                <div
                  key={i}
                  className="location-suggestion"
                  onMouseDown={() => handleSuggestionClick(loc)}
                >
                  {loc}
                </div>
              ))}
            </div>
          )}
        </div>
        <select name="ac" onChange={handleChange}>
          <option value="">AC/Non-AC</option>
          <option value="true">AC</option>
          <option value="false">Non-AC</option>
        </select>
        <select name="bedType" onChange={handleChange}>
          <option value="">Bed Type</option>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="King">King</option>
        </select>
        <input name="minPrice" placeholder="Min Price" type="number" onChange={handleChange} />
        <input name="maxPrice" placeholder="Max Price" type="number" onChange={handleChange} />
        <button type="submit">Search</button>
      </form>
      {/* Famous Locations */}
      <h3 style={{marginTop: 36, marginBottom: 12}}>Top Destinations</h3>
      <div className="famous-locations-carousel">
        <div className="famous-locations-track">
          {FAMOUS_LOCATIONS.map(loc => (
            <div
              key={loc.name}
              className="famous-location-card"
              onClick={() => handleFamousLocation(loc.name)}
              style={{cursor: 'pointer'}}
            >
              <img src={loc.image} alt={loc.name} className="famous-location-img" />
              <div className="famous-location-name">{loc.name}</div>
            </div>
          ))}
        </div>
      </div>
      <h3 style={{marginTop: 32, marginBottom: 12}}>Featured stays for you</h3>
      <div className="famous-hotels-carousel">
        <div className="carousel-track">
          {hotels.map(hotel => (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="hotel-card-link carousel-card"
            >
              <div className="hotel-card">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="hotel-image"
                />
                <div className="hotel-card-content">
                  <div className="location">{hotel.location}</div>
                  <h3>{hotel.name}</h3>
                  <div className="description">{hotel.description}</div>
                  <div className="amenities">
                    {hotel.amenities && hotel.amenities.split(',').map((a, i) => (
                      <span className="amenity-tag" key={i}>{a.trim()}</span>
                    ))}
                  </div>
                  {hotelPrices[hotel.id] && (
                    <div className="hotel-price">From ₹{hotelPrices[hotel.id]}</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelList;
