import React, { useEffect, useRef } from 'react';
import './NotesChart.css';

const NotesChart = ({ project, onClose, onNoteClick }) => {
  const chartRef = useRef(null);

  // Handle clicks outside the chart
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartRef.current && !chartRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  // Get notes from project
  const notes = project.notes || {};
  const noteDates = Object.keys(notes).sort((a, b) => new Date(a) - new Date(b));

  if (noteDates.length === 0) {
    return (
      <div className="notes-chart-dropdown" ref={chartRef} onClick={(e) => e.stopPropagation()}>
        <div className="chart-header">
          <h3>📊 Διάγραμμα Σημειώσεων</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="no-notes-message">
          <span>📝</span>
          <p>Δεν υπάρχουν σημειώσεις για αυτό το έργο</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-chart-dropdown" ref={chartRef} onClick={(e) => e.stopPropagation()}>
      <div className="chart-header">
        <h3>📊 Διάγραμμα Σημειώσεων - {project.projectTitle}</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
        
        <div className="chart-content">
          <div className="chart-summary">
            <span className="total-notes">Συνολικές σημειώσεις: {noteDates.length}</span>
          </div>
          
          <div className="notes-timeline">
            {noteDates.map((date, index) => {
              const noteData = notes[date];
              const hasText = typeof noteData === 'string' ? noteData : noteData?.text;
              const hasPhotos = typeof noteData === 'object' && noteData?.photos?.length > 0;
              
              return (
                <div 
                  key={date} 
                  className="timeline-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNoteClick && onNoteClick(date);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="timeline-date">
                    {new Date(date).toLocaleDateString('el-GR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-indicators">
                      {hasText && <span className="indicator text">📝</span>}
                      {hasPhotos && <span className="indicator photo">📷</span>}
                    </div>
                    <div className="timeline-preview">
                      {typeof noteData === 'string' 
                        ? noteData.substring(0, 50) + (noteData.length > 50 ? '...' : '')
                        : noteData?.text?.substring(0, 50) + (noteData?.text?.length > 50 ? '...' : '')
                      }
                    </div>
                    <div className="click-hint">
                      👆 Κλικ για μετάβαση
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
};

export default NotesChart;
