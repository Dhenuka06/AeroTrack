import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { getAQICategoryDetails } from '../utils/aqiUtils';

// Component to dynamically re-center map when selected city changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.flyTo(center, 6, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function AQIMap({ cityOverviewList, selectedCity, onSelectCity }) {
  const defaultCenter = selectedCity
    ? [selectedCity.latitude, selectedCity.longitude]
    : [20.0, 0.0];

  return (
    <div className="map-section">
      <div className="section-header">
        <h3>Interactive AQI Map</h3>
        <span className="section-sub">Color-coded live severity monitoring by location</span>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={defaultCenter}
          zoom={3}
          scrollWheelZoom={true}
          style={{ height: '420px', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapRecenter center={selectedCity ? [selectedCity.latitude, selectedCity.longitude] : null} />

          {cityOverviewList.map((item) => {
            const lat = item.latitude;
            const lng = item.longitude;
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

            const aqiValue = item.reading ? item.reading.aqi : 50;
            const category = getAQICategoryDetails(aqiValue);
            const isSelected = selectedCity && selectedCity.name === item.cityName;

            return (
              <CircleMarker
                key={item.cityId || item.cityName}
                center={[lat, lng]}
                radius={isSelected ? 16 : 12}
                pathOptions={{
                  fillColor: category.color,
                  fillOpacity: 0.85,
                  color: isSelected ? '#ffffff' : category.borderColor,
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => {
                    onSelectCity({
                      _id: item.cityId,
                      name: item.cityName,
                      country: item.country,
                      latitude: lat,
                      longitude: lng,
                    });
                  },
                }}
              >
                <Popup>
                  <div className="map-popup-card">
                    <h4 className="popup-title">{item.cityName}, {item.country}</h4>
                    <div className="popup-score-badge" style={{ backgroundColor: category.bgColor, color: category.color }}>
                      <span className="popup-score">{aqiValue}</span>
                      <span className="popup-cat">{category.label}</span>
                    </div>
                    {item.reading && (
                      <div className="popup-pollutants">
                        <span>PM2.5: <strong>{item.reading.pollutants?.pm2_5?.concentration ?? 'N/A'} µg/m³</strong></span>
                        <span>PM10: <strong>{item.reading.pollutants?.pm10?.concentration ?? 'N/A'} µg/m³</strong></span>
                      </div>
                    )}
                    <button
                      onClick={() => onSelectCity({
                        _id: item.cityId,
                        name: item.cityName,
                        country: item.country,
                        latitude: lat,
                        longitude: lng,
                      })}
                      className="popup-select-btn"
                    >
                      View Detailed Dashboard
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        <div className="map-legend">
          <div className="legend-title">AQI Index Legend:</div>
          <div className="legend-items">
            <span className="legend-chip" style={{ backgroundColor: '#10B981', color: '#fff' }}>0-50 Good</span>
            <span className="legend-chip" style={{ backgroundColor: '#F59E0B', color: '#fff' }}>51-100 Moderate</span>
            <span className="legend-chip" style={{ backgroundColor: '#F97316', color: '#fff' }}>101-150 Sensitive</span>
            <span className="legend-chip" style={{ backgroundColor: '#EF4444', color: '#fff' }}>151-200 Unhealthy</span>
            <span className="legend-chip" style={{ backgroundColor: '#8B5CF6', color: '#fff' }}>201-300 Very Unhealthy</span>
            <span className="legend-chip" style={{ backgroundColor: '#7F1D1D', color: '#fff' }}>301+ Hazardous</span>
          </div>
        </div>
      </div>
    </div>
  );
}
