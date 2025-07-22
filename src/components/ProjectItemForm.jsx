import React, { useState } from 'react';
import './ProjectItemForm.css';

const ProjectItemForm = ({ onSubmit, onCancel, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    type: initialData.type || 'measurement',
    title: initialData.title || '',
    client: initialData.client || '',
    date: initialData.date || '',
    startEndDates: initialData.startEndDates || '',
    stage: initialData.stage || '',
    photos: initialData.photos || [],
    measurements: initialData.measurements || { width: '', height: '', area: '' },
    deliveryDetails: initialData.deliveryDetails || { quantity: '', type: '' },
    notes: initialData.notes || ''
  });

  const [errors, setErrors] = useState({});

  const itemTypes = [
    { value: 'measurement', label: '📏 Μέτρηση' },
    { value: 'delivery', label: '📦 Παραγγελία' },
    { value: 'installation', label: '🔧 Εγκατάσταση' },
    { value: 'maintenance', label: '⚙️ Συντήρηση' },
    { value: 'photo', label: '📷 Φωτογραφία' },
    { value: 'document', label: '📄 Έγγραφο' }
  ];

  const stages = [
    'Προγραμματισμός',
    'Μέτρηση',
    'Παραγγελία',
    'Παραγγελία - Παραγωγή',
    'Παραγγελία - Τοποθέτηση',
    'Παραγγελία - Ολοκλήρωση',
    'Εγκατάσταση',
    'Έλεγχος',
    'Παράδοση'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMeasurementChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  const handleDeliveryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      deliveryDetails: {
        ...prev.deliveryDetails,
        [field]: value
      }
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newPhotos.push({
            file: file,
            url: event.target.result,
            name: file.name
          });
          
          if (newPhotos.length === files.length) {
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, ...newPhotos]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Ο τίτλος είναι υποχρεωτικός';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Ο πελάτης είναι υποχρεωτικός';
    }

    if (!formData.date) {
      newErrors.date = 'Η ημερομηνία είναι υποχρεωτική';
    }

    if (!formData.stage) {
      newErrors.stage = 'Το στάδιο είναι υποχρεωτικό';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'measurement':
        return (
          <div className="type-specific-fields">
            <h3>📏 Στοιχεία Μέτρησης</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Πλάτος</label>
                <input
                  type="text"
                  value={formData.measurements.width}
                  onChange={(e) => handleMeasurementChange('width', e.target.value)}
                  placeholder="π.χ. 3.5m"
                />
              </div>
              <div className="form-group">
                <label>Ύψος</label>
                <input
                  type="text"
                  value={formData.measurements.height}
                  onChange={(e) => handleMeasurementChange('height', e.target.value)}
                  placeholder="π.χ. 2.8m"
                />
              </div>
              <div className="form-group">
                <label>Εμβαδόν</label>
                <input
                  type="text"
                  value={formData.measurements.area}
                  onChange={(e) => handleMeasurementChange('area', e.target.value)}
                  placeholder="π.χ. 9.8m²"
                />
              </div>
            </div>
          </div>
        );
      
      case 'delivery':
        return (
          <div className="type-specific-fields">
            <h3>📦 Στοιχεία Παραγγελίας</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Ποσότητα</label>
                <input
                  type="text"
                  value={formData.deliveryDetails.quantity}
                  onChange={(e) => handleDeliveryChange('quantity', e.target.value)}
                  placeholder="π.χ. 15 τεμάχια"
                />
              </div>
              <div className="form-group">
                <label>Τύπος/Περιγραφή</label>
                <input
                  type="text"
                  value={formData.deliveryDetails.type}
                  onChange={(e) => handleDeliveryChange('type', e.target.value)}
                  placeholder="π.χ. Διπλό Τζάμι 6mm"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="project-item-form-container">
      <form onSubmit={handleSubmit} className="project-item-form">
        <h2>{isEditing ? 'Επεξεργασία Στοιχείου' : 'Προσθήκη Νέου Στοιχείου'}</h2>

        {/* Τύπος Στοιχείου */}
        <div className="form-group">
          <label>Τύπος Στοιχείου *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={errors.type ? 'error' : ''}
          >
            {itemTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && <span className="error-message">{errors.type}</span>}
        </div>

        {/* Τίτλος */}
        <div className="form-group">
          <label>Τίτλος *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
            placeholder="π.χ. Μέτρηση Κεντρικής Εισόδου"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Πελάτης */}
        <div className="form-group">
          <label>Πελάτης *</label>
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            className={errors.client ? 'error' : ''}
            placeholder="π.χ. Δήμος Ρόδου"
          />
          {errors.client && <span className="error-message">{errors.client}</span>}
        </div>

        {/* Ημερομηνίες */}
        <div className="form-row">
          <div className="form-group">
            <label>Ημερομηνία *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label>Ημερομηνίες Έναρξης/Λήξης</label>
            <input
              type="text"
              name="startEndDates"
              value={formData.startEndDates}
              onChange={handleInputChange}
              placeholder="π.χ. 2024-01-20 - 2024-01-25"
            />
          </div>
        </div>

        {/* Στάδιο */}
        <div className="form-group">
          <label>Στάδιο *</label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleInputChange}
            className={errors.stage ? 'error' : ''}
          >
            <option value="">Επιλέξτε στάδιο</option>
            {stages.map((stage, index) => (
              <option key={index} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          {errors.stage && <span className="error-message">{errors.stage}</span>}
        </div>

        {/* Type-specific fields */}
        {renderTypeSpecificFields()}

        {/* Σημειώσεις */}
        <div className="form-group">
          <label>Σημειώσεις</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
            placeholder="Προσθέστε τυχόν σημειώσεις ή παρατηρήσεις..."
          />
        </div>

        {/* Upload Φωτογραφιών */}
        <div className="form-group">
          <label>Φωτογραφίες</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="file-input"
          />
          
          {formData.photos.length > 0 && (
            <div className="photos-preview">
              {formData.photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo.url} alt={photo.name} className="photo-thumbnail" />
                  <div className="photo-info">
                    <span className="photo-name">{photo.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="remove-photo-btn"
                    >
                      Αφαίρεση
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Ακύρωση
          </button>
          <button type="submit" className="submit-btn">
            {isEditing ? 'Ενημέρωση Στοιχείου' : 'Αποθήκευση Στοιχείου'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectItemForm;
