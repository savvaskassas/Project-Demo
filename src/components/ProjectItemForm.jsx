import React, { useState } from 'react';
import './ProjectItemForm.css';

const ProjectItemForm = ({ onSubmit, onCancel, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    type: (initialData?.type) || 'measurement',
    title: (initialData?.title) || '',
    client: (initialData?.client) || '',
    date: (initialData?.date) || '',
    startEndDates: (initialData?.startEndDates) || '',
    stage: (initialData?.stage) || '',
    photos: (initialData?.photos) || [],
    measurements: (initialData?.measurements) || { width: '', height: '', area: '' },
    deliveryDetails: (initialData?.deliveryDetails) || { quantity: '', type: '' },
    notes: (initialData?.notes) || ''
  });

  const [errors, setErrors] = useState({});

  const itemTypes = [
    { value: 'measurement', label: '📏 Μέτρηση' },
    { value: 'delivery', label: '📦 Παραγγελία' },
    { value: 'installation', label: '🔧 Εγκατάσταση' },
    { value: 'maintenance', label: '⚙️ Συντήρηση' },
    { value: 'photo', label: '📷 Φωτογραφία' },
    { value: 'document', label: '📄 Έγγραφο' },
    { value: 'other', label: '📋 Άλλο' }
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

    // Όλοι οι τύποι χρειάζονται τίτλο
    if (!formData.title.trim()) {
      newErrors.title = 'Η περιγραφή είναι υποχρεωτική';
    }

    // Όλοι οι τύποι χρειάζονται ημερομηνία
    if (!formData.date) {
      newErrors.date = 'Η ημερομηνία είναι υποχρεωτική';
    }

    // Όλοι οι τύποι χρειάζονται στάδιο/κατάσταση
    if (!formData.stage) {
      newErrors.stage = 'Το στάδιο είναι υποχρεωτικό';
    }

    // Επιπλέον validations ανά τύπο
    switch (formData.type) {
      case 'delivery':
      case 'maintenance':
      case 'document':
        if (!formData.client.trim()) {
          newErrors.client = 'Αυτό το πεδίο είναι υποχρεωτικό';
        }
        break;
      case 'installation':
        if (!formData.client.trim()) {
          newErrors.client = 'Η τοποθεσία είναι υποχρεωτική';
        }
        break;
      case 'other':
        if (!formData.client.trim()) {
          newErrors.client = 'Αυτό το πεδίο είναι υποχρεωτικό';
        }
        break;
      default:
        break;
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
          <>
            {/* Τίτλος */}
            <div className="form-group">
              <label>Περιγραφή Μέτρησης *</label>
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

            {/* Ημερομηνία */}
            <div className="form-group">
              <label>Ημερομηνία Μέτρησης *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Στοιχεία Μέτρησης */}
            <div className="type-specific-fields">
              <h3>📏 Διαστάσεις</h3>
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

            {/* Σημειώσεις */}
            <div className="form-group">
              <label>Σημειώσεις</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Προσθέστε παρατηρήσεις για τη μέτρηση..."
              />
            </div>
          </>
        );
      
      case 'delivery':
        return (
          <>
            {/* Τίτλος */}
            <div className="form-group">
              <label>Περιγραφή Παραγγελίας *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="π.χ. Παραγγελία Τζαμιών Εισόδου"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Πελάτης */}
            <div className="form-group">
              <label>Προμηθευτής *</label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className={errors.client ? 'error' : ''}
                placeholder="π.χ. Glass Solutions SA"
              />
              {errors.client && <span className="error-message">{errors.client}</span>}
            </div>

            {/* Ημερομηνία */}
            <div className="form-group">
              <label>Ημερομηνία Παραγγελίας *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Στάδιο Παραγγελίας */}
            <div className="form-group">
              <label>Στάδιο Παραγγελίας *</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className={errors.stage ? 'error' : ''}
              >
                <option value="">Επιλέξτε στάδιο</option>
                <option value="Παραγγελία">Παραγγελία</option>
                <option value="Παραγγελία - Παραγωγή">Παραγγελία - Παραγωγή</option>
                <option value="Παραγγελία - Τοποθέτηση">Παραγγελία - Τοποθέτηση</option>
                <option value="Παραγγελία - Ολοκλήρωση">Παραγγελία - Ολοκλήρωση</option>
              </select>
              {errors.stage && <span className="error-message">{errors.stage}</span>}
            </div>

            {/* Στοιχεία Παραγγελίας */}
            <div className="type-specific-fields">
              <h3>📦 Λεπτομέρειες Παραγγελίας</h3>
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

            {/* Ημερομηνίες Παράδοσης */}
            <div className="form-group">
              <label>Ημερομηνίες Παράδοσης</label>
              <input
                type="text"
                name="startEndDates"
                value={formData.startEndDates}
                onChange={handleInputChange}
                placeholder="π.χ. 2024-01-20 - 2024-01-25"
              />
            </div>

            {/* Σημειώσεις */}
            <div className="form-group">
              <label>Σημειώσεις</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Προσθέστε παρατηρήσεις για την παραγγελία..."
              />
            </div>
          </>
        );

      case 'installation':
        return (
          <>
            {/* Τίτλος */}
            <div className="form-group">
              <label>Περιγραφή Εγκατάστασης *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="π.χ. Εγκατάσταση Κεντρικής Εισόδου"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Πελάτης */}
            <div className="form-group">
              <label>Τοποθεσία *</label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className={errors.client ? 'error' : ''}
                placeholder="π.χ. Δήμος Ρόδου - Κεντρική Εγκ."
              />
              {errors.client && <span className="error-message">{errors.client}</span>}
            </div>

            {/* Ημερομηνία */}
            <div className="form-group">
              <label>Ημερομηνία Εγκατάστασης *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Στάδιο */}
            <div className="form-group">
              <label>Στάδιο Εγκατάστασης *</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className={errors.stage ? 'error' : ''}
              >
                <option value="">Επιλέξτε στάδιο</option>
                <option value="Προγραμματισμός">Προγραμματισμός</option>
                <option value="Εγκατάσταση">Εγκατάσταση</option>
                <option value="Έλεγχος">Έλεγχος</option>
                <option value="Παράδοση">Παράδοση</option>
              </select>
              {errors.stage && <span className="error-message">{errors.stage}</span>}
            </div>

            {/* Χρονικό Διάστημα */}
            <div className="form-group">
              <label>Διάρκεια Εργασιών</label>
              <input
                type="text"
                name="startEndDates"
                value={formData.startEndDates}
                onChange={handleInputChange}
                placeholder="π.χ. 2024-01-20 09:00 - 17:00"
              />
            </div>

            {/* Σημειώσεις */}
            <div className="form-group">
              <label>Σημειώσεις</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Προσθέστε παρατηρήσεις για την εγκατάσταση..."
              />
            </div>
          </>
        );

      case 'maintenance':
        return (
          <>
            {/* Τίτλος */}
            <div className="form-group">
              <label>Περιγραφή Συντήρησης *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="π.χ. Συντήρηση Μηχανισμών Εισόδου"
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

            {/* Ημερομηνία */}
            <div className="form-group">
              <label>Ημερομηνία Συντήρησης *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Στάδιο */}
            <div className="form-group">
              <label>Κατάσταση *</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className={errors.stage ? 'error' : ''}
              >
                <option value="">Επιλέξτε κατάσταση</option>
                <option value="Προγραμματισμός">Προγραμματισμός</option>
                <option value="Συντήρηση">Συντήρηση</option>
                <option value="Έλεγχος">Έλεγχος</option>
                <option value="Ολοκλήρωση">Ολοκλήρωση</option>
              </select>
              {errors.stage && <span className="error-message">{errors.stage}</span>}
            </div>

            {/* Σημειώσεις */}
            <div className="form-group">
              <label>Εργασίες/Σημειώσεις</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Περιγράψτε τις εργασίες συντήρησης που έγιναν..."
              />
            </div>
          </>
        );

      case 'photo':
        return (
          <>
            {/* Τίτλος */}
            <div className="form-group">
              <label>Περιγραφή Φωτογραφιών *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="π.χ. Φωτογραφίες Πριν την Εγκατάσταση"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Ημερομηνία */}
            <div className="form-group">
              <label>Ημερομηνία Λήψης *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Στάδιο */}
            <div className="form-group">
              <label>Στάδιο Έργου *</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className={errors.stage ? 'error' : ''}
              >
                <option value="">Επιλέξτε στάδιο</option>
                <option value="Μέτρηση">Μέτρηση</option>
                <option value="Πριν την Εγκατάσταση">Πριν την Εγκατάσταση</option>
                <option value="Κατά την Εγκατάσταση">Κατά την Εγκατάσταση</option>
                <option value="Μετά την Εγκατάσταση">Μετά την Εγκατάσταση</option>
                <option value="Παράδοση">Παράδοση</option>
              </select>
              {errors.stage && <span className="error-message">{errors.stage}</span>}
            </div>

            {/* Σημειώσεις */}
            <div className="form-group">
              <label>Σημειώσεις</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Προσθέστε περιγραφή για τις φωτογραφίες..."
              />
            </div>
          </>
        );

      case 'document':
        return (
          <>
            {/* Τίτλος */}
            <div className="form-group">
              <label>Περιγραφή Εγγράφου *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="π.χ. Συμβόλαιο Έργου - Υπογραφή"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Πελάτης */}
            <div className="form-group">
              <label>Πελάτης/Φορέας *</label>
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

            {/* Ημερομηνία */}
            <div className="form-group">
              <label>Ημερομηνία Εγγράφου *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Στάδιο */}
            <div className="form-group">
              <label>Κατάσταση Εγγράφου *</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className={errors.stage ? 'error' : ''}
              >
                <option value="">Επιλέξτε κατάσταση</option>
                <option value="Προσχέδιο">Προσχέδιο</option>
                <option value="Υπό Αναθεώρηση">Υπό Αναθεώρηση</option>
                <option value="Έτοιμο">Έτοιμο</option>
                <option value="Υπογραμμένο">Υπογραμμένο</option>
                <option value="Αρχειοθετημένο">Αρχειοθετημένο</option>
              </select>
              {errors.stage && <span className="error-message">{errors.stage}</span>}
            </div>

            {/* Σημειώσεις */}
            <div className="form-group">
              <label>Περιγραφή/Σημειώσεις</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Προσθέστε λεπτομέρειες για το έγγραφο..."
              />
            </div>
          </>
        );

      case 'other':
        return (
          <>
            {/* Τίτλος */}
            <div className="form-group">
              <label>Περιγραφή/Τίτλος *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="π.χ. Συνάντηση με πελάτη, Δείγμα υλικού, Έλεγχος ποιότητας..."
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Κατηγορία/Τύπος */}
            <div className="form-group">
              <label>Κατηγορία/Τύπος *</label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className={errors.client ? 'error' : ''}
                placeholder="π.χ. Συνάντηση, Δείγμα, Έλεγχος, Έρευνα, Προσφορά..."
              />
              {errors.client && <span className="error-message">{errors.client}</span>}
            </div>

            {/* Ημερομηνία */}
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

            {/* Επιπλέον πληροφορίες */}
            <div className="form-group">
              <label>Επιπλέον πληροφορίες</label>
              <input
                type="text"
                name="startEndDates"
                value={formData.startEndDates}
                onChange={handleInputChange}
                placeholder="π.χ. Διάρκεια, Χρόνος, Κόστος, Παρευρισκόμενοι..."
              />
            </div>

            {/* Στάδιο/Κατάσταση */}
            <div className="form-group">
              <label>Στάδιο/Κατάσταση</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
              >
                <option value="">Επιλέξτε κατάσταση...</option>
                <option value="Προγραμματισμένο">Προγραμματισμένο</option>
                <option value="Σε εξέλιξη">Σε εξέλιξη</option>
                <option value="Ολοκληρωμένο">Ολοκληρωμένο</option>
                <option value="Αναμονή">Αναμονή</option>
                <option value="Ακυρωμένο">Ακυρωμένο</option>
              </select>
            </div>

            {/* Σημειώσεις */}
            <div className="form-group">
              <label>Αναλυτική Περιγραφή</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Προσθέστε αναλυτική περιγραφή, σκοπό, αποτελέσματα, σημειώσεις..."
              />
            </div>
          </>
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

        {/* Type-specific fields */}
        {renderTypeSpecificFields()}

        {/* Upload Φωτογραφιών - Εμφανίζεται σε όλους τους τύπους */}
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
