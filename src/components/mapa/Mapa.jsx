import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './mapa.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function Mapa() {
  const position = [36.9741, -122.0308];

  return (
    <div className="map-container">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={defaultIcon}>
          <Popup className="custom-popup">
            <div className="popup-content">
              <img 
                src="EdmunmcMillen.jpg" 
                alt="Edmund McMillen" 
                className="popup-image"
              />
              <h3>Edmund McMillen's Hometown 🎮</h3>
              <p>Santa Cruz, California</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Mapa;