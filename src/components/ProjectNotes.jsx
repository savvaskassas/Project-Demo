import React, { useState } from 'react';
import './ProjectNotes.css';

const ProjectNotes = ({ project, onUpdateProject }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(project.notes || {});

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setNoteText(notes[date] || '');
  };

  const handleSaveNote = () => {
    if (!selectedDate || !noteText.trim()) return;

    const updatedNotes = {
      ...notes,
      [selectedDate]: noteText.trim()
    };

    setNotes(updatedNotes);
    
    // Update project with new notes
    const updatedProject = {
      ...project,
      notes: updatedNotes
    };
    
    onUpdateProject(updatedProject);
    setNoteText('');
    setSelectedDate('');
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
              />
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

          <div className="note-actions">
            <button 
              onClick={handleSaveNote} 
              className="save-note-btn"
              disabled={!selectedDate || !noteText.trim()}
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
              <div key={date} className="note-card">
                <div className="note-header">
                  <span className="note-date">
                    📅 {new Date(date).toLocaleDateString('el-GR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <button 
                    onClick={() => handleDeleteNote(date)}
                    className="delete-note-btn"
                    title="Διαγραφή σημείωσης"
                  >
                    🗑️
                  </button>
                </div>
                <div className="note-content">
                  {notes[date]}
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
    </div>
  );
};

export default ProjectNotes;
