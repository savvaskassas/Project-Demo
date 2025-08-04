import React, { useState, useEffect } from 'react';
import './ProjectNotes.css';

const ProjectNotes = ({ project, selectedNoteDate, onUpdateProject, onClearSelectedNoteDate }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notePhotos, setNotePhotos] = useState([]);
  const [notes, setNotes] = useState(project.notes || {});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({
    date: '',
    text: '',
    photos: []
  });
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageData, setViewerImageData] = useState({
    url: '',
    name: '',
    index: 0,
    photos: []
  });

  // Handle selectedNoteDate from chart click
  useEffect(() => {
    if (selectedNoteDate) {
      setSelectedDate(selectedNoteDate);
      const existingNote = notes[selectedNoteDate];
      
      if (typeof existingNote === 'string') {
        setNoteText(existingNote);
        setNotePhotos([]);
      } else if (existingNote) {
        setNoteText(existingNote.text || '');
        setNotePhotos(existingNote.photos || []);
      } else {
        setNoteText('');
        setNotePhotos([]);
      }
      
      // Scroll to specific note if it exists, otherwise scroll to notes section
      setTimeout(() => {
        const specificNote = document.getElementById(`note-${selectedNoteDate}`);
        if (specificNote) {
          specificNote.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const notesSection = document.querySelector('.project-notes');
          if (notesSection) {
            notesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
      
      // Remove highlight after animation
      setTimeout(() => {
        const specificNote = document.getElementById(`note-${selectedNoteDate}`);
        if (specificNote) {
          specificNote.classList.add('fade-highlight');
        }
      }, 3000);
    }
  }, [selectedNoteDate, notes]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Clear the selectedNoteDate from chart when user manually selects a date
    if (onClearSelectedNoteDate) {
      onClearSelectedNoteDate();
    }
    
    const existingNote = notes[date];
    
    if (typeof existingNote === 'string') {
      // Handle old format
      setNoteText(existingNote);
      setNotePhotos([]);
    } else if (existingNote) {
      // Handle new format
      setNoteText(existingNote.text || '');
      setNotePhotos(existingNote.photos || []);
    } else {
      // No existing note
      setNoteText('');
      setNotePhotos([]);
    }
  };

  const handleSaveNote = () => {
    if (!selectedDate || (!noteText.trim() && notePhotos.length === 0)) return;

    const updatedNotes = {
      ...notes,
      [selectedDate]: {
        text: noteText.trim(),
        photos: notePhotos,
        timestamp: new Date().toISOString()
      }
    };

    setNotes(updatedNotes);
    
    // Update project with new notes
    const updatedProject = {
      ...project,
      notes: updatedNotes
    };
    
    onUpdateProject(updatedProject);
    setNoteText('');
    setNotePhotos([]);
    setSelectedDate('');
    
    // Clear the selectedNoteDate from chart after saving
    if (onClearSelectedNoteDate) {
      onClearSelectedNoteDate();
    }
  };

  const handleDeleteNote = (date) => {
    const updatedNotes = { ...notes };
    delete updatedNotes[date];
    
    setNotes(updatedNotes);
    
    // Update project with removed note
    const updatedProject = {
      ...project,
      notes: updatedNotes
    };
    
    onUpdateProject(updatedProject);
    
    // If we're deleting the currently selected date, clear the form
    if (selectedDate === date) {
      setSelectedDate('');
      setNoteText('');
      setNotePhotos([]);
    }
  };

  const handleEditNote = (date) => {
    const existingNote = notes[date];
    let noteData = {
      date: date,
      text: '',
      photos: []
    };
    
    if (typeof existingNote === 'string') {
      noteData.text = existingNote;
    } else if (existingNote) {
      noteData.text = existingNote.text || '';
      noteData.photos = existingNote.photos || [];
    }
    
    setEditModalData(noteData);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditModalData({
      date: '',
      text: '',
      photos: []
    });
  };

  const handleSaveEditModal = () => {
    if (!editModalData.text.trim() && editModalData.photos.length === 0) return;

    const updatedNotes = {
      ...notes,
      [editModalData.date]: {
        text: editModalData.text.trim(),
        photos: editModalData.photos,
        timestamp: new Date().toISOString()
      }
    };

    setNotes(updatedNotes);
    
    // Update project with edited note
    const updatedProject = {
      ...project,
      notes: updatedNotes
    };
    
    onUpdateProject(updatedProject);
    handleCloseEditModal();
  };

  const handleEditModalTextChange = (e) => {
    setEditModalData(prev => ({
      ...prev,
      text: e.target.value
    }));
  };

  const handleEditModalPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            url: event.target.result,
            name: file.name
          };
          
          setEditModalData(prev => ({
            ...prev,
            photos: [...prev.photos, newPhoto]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveEditModalPhoto = (photoId) => {
    setEditModalData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const handleOpenImageViewer = (photo, photos, index) => {
    setViewerImageData({
      url: photo.url,
      name: photo.name,
      index: index,
      photos: photos
    });
    setShowImageViewer(true);
  };

  const handleCloseImageViewer = () => {
    setShowImageViewer(false);
    setViewerImageData({
      url: '',
      name: '',
      index: 0,
      photos: []
    });
  };

  const handlePreviousImage = () => {
    const newIndex = viewerImageData.index > 0 ? viewerImageData.index - 1 : viewerImageData.photos.length - 1;
    const newPhoto = viewerImageData.photos[newIndex];
    setViewerImageData(prev => ({
      ...prev,
      url: newPhoto.url,
      name: newPhoto.name,
      index: newIndex
    }));
  };

  const handleNextImage = () => {
    const newIndex = viewerImageData.index < viewerImageData.photos.length - 1 ? viewerImageData.index + 1 : 0;
    const newPhoto = viewerImageData.photos[newIndex];
    setViewerImageData(prev => ({
      ...prev,
      url: newPhoto.url,
      name: newPhoto.name,
      index: newIndex
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            name: file.name,
            url: event.target.result,
            size: file.size
          };
          setNotePhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Clear the input
    e.target.value = '';
  };

  const handleRemovePhoto = (photoId) => {
    setNotePhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  // Get sorted dates with notes
  const sortedNoteDates = Object.keys(notes).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="project-notes">
      <div className="notes-header">
        <h3>📝 Σημειώσεις Έργου</h3>
        <p>Προσθέστε σημειώσεις για συγκεκριμένες ημερομηνίες</p>
      </div>

      <div className="add-note-section">
        <div className="note-form">
          <div className="form-row">
            <div className="date-input">
              <label>Ημερομηνία:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className={selectedNoteDate ? 'highlighted' : ''}
              />
              {selectedNoteDate && (
                <span className="chart-selection-indicator">
                  📊 Επιλέχθηκε από διάγραμμα
                </span>
              )}
            </div>
          </div>
          
          <div className="note-textarea">
            <label>Σημείωση:</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Προσθέστε σημείωση για αυτή την ημερομηνία..."
              rows={3}
            />
          </div>

          <div className="photo-upload-section">
            <label>Φωτογραφίες:</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="photo-input"
              id="note-photos"
            />
            <label htmlFor="note-photos" className="photo-upload-btn">
              📷 Προσθήκη Φωτογραφιών
            </label>
            
            {notePhotos.length > 0 && (
              <div className="note-photos-preview">
                {notePhotos.map((photo, index) => (
                  <div key={photo.id} className="note-photo-item">
                    <img 
                      src={photo.url} 
                      alt={photo.name} 
                      className="note-photo-thumbnail clickable-photo"
                      onClick={() => handleOpenImageViewer(photo, notePhotos, index)}
                      title="Κλικ για μεγέθυνση"
                    />
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="remove-note-photo-btn"
                      title="Αφαίρεση φωτογραφίας"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="note-actions">
            <button 
              onClick={handleSaveNote} 
              className="save-note-btn"
              disabled={!selectedDate || (!noteText.trim() && notePhotos.length === 0)}
            >
              💾 Αποθήκευση Σημείωσης
            </button>
          </div>
        </div>
      </div>

      {sortedNoteDates.length > 0 && (
        <div className="notes-list">
          <h4>Υπάρχουσες Σημειώσεις</h4>
          <div className="notes-grid">
            {sortedNoteDates.map(date => (
              <div 
                key={date} 
                id={`note-${date}`}
                className={`note-card ${selectedNoteDate === date ? 'highlighted-note' : ''}`}
              >
                <div className="note-header">
                  <span className="note-date">
                    📅 {new Date(date).toLocaleDateString('el-GR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="note-actions-header">
                    <button 
                      onClick={() => handleEditNote(date)}
                      className="edit-note-btn"
                      title="Επεξεργασία σημείωσης"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(date)}
                      className="delete-note-btn"
                      title="Διαγραφή σημείωσης"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="note-content">
                  {typeof notes[date] === 'string' ? (
                    // Handle old format (string only)
                    <div className="note-text">
                      {notes[date]}
                    </div>
                  ) : (
                    // Handle new format (object with text and photos)
                    <>
                      {notes[date].text && (
                        <div className="note-text">
                          {notes[date].text}
                        </div>
                      )}
                      
                      {notes[date].photos && notes[date].photos.length > 0 && (
                        <div className="note-photos-display">
                          <div className="note-photos-grid">
                            {notes[date].photos.map((photo, index) => (
                              <div key={photo.id} className="note-photo-display">
                                <img 
                                  src={photo.url} 
                                  alt={photo.name}
                                  onClick={() => handleOpenImageViewer(photo, notes[date].photos, index)}
                                  className="clickable-photo"
                                  title="Κλικ για μεγέθυνση"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedNoteDates.length === 0 && (
        <div className="no-notes">
          <div className="no-notes-content">
            <span className="no-notes-icon">📝</span>
            <h4>Δεν υπάρχουν σημειώσεις</h4>
            <p>Επιλέξτε μια ημερομηνία και προσθέστε την πρώτη σας σημείωση</p>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay" onClick={handleCloseEditModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>✏️ Επεξεργασία Σημείωσης</h3>
              <div className="edit-modal-date">
                📅 {new Date(editModalData.date).toLocaleDateString('el-GR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <button 
                onClick={handleCloseEditModal} 
                className="edit-modal-close"
                title="Κλείσιμο"
              >
                ✕
              </button>
            </div>
            
            <div className="edit-modal-content">
              <div className="edit-modal-textarea">
                <label>Σημείωση:</label>
                <textarea
                  value={editModalData.text}
                  onChange={handleEditModalTextChange}
                  placeholder="Προσθέστε τη σημείωσή σας εδώ..."
                  rows="6"
                />
              </div>
              
              <div className="edit-modal-photos">
                <div className="edit-modal-photo-upload">
                  <label htmlFor="edit-modal-photo-input" className="edit-modal-photo-upload-btn">
                    📸 Προσθήκη Φωτογραφιών
                  </label>
                  <input
                    id="edit-modal-photo-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditModalPhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                
                {editModalData.photos.length > 0 && (
                  <div className="edit-modal-photos-preview">
                    {editModalData.photos.map((photo, index) => (
                      <div key={photo.id} className="edit-modal-photo-item">
                        <img 
                          src={photo.url} 
                          alt={photo.name} 
                          className="edit-modal-photo-thumbnail clickable-photo"
                          onClick={() => handleOpenImageViewer(photo, editModalData.photos, index)}
                          title="Κλικ για μεγέθυνση"
                        />
                        <button
                          onClick={() => handleRemoveEditModalPhoto(photo.id)}
                          className="edit-modal-remove-photo-btn"
                          title="Αφαίρεση φωτογραφίας"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="edit-modal-actions">
              <button 
                onClick={handleSaveEditModal} 
                className="edit-modal-save-btn"
                disabled={!editModalData.text.trim() && editModalData.photos.length === 0}
              >
                💾 Αποθήκευση Αλλαγών
              </button>
              <button 
                onClick={handleCloseEditModal} 
                className="edit-modal-cancel-btn"
              >
                ❌ Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div className="image-viewer-overlay" onClick={handleCloseImageViewer}>
          <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handleCloseImageViewer} 
              className="image-viewer-close"
              title="Κλείσιμο"
            >
              ✕
            </button>
            
            {viewerImageData.photos.length > 1 && (
              <>
                <button 
                  onClick={handlePreviousImage} 
                  className="image-viewer-nav image-viewer-prev"
                  title="Προηγούμενη φωτογραφία"
                >
                  ‹
                </button>
                <button 
                  onClick={handleNextImage} 
                  className="image-viewer-nav image-viewer-next"
                  title="Επόμενη φωτογραφία"
                >
                  ›
                </button>
              </>
            )}
            
            <div className="image-viewer-content">
              <img 
                src={viewerImageData.url} 
                alt={viewerImageData.name}
                className="image-viewer-image"
              />
              <div className="image-viewer-info">
                <span className="image-viewer-name">{viewerImageData.name}</span>
                {viewerImageData.photos.length > 1 && (
                  <span className="image-viewer-counter">
                    {viewerImageData.index + 1} / {viewerImageData.photos.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectNotes;
