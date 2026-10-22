import React, { useState } from 'react';
import { Search, Plus, MapPin, X, Check } from 'lucide-react';
import { addNewCity } from '../services/api';

export default function SearchBar({ cities = [], selectedCity, onSelectCity, onCityAdded }) {
  const [query, setQuery]           = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ name: '', country: '', latitude: '', longitude: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  const filtered = cities.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.country.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.country || !form.latitude || !form.longitude) {
      setFormError('All fields are required.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      const res = await addNewCity({
        name:      form.name.trim(),
        country:   form.country.trim(),
        latitude:  parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      if (res.success) {
        setShowModal(false);
        setForm({ name: '', country: '', latitude: '', longitude: '' });
        onCityAdded?.(res.data, res.demoMode);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add city.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="search-bar-container">
      {/* Search input */}
      <div className="search-input-group">
        <Search className="search-icon" size={17} />
        <input
          type="text"
          className="search-input"
          placeholder="Search tracked cities (e.g. Tokyo, London, Cairo)…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="clear-search-btn" onClick={() => setQuery('')}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* City chips */}
      <div className="quick-city-chips">
        <span className="chips-label">Tracked Locations:</span>
        <div className="chips-scroll">
          {filtered.map(city => {
            const active = selectedCity?.name === city.name;
            return (
              <button
                key={city._id || city.name}
                onClick={() => onSelectCity(city)}
                className={`city-chip${active ? ' active' : ''}`}
              >
                <MapPin size={12} />
                <span>{city.name}</span>
                {active && <Check size={12} />}
              </button>
            );
          })}
          <button className="city-chip add-chip" onClick={() => setShowModal(true)}>
            <Plus size={13} />
            <span>Add City</span>
          </button>
        </div>
      </div>

      {/* Add-city modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Track a New City</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {formError && <p className="error-alert">{formError}</p>}

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>City Name</label>
                <input placeholder="e.g. San Francisco" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input placeholder="e.g. United States" value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" placeholder="37.7749" value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" placeholder="-122.4194" value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding…' : 'Start Tracking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
