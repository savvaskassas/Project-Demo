import React, { useState, useEffect } from 'react';
import './ProjectCalendar.css';

const ProjectCalendar = ({ project, onUpdateProject }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [comments, setComments] = useState(project.comments || {});
  const [currentComment, setCurrentComment] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setComments(project.comments || {});
  }, [project.comments]);

  // Parse dates
  const startDate = new Date(project.startEndDates?.split(' - ')[0] || project.date);
  const endDate = new Date(project.startEndDates?.split(' - ')[1] || project.date);

  // Get calendar data
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateInRange = (date) => {
    if (!date) return false;
    return date >= startDate && date <= endDate;
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (date) => {
    if (!isDateInRange(date)) return;
    
    setSelectedDate(date);
    const dateKey = formatDateKey(date);
    setCurrentComment(comments[dateKey] || '');
  };

  const handleSaveComment = () => {
    if (!selectedDate || currentComment.trim() === '') return;
    
    const dateKey = formatDateKey(selectedDate);
    const updatedComments = {
      ...comments,
      [dateKey]: currentComment.trim()
    };
    
    setComments(updatedComments);
    
    // Update project with new comments
    const updatedProject = {
      ...project,
      comments: updatedComments
    };
    
    onUpdateProject(updatedProject);
    setSelectedDate(null);
    setCurrentComment('');
  };

  const handleDeleteComment = () => {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    const updatedComments = { ...comments };
    delete updatedComments[dateKey];
    
    setComments(updatedComments);
    
    // Update project with new comments
    const updatedProject = {
      ...project,
      comments: updatedComments
    };
    
    onUpdateProject(updatedProject);
    setSelectedDate(null);
    setCurrentComment('');
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];
  
  const dayNames = ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'];

  return (
    <div className="project-calendar">
      <div className="calendar-header">
        <h3>Ημερολόγιο Έργου</h3>
        <p>Προσθέστε σχόλια για κάθε μέρα του έργου</p>
      </div>

      <div className="calendar-navigation">
        <button onClick={() => navigateMonth(-1)} className="nav-btn">
          &#8249;
        </button>
        <h4>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button onClick={() => navigateMonth(1)} className="nav-btn">
          &#8250;
        </button>
      </div>

      <div className="calendar-grid">
        <div className="day-headers">
          {dayNames.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="empty-day"></div>;
            }
            
            const dateKey = formatDateKey(date);
            const hasComment = comments[dateKey];
            const inRange = isDateInRange(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${inRange ? 'in-range' : 'out-of-range'} ${hasComment ? 'has-comment' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDateClick(date)}
                title={hasComment ? `Σχόλιο: ${comments[dateKey]}` : inRange ? 'Κλικ για προσθήκη σχολίου' : 'Εκτός διάρκειας έργου'}
              >
                <span className="day-number">{date.getDate()}</span>
                {hasComment && <div className="comment-indicator">💬</div>}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="comment-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Σχόλιο για {selectedDate.toLocaleDateString('el-GR')}</h4>
              <button onClick={() => setSelectedDate(null)} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <textarea
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                placeholder="Προσθέστε σχόλιο για την εξέλιξη του έργου..."
                rows={4}
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setSelectedDate(null)} className="cancel-btn">
                Ακύρωση
              </button>
              {comments[formatDateKey(selectedDate)] && (
                <button onClick={handleDeleteComment} className="delete-btn">
                  Διαγραφή
                </button>
              )}
              <button onClick={handleSaveComment} className="save-btn">
                Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color in-range"></div>
          <span>Διάρκεια έργου</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-comment"></div>
          <span>Με σχόλιο</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Σήμερα</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCalendar;
