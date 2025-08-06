import React, { useState, useEffect, useRef } from 'react';
import './LocationPicker.css';

const LocationPicker = ({ location, onLocationChange }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    if (isMapVisible && mapRef.current && !map) {
      // Check if Google Maps API is loaded
      if (window.google && window.google.maps) {
        try {
          initializeMap();
        } catch (error) {
          console.error('Google Maps initialization error:', error);
          setMapError(true);
          showFallbackMessage();
        }
      } else {
        console.warn('Google Maps API not loaded. Add your API key in public/index.html');
        setMapError(true);
        showFallbackMessage();
      }
    }
  }, [isMapVisible]);

  const showFallbackMessage = () => {
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          height: 400px; 
          background: linear-gradient(135deg, #f8f9fa, #e9ecef); 
          color: #495057;
          text-align: center;
          padding: 30px;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">🗺️</div>
          <h3 style="margin: 0 0 15px 0; color: #343a40;">Χάρτης μη διαθέσιμος</h3>
          <p style="margin: 0 0 15px 0; line-height: 1.5;">Για να λειτουργήσει ο χάρτης, χρειάζεται Google Maps API key.</p>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #6c757d;">Μπορείτε να εισάγετε τη διεύθυνση χειροκίνητα στο πεδίο παραπάνω.</p>
          <div style="
            background: #e3f2fd; 
            padding: 10px 15px; 
            border-radius: 5px; 
            border-left: 4px solid #2196f3;
            font-size: 13px;
            color: #1565c0;
            max-width: 300px;
          ">
            💡 Η τοποθεσία θα αποθηκευτεί κανονικά ακόμα και χωρίς χάρτη!
          </div>
        </div>
      `;
    }
  };

  const initializeMap = () => {
    if (!window.google || !window.google.maps) {
      setMapError(true);
      return;
    }
    
    try {
      // Default location (Athens, Greece)
      const defaultLocation = { lat: 37.9838, lng: 23.7275 };
      const mapLocation = location.lat && location.lng 
        ? { lat: location.lat, lng: location.lng } 
        : defaultLocation;

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: mapLocation,
        zoom: 13,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      const mapMarker = new window.google.maps.Marker({
        position: mapLocation,
        map: googleMap,
        draggable: true,
        title: 'Τοποθεσία Έργου'
      });

      // Handle marker drag
      mapMarker.addListener('dragend', () => {
        const position = mapMarker.getPosition();
        updateLocation(position.lat(), position.lng());
      });

      // Handle map click
      googleMap.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        mapMarker.setPosition({ lat, lng });
        updateLocation(lat, lng);
      });

      // Initialize Places Autocomplete only if available
      if (searchInputRef.current && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'gr' } // Restrict to Greece
          }
        );

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            googleMap.setCenter({ lat, lng });
            mapMarker.setPosition({ lat, lng });
            
            onLocationChange({
              address: place.formatted_address || place.name,
              lat: lat,
              lng: lng,
              placeId: place.place_id
            });
          }
        });
      }

      setMap(googleMap);
      setMarker(mapMarker);
      setMapError(false);
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(true);
      showFallbackMessage();
    }
  };

  const updateLocation = async (lat, lng) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      // Fallback without geocoding
      onLocationChange({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat: lat,
        lng: lng,
        placeId: null
      });
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        onLocationChange({
          address: address,
          lat: lat,
          lng: lng,
          placeId: response.results[0].place_id
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationChange({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat: lat,
        lng: lng,
        placeId: null
      });
    }
  };

  const handleToggleMap = () => {
    setIsMapVisible(!isMapVisible);
    // Reset map error when toggling
    if (!isMapVisible) {
      setMapError(false);
    }
  };

  const handleManualAddressChange = (e) => {
    const address = e.target.value;
    onLocationChange({
      address: address,
      lat: null,
      lng: null,
      placeId: null
    });
  };

  const handleClearLocation = () => {
    onLocationChange({
      address: '',
      lat: null,
      lng: null,
      placeId: null
    });
    // Don't clear the input ref here since we're using controlled input
  };

  return (
    <div className="location-picker">
      <label>📍 Τοποθεσία Έργου:</label>
      
      <div className="location-input-section">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Εισάγετε διεύθυνση (π.χ. Λεωφόρος Ρόδου 123, Ρόδος)..."
          value={location.address}
          onChange={handleManualAddressChange}
          className="location-search-input"
        />
        
        <div className="location-controls">
          <button
            type="button"
            onClick={handleToggleMap}
            className={`map-toggle-btn ${isMapVisible ? 'active' : ''}`}
          >
            {isMapVisible ? '📍 Κρύψε Χάρτη' : '🗺️ Δείξε Χάρτη'}
          </button>
          
          {location.address && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="clear-location-btn"
            >
              ✕ Καθαρισμός
            </button>
          )}
        </div>
      </div>

      {location.address && (
        <div className="selected-location">
          <strong>Επιλεγμένη Τοποθεσία:</strong>
          <p>{location.address}</p>
          {location.lat && location.lng && (
            <small>Συντεταγμένες: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</small>
          )}
        </div>
      )}

      {isMapVisible && (
        <div className="map-container">
          <div className="map-header">
            <h4>📍 Επιλέξτε Τοποθεσία</h4>
            <p>Κάντε κλικ στον χάρτη ή σύρετε τον δείκτη για να επιλέξετε την τοποθεσία του έργου</p>
          </div>
          <div ref={mapRef} className="google-map"></div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
