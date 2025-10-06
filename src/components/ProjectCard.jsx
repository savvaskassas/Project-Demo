import React, { useState } from 'react';
import './ProjectCard.css';
import './PhotoSlider.css';
import NotesChart from './NotesChart';
import StatusIndicator from './StatusIndicator';
import ProgressBar from './ProgressBar';

const ProjectCard = ({ project, onClick, isCompact = false }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showNotesChart, setShowNotesChart] = useState(false);

  const getStageColor = (stage) => {
    const colors = {
      'Προγραμματισμός': '#6c757d',
      'Ανάλυση Απαιτήσεων': '#17a2b8',
      'Σχεδιασμός': '#ffc107',
      'Ανάπτυξη': '#ff7700',
      'Δοκιμές': '#dc3545',
      'Παράδοση': '#28a745',
      'Συντήρηση': '#6f42c1',
      'Ολοκληρωμένο': '#28a745'
    };
    return colors[stage] || '#6c757d';
  };

  // Υπολογισμός προόδου έργου
  const getProjectProgress = () => {
    const stageOrder = [
      'Προγραμματισμός',
      'Ανάλυση Απαιτήσεων', 
      'Σχεδιασμός',
      'Ανάπτυξη',
      'Δοκιμές',
      'Παράδοση',
      'Ολοκληρωμένο'
    ];
    
    const currentStageIndex = stageOrder.indexOf(project.projectStage);
    if (currentStageIndex === -1) return 0;
    
    return Math.round(((currentStageIndex + 1) / stageOrder.length) * 100);
  };

  // Λήψη icon ανάλογα με το στάδιο
  const getStageIcon = (stage) => {
    const icons = {
      'Προγραμματισμός': '📋',
      'Ανάλυση Απαιτήσεων': '🔍',
      'Σχεδιασμός': '✏️',
      'Ανάπτυξη': '🔨',
      'Δοκιμές': '🧪',
      'Παράδοση': '📦',
      'Συντήρηση': '⚙️',
      'Ολοκληρωμένο': '✅'
    };
    return icons[stage] || '📋';
  };

  // Υπολογισμός υγείας έργου
  const getProjectHealth = () => {
    const today = new Date();
    const endDate = new Date(project.endDate);
    const startDate = new Date(project.startDate);
    
    const totalDuration = endDate - startDate;
    const elapsed = today - startDate;
    const timeProgress = (elapsed / totalDuration) * 100;
    
    const stageProgress = getProjectProgress();
    
    if (project.projectStage === 'Ολοκληρωμένο') {
      return { status: 'completed', icon: '✅', label: 'Ολοκληρωμένο' };
    }
    
    if (timeProgress > stageProgress + 20) {
      return { status: 'at-risk', icon: '⚠️', label: 'Σε Κίνδυνο' };
    } else if (timeProgress > stageProgress + 10) {
      return { status: 'behind', icon: '⏳', label: 'Καθυστέρηση' };
    } else {
      return { status: 'on-track', icon: '🟢', label: 'Εντάξει' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR');
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (project.photos && project.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === project.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (project.photos && project.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? project.photos.length - 1 : prev - 1
      );
    }
  };

  const goToPhoto = (e, index) => {
    e.stopPropagation();
    setCurrentPhotoIndex(index);
  };

  const getDaysRemaining = (endDate, projectStage) => {
    // Αν το έργο είναι ολοκληρωμένο, δεν εμφανίζουμε καθυστέρηση
    if (projectStage === 'Ολοκληρωμένο') {
      return 'Ολοκληρωμένο';
    }
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Καθυστέρηση ${Math.abs(diffDays)} ημέρες`;
    } else if (diffDays === 0) {
      return 'Λήγει σήμερα';
    } else {
      return `${diffDays} ημέρες απομένουν`;
    }
  };

  const getDaysRemainingClass = (endDate, projectStage) => {
    // Αν το έργο είναι ολοκληρωμένο, εμφανίζει πράσινο
    if (projectStage === 'Ολοκληρωμένο') {
      return 'completed';
    }
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'warning';
    return 'normal';
  };

  return (
    <div className={`project-card ${project.photos && project.photos.length > 0 ? 'has-photos' : ''} ${isCompact ? 'compact' : ''} ${showNotesChart ? 'chart-open' : ''}`} onClick={() => onClick(project)}>
      {/* Photo Slider Section */}
      {project.photos && project.photos.length > 0 && (
        <div className="photo-slider-container">
          <div className="photo-slider">
            <img 
              src={project.photos[currentPhotoIndex]} 
              alt={`Φωτογραφία ${currentPhotoIndex + 1}`}
              className="slider-image"
            />
            
            {project.photos.length > 1 && (
              <>
                <button 
                  className="slider-nav prev" 
                  onClick={prevPhoto}
                  aria-label="Προηγούμενη φωτογραφία"
                >
                  &#8249;
                </button>
                <button 
                  className="slider-nav next" 
                  onClick={nextPhoto}
                  aria-label="Επόμενη φωτογραφία"
                >
                  &#8250;
                </button>
                
                <div className="slider-dots">
                  {project.photos.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentPhotoIndex ? 'active' : ''}`}
                      onClick={(e) => goToPhoto(e, index)}
                      aria-label={`Μετάβαση στη φωτογραφία ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="project-card-header">
        <div className="title-section">
          <h3 className="project-title">{project.projectTitle}</h3>
          <div className="project-health">
            <StatusIndicator 
              status={getProjectHealth().status}
              size="small"
              showLabel={true}
              animated={getProjectHealth().status === 'at-risk'}
            />
          </div>
        </div>
        <div className="stage-section">
          <StatusIndicator 
            status={project.projectStage}
            size="medium"
            showLabel={true}
            animated={project.projectStage !== 'Ολοκληρωμένο'}
          />
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="project-progress-section">
        <ProgressBar
          value={getProjectProgress()}
          label="Πρόοδος Έργου"
          size="medium"
          color="auto"
          animated={true}
          stages={['Προγραμματισμός', 'Σχεδιασμός', 'Ανάπτυξη', 'Δοκιμές', 'Παράδοση', 'Ολοκληρωμένο']}
          currentStage={project.projectStage}
        />
      </div>

      <div className="project-card-body">
        <div className="project-info">
          <div className="info-item">
            <span className="info-label">Πελάτης:</span>
            <span className="info-value">{project.client}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Ημερομηνίες:</span>
            <span className="info-value">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Συνεργάτες:</span>
            <span className="info-value">
              {project.assignedCollaborators.length} άτομα
            </span>
          </div>

          {project.location && project.location.address && (
            <div className="info-item location-info">
              <span className="info-label">📍 Τοποθεσία:</span>
              <span className="info-value location-text">
                {project.location.address}
              </span>
            </div>
          )}

          {project.items && project.items.length > 0 && (
            <div className="info-item">
              <span className="info-label">Στοιχεία:</span>
              <span className="info-value">
                {project.items.length} καταχωρημένα
              </span>
            </div>
          )}
        </div>

        <div className="project-collaborators">
          {project.assignedCollaborators.slice(0, 3).map((collaborator, index) => (
            <div key={index} className="collaborator-avatar">
              {collaborator.split(' ').map(name => name[0]).join('')}
            </div>
          ))}
          {project.assignedCollaborators.length > 3 && (
            <div className="collaborator-avatar more">
              +{project.assignedCollaborators.length - 3}
            </div>
          )}
        </div>
      </div>

      <div className="project-card-footer">
        <div className={`days-remaining ${getDaysRemainingClass(project.endDate, project.projectStage)}`}>
          {getDaysRemaining(project.endDate, project.projectStage)}
        </div>
        
        <div className="footer-right">
          <div className="project-photos">
            {project.photos && project.photos.length > 0 ? (
              <span className="photos-count">📷 {project.photos.length}</span>
            ) : (
              <span className="no-photos">Χωρίς φωτογραφίες</span>
            )}
          </div>
          
          <button 
            className="notes-chart-btn"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNotesChart(!showNotesChart);
            }}
            title="Προβολή διαγράμματος σημειώσεων"
          >
            📊
          </button>
        </div>
      </div>
      
      {showNotesChart && (
        <div 
          className="notes-chart-container" 
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              setShowNotesChart(false);
            }
          }}
        >
          <NotesChart 
            project={project} 
            onClose={() => setShowNotesChart(false)}
            onNoteClick={(date) => {
              setShowNotesChart(false);
              // Navigate to project with specific note date
              onClick(project, date);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
