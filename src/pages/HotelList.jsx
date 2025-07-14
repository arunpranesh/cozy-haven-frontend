import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/hotels.css';
import {Link} from 'react-router-dom';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    ac: '',
    bedType: '',
    minPrice: '',
    maxPrice: ''
  });

  const fetchHotels = async () => {
    try {
      const res = await api.get('/api/Hotel');
      setHotels(res.data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    }
  };

  const searchHotels = async () => {
    const { location, ac, bedType, minPrice, maxPrice } = filters;
    try {
      const res = await api.get(`/api/Hotel/search`, {
        params: { location, ac, bedType, minPrice, maxPrice }
      });
      setHotels(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = e => {
    e.preventDefault();
    searchHotels();
  };

  return (
    <div className="hotel-list-container">
      <h2>Find Your Stay</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <input name="location" placeholder="Location" onChange={handleChange} />
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

      <div className="hotel-list">
        {hotels.length === 0 && <p>No hotels found.</p>}
        {hotels.map(hotel => (
          <div key={hotel.id} className="hotel-card">
            <h3>{hotel.name}</h3>
            <p><strong>Location:</strong> {hotel.location}</p>
            <p>{hotel.description}</p>
            <p><strong>Amenities:</strong> {hotel.amenities}</p>
            <p><strong>Owner:</strong> {hotel.ownerName}</p>
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="hotel-image"
            />
            <h3>
            <Link to={`/hotels/${hotel.id}`}>{hotel.name}</Link>
            </h3>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelList;
