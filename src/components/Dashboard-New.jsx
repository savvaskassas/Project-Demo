import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from './ProjectCard';
import './Dashboard.css';

const Dashboard = ({ 
  projects, 
  onNewProject, 
  onViewProject, 
  onEditProject, 
  onDeleteProject,
  onViewInvoices 
}) => {
  const { user } = useAuth();

  const getProjectStats = () => {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === 'Σε εξέλιξη').length;
    const completed = projects.filter(p => p.status === 'Ολοκληρωμένο').length;
    const pending = projects.filter(p => p.status === 'Νέο').length;

    return { total, inProgress, completed, pending };
  };

  const stats = getProjectStats();

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Καλώς ήρθατε, {user?.name}! 👋</h1>
          <p>Διαχειριστείτε τα έργα και τα παραστατικά σας</p>
        </div>
        
        <div className="quick-actions">
          <button className="quick-action-btn primary" onClick={onNewProject}>
            ➕ Νέο Έργο
          </button>
          <button className="quick-action-btn secondary" onClick={onViewInvoices}>
            📊 Παραστατικά
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Συνολικά Έργα</div>
          </div>
        </div>
        
        <div className="stat-card in-progress">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">Σε Εξέλιξη</div>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Ολοκληρωμένα</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Νέα</div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        <div className="section-header">
          <h2>Πρόσφατα Έργα</h2>
          {projects.length > 0 && (
            <span className="projects-count">{projects.length} έργα συνολικά</span>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="no-projects">
            <div className="no-projects-icon">📁</div>
            <h3>Δεν υπάρχουν έργα ακόμα</h3>
            <p>Ξεκινήστε δημιουργώντας το πρώτο σας έργο</p>
            <button className="create-first-project-btn" onClick={onNewProject}>
              🚀 Δημιουργήστε το πρώτο έργο
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => onViewProject(project)}
                onEdit={() => onEditProject(project)}
                onDelete={() => onDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="quick-nav-section">
        <h3>Γρήγορη Πλοήγηση</h3>
        <div className="quick-nav-grid">
          <div className="nav-card" onClick={onNewProject}>
            <div className="nav-icon">➕</div>
            <div className="nav-title">Νέο Έργο</div>
            <div className="nav-desc">Δημιουργήστε ένα νέο έργο</div>
          </div>
          
          <div className="nav-card" onClick={onViewInvoices}>
            <div className="nav-icon">📊</div>
            <div className="nav-title">Παραστατικά</div>
            <div className="nav-desc">Διαχείριση παραστατικών</div>
          </div>
          
          <div className="nav-card">
            <div className="nav-icon">📈</div>
            <div className="nav-title">Αναφορές</div>
            <div className="nav-desc">Προβολή στατιστικών</div>
          </div>
          
          <div className="nav-card">
            <div className="nav-icon">⚙️</div>
            <div className="nav-title">Ρυθμίσεις</div>
            <div className="nav-desc">Διαμόρφωση συστήματος</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
