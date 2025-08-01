import React, { useState } from 'react';
import './ProjectForm.css';

const ProjectForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    projectTitle: initialData.projectTitle || '',
    client: initialData.client || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    assignedCollaborators: initialData.assignedCollaborators || [],
    projectStage: initialData.projectStage || '',
    photos: initialData.photos || []
  });

  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [errors, setErrors] = useState({});

  const projectStages = [
    'Προγραμματισμός',
    'Ανάλυση Απαιτήσεων',
    'Σχεδιασμός',
    'Ανάπτυξη',
    'Δοκιμές',
    'Παράδοση',
    'Συντήρηση'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddCollaborator = () => {
    if (collaboratorInput.trim() && !formData.assignedCollaborators.includes(collaboratorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        assignedCollaborators: [...prev.assignedCollaborators, collaboratorInput.trim()]
      }));
      setCollaboratorInput('');
    }
  };

  const handleRemoveCollaborator = (index) => {
    setFormData(prev => ({
      ...prev,
      assignedCollaborators: prev.assignedCollaborators.filter((_, i) => i !== index)
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

    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Ο τίτλος του έργου είναι υποχρεωτικός';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Ο πελάτης είναι υποχρεωτικός';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Η ημερομηνία έναρξης είναι υποχρεωτική';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Η ημερομηνία λήξης είναι υποχρεωτική';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης';
    }

    if (!formData.projectStage) {
      newErrors.projectStage = 'Το στάδιο του έργου είναι υποχρεωτικό';
    }

    if (formData.assignedCollaborators.length === 0) {
      newErrors.assignedCollaborators = 'Πρέπει να ανατεθεί τουλάχιστον ένας συνεργάτης';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Περνάμε όλα τα δεδομένα του αρχικού έργου συν τις αλλαγές
      const submitData = initialData.id ? { 
        ...initialData, // Διατηρούμε όλα τα υπάρχοντα δεδομένα
        ...formData,    // Εφαρμόζουμε τις αλλαγές
        id: initialData.id 
      } : formData;
      onSubmit(submitData);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="project-form-container">
      <form onSubmit={handleSubmit} className="project-form">
        <h2>Φόρμα Έργου</h2>

        {/* Τίτλος Έργου */}
        <div className="form-group">
          <label htmlFor="projectTitle">Τίτλος Έργου *</label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={formData.projectTitle}
            onChange={handleInputChange}
            className={errors.projectTitle ? 'error' : ''}
            placeholder="π.χ. Εγκατάσταση Υαλοπινάκων Κτιρίου Γραφείων"
          />
          {errors.projectTitle && <span className="error-message">{errors.projectTitle}</span>}
        </div>

        {/* Πελάτης */}
        <div className="form-group">
          <label htmlFor="client">Πελάτης *</label>
          <input
            type="text"
            id="client"
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            className={errors.client ? 'error' : ''}
            placeholder="π.χ. Δήμος Ρόδου, Ιδιωτική Εταιρεία κλπ."
          />
          {errors.client && <span className="error-message">{errors.client}</span>}
        </div>

        {/* Ημερομηνίες */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Ημερομηνία Έναρξης *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Ημερομηνία Λήξης *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={errors.endDate ? 'error' : ''}
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>
        </div>

        {/* Στάδιο Έργου */}
        <div className="form-group">
          <label htmlFor="projectStage">Στάδιο Έργου *</label>
          <select
            id="projectStage"
            name="projectStage"
            value={formData.projectStage}
            onChange={handleInputChange}
            className={errors.projectStage ? 'error' : ''}
          >
            <option value="">Επιλέξτε στάδιο έργου</option>
            {projectStages.map((stage, index) => (
              <option key={index} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          {errors.projectStage && <span className="error-message">{errors.projectStage}</span>}
        </div>

        {/* Ανάθεση Συνεργατών */}
        <div className="form-group">
          <label>Ανάθεση Συνεργατών *</label>
          <div className="collaborators-input">
            <input
              type="text"
              value={collaboratorInput}
              onChange={(e) => setCollaboratorInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddCollaborator)}
              placeholder="π.χ. Ιωάννης Παπαδόπουλος, Μαρία Γεωργίου"
              className={errors.assignedCollaborators ? 'error' : ''}
            />
            <button type="button" onClick={handleAddCollaborator} className="add-btn">
              Προσθήκη
            </button>
          </div>
          {errors.assignedCollaborators && <span className="error-message">{errors.assignedCollaborators}</span>}
          
          {formData.assignedCollaborators.length > 0 && (
            <div className="collaborators-list">
              {formData.assignedCollaborators.map((collaborator, index) => (
                <div key={index} className="collaborator-tag">
                  <span>{collaborator}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCollaborator(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Φωτογραφιών */}
        <div className="form-group">
          <label htmlFor="photos">Φωτογραφίες Έργου</label>
          <input
            type="file"
            id="photos"
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

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Αποθήκευση Έργου
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
