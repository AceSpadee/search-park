import React, { useState } from 'react';
import api from '../utils/axios';
import "../styling/PathColorUpdater.css";

const PathColorUpdater = ({ currentColor, onColorUpdate }) => {
  const [newColor, setNewColor] = useState(currentColor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleColorChange = (e) => {
    const value = e.target.value;
    setNewColor(value); // Update the color locally
  };

  const updateColor = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate hex color
      if (!/^#[0-9A-F]{6}$/i.test(newColor)) {
        setError('Invalid hex color code.');
        setLoading(false);
        return;
      }

      // Make API call to update color in backend
      await api.put('/api/session/path-color', { newColor });
      onColorUpdate(newColor); // Update the parent state with the new color
    } catch (err) {
      console.error('Error updating path color:', err);
      setError('Failed to update path color.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="path-color-updater">
      <h4>Update Path Color</h4>
      <div className="input-group">
        <input
          type="color"
          value={newColor}
          onChange={handleColorChange}
          disabled={loading}
          title="Pick a color"
        />
        <input
          type="text"
          value={newColor}
          onChange={handleColorChange}
          placeholder="#FFFFFF"
          maxLength="7"
          disabled={loading}
          title="Enter hex color code"
        />
      </div>
      <button
        onClick={updateColor}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : 'var(--background-color)',
          cursor: loading ? 'not-allowed' : 'pointer',
          border: '2px solid var(--border-color)',
          color: 'var(--title-color)',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '4px',
          transition: 'background 0.3s ease, color 0.3s ease',
        }}
        onMouseOver={(e) =>
          !loading && (e.target.style.background = `linear-gradient(to bottom right, #2a042a, ${newColor})`)
        }
        onMouseOut={(e) => !loading && (e.target.style.background = 'var(--background-color)')}
      >
        {loading ? 'Updating...' : 'Update Color'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default PathColorUpdater;