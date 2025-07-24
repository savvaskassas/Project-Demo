import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR');
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
    <div className="project-card" onClick={onClick}>
      <div className="project-card-header">
        <h3 className="project-title">{project.projectTitle}</h3>
        <span 
          className="project-stage"
          style={{ backgroundColor: getStageColor(project.projectStage) }}
        >
          {project.projectStage}
        </span>
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
        
        <div className="project-photos">
          {project.photos && project.photos.length > 0 ? (
            <span className="photos-count">📷 {project.photos.length}</span>
          ) : (
            <span className="no-photos">Χωρίς φωτογραφίες</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
