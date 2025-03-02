import React, { useState } from 'react';
import Banner from "../../components/banner/Banner";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import itemsData from "../../services/itemsData";
import "./Items.css";

function Items() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = itemsData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <Banner title={"Items"} />

      <div className="items-container">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-buttons">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${selectedCategory === 'active' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${selectedCategory === 'passive' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('passive')}
            >
              Passive
            </button>
            <button
              className={`filter-btn ${selectedCategory === 'trinket' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('trinket')}
            >
              Trinket
            </button>
          </div>
        </div>

        <div className="items-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              <img src={item.image} alt={item.name} className="item-image" />
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <span className={`item-type ${item.type}`}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Items;