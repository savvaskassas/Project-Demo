import React, { useState, useMemo } from 'react';
import './ProjectOverview.css';
import DashboardStats from './DashboardStats';
import ExcelExportService from '../utils/ExcelExportService';
import { ExportButtons } from './Export';

const ProjectOverview = ({ projects }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Φιλτράρισμα έργων βάσει επιλογών
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Φιλτράρισμα κατά χρονικό διάστημα
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const timeframes = {
        'week': 7,
        'month': 30,
        'quarter': 90,
        'year': 365
      };
      
      const daysBack = timeframes[selectedTimeframe];
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(project => 
        new Date(project.startDate) >= cutoffDate
      );
    }

    // Φιλτράρισμα κατά κατάσταση
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => {
        switch (selectedStatus) {
          case 'active':
            return project.projectStage !== 'Ολοκληρωμένο';
          case 'completed':
            return project.projectStage === 'Ολοκληρωμένο';
          case 'overdue':
            const today = new Date();
            const endDate = new Date(project.endDate);
            return endDate < today && project.projectStage !== 'Ολοκληρωμένο';
          default:
            return true;
        }
      });
    }

    // Ταξινόμηση
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'title':
          return a.projectTitle.localeCompare(b.projectTitle);
        case 'client':
          return a.client.localeCompare(b.client);
        case 'status':
          return a.projectStage.localeCompare(b.projectStage);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, selectedTimeframe, selectedStatus, sortBy]);

  // Υπολογισμός γρήγορων στατιστικών για τη σελίδα
  const quickStats = useMemo(() => {
    const total = filteredProjects.length;
    const completed = filteredProjects.filter(p => p.projectStage === 'Ολοκληρωμένο').length;
    const active = total - completed;
    const overdue = filteredProjects.filter(p => {
      const today = new Date();
      const endDate = new Date(p.endDate);
      return endDate < today && p.projectStage !== 'Ολοκληρωμένο';
    }).length;

    return { total, completed, active, overdue };
  }, [filteredProjects]);

  // Export functions
  const handleExportProjects = () => {
    try {
      ExcelExportService.exportProjectsToExcel(filteredProjects, 'projects_overview');
      alert('✅ Η εξαγωγή έργων σε Excel ολοκληρώθηκε επιτυχώς!');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Σφάλμα κατά την εξαγωγή σε Excel. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handleExportStats = () => {
    try {
      ExcelExportService.exportDashboardStatsToExcel(filteredProjects, 'dashboard_statistics');
      alert('✅ Η εξαγωγή στατιστικών σε Excel ολοκληρώθηκε επιτυχώς!');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Σφάλμα κατά την εξαγωγή στατιστικών. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="project-overview-page">
      {/* Enhanced Header */}
      <div className="overview-header">
        <div className="header-main">
          <div className="header-title-section">
            <h1 className="overview-title">
              <span className="title-icon">📊</span>
              Επισκόπηση Έργων
            </h1>
            <p className="overview-subtitle">
              Ολοκληρωμένη ανάλυση και παρακολούθηση της πορείας των έργων σας
            </p>
          </div>
          
          <div className="header-stats">
            <div className="quick-stat">
              <span className="stat-number">{quickStats.total}</span>
              <span className="stat-label">Συνολικά</span>
            </div>
            <div className="quick-stat">
              <span className="stat-number">{quickStats.active}</span>
              <span className="stat-label">Ενεργά</span>
            </div>
            <div className="quick-stat">
              <span className="stat-number">{quickStats.completed}</span>
              <span className="stat-label">Ολοκληρωμένα</span>
            </div>
            {quickStats.overdue > 0 && (
              <div className="quick-stat overdue">
                <span className="stat-number">{quickStats.overdue}</span>
                <span className="stat-label">Καθυστερημένα</span>
              </div>
            )}
          </div>
        </div>

        {/* Φίλτρα και Ελέγχους */}
        <div className="overview-controls">
          <div className="control-group">
            <label className="control-label">Χρονικό Διάστημα:</label>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="control-select"
            >
              <option value="all">Όλα τα έργα</option>
              <option value="week">Τελευταία εβδομάδα</option>
              <option value="month">Τελευταίος μήνας</option>
              <option value="quarter">Τελευταίο τρίμηνο</option>
              <option value="year">Τελευταίος χρόνος</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Κατάσταση:</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="control-select"
            >
              <option value="all">Όλες οι καταστάσεις</option>
              <option value="active">Ενεργά έργα</option>
              <option value="completed">Ολοκληρωμένα</option>
              <option value="overdue">Καθυστερημένα</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Ταξινόμηση:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="date">Ημερομηνία</option>
              <option value="title">Τίτλος</option>
              <option value="client">Πελάτης</option>
              <option value="status">Κατάσταση</option>
            </select>
          </div>

          <div className="control-actions">
            <div className="dropdown-button-group">
              <button 
                className="action-button export"
                onClick={handleExportProjects}
                title="Εξαγωγή έργων σε Excel"
              >
                <span className="button-icon">📊</span>
                Εξαγωγή Έργων
              </button>
              <button 
                className="action-button export secondary"
                onClick={handleExportStats}
                title="Εξαγωγή στατιστικών σε Excel"
              >
                <span className="button-icon">📈</span>
                Εξαγωγή Στατιστικών
              </button>
            </div>
            <button 
              className="action-button print"
              onClick={handlePrint}
              title="Εκτύπωση σελίδας"
            >
              <span className="button-icon">🖨️</span>
              Εκτύπωση
            </button>
          </div>
        </div>
      </div>

      {/* Κύριο Περιεχόμενο */}
      <div className="overview-content">
        {/* Πληροφορίες φίλτρων */}
        {(selectedTimeframe !== 'all' || selectedStatus !== 'all') && (
          <div className="filter-info">
            <div className="filter-badge">
              <span className="badge-icon">🔍</span>
              <span className="badge-text">
                Εμφάνιση {filteredProjects.length} από {projects.length} έργα
              </span>
              <button 
                className="clear-filters"
                onClick={() => {
                  setSelectedTimeframe('all');
                  setSelectedStatus('all');
                }}
              >
                Καθαρισμός φίλτρων
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Stats με φιλτραρισμένα δεδομένα - χωρίς το δικό του header */}
        <div className="dashboard-stats-wrapper">
          <DashboardStats projects={filteredProjects} />
        </div>

        {/* Export Buttons */}
        <ExportButtons 
          projects={filteredProjects}
          showProjectSpecific={false}
          className="overview-export-section"
        />

        {/* Επιπλέον Αναλυτικές Πληροφορίες */}
        <div className="additional-insights">
          <div className="insight-section">
            <h3 className="insight-title">
              <span className="insight-icon">💡</span>
              Βασικές Παρατηρήσεις
            </h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-header">
                  <span className="insight-emoji">📈</span>
                  <h4>Τάση Απόδοσης</h4>
                </div>
                <p className="insight-text">
                  {quickStats.completed > quickStats.overdue ? 
                    'Η απόδοση είναι θετική με περισσότερα ολοκληρωμένα έργα από καθυστερημένα.' :
                    'Παρατηρείται αύξηση των καθυστερημένων έργων. Χρειάζεται προσοχή.'
                  }
                </p>
              </div>

              <div className="insight-card">
                <div className="insight-header">
                  <span className="insight-emoji">⏱️</span>
                  <h4>Χρονική Διαχείριση</h4>
                </div>
                <p className="insight-text">
                  {quickStats.overdue === 0 ? 
                    'Εξαιρετική χρονική διαχείριση! Όλα τα έργα είναι εντός χρονοδιαγράμματος.' :
                    `${quickStats.overdue} έργα χρειάζονται προσοχή για τα deadlines.`
                  }
                </p>
              </div>

              <div className="insight-card">
                <div className="insight-header">
                  <span className="insight-emoji">🎯</span>
                  <h4>Ποσοστό Επιτυχίας</h4>
                </div>
                <p className="insight-text">
                  {quickStats.total > 0 ? 
                    `Ποσοστό ολοκλήρωσης: ${Math.round((quickStats.completed / quickStats.total) * 100)}%` :
                    'Δεν υπάρχουν έργα για ανάλυση.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Προτάσεις Βελτίωσης */}
          {quickStats.overdue > 0 && (
            <div className="improvement-suggestions">
              <h3 className="suggestion-title">
                <span className="suggestion-icon">🚀</span>
                Προτάσεις Βελτίωσης
              </h3>
              <div className="suggestions-list">
                <div className="suggestion-item">
                  <span className="suggestion-bullet">•</span>
                  <span className="suggestion-text">
                    Αναθεώρηση των χρονοδιαγραμμάτων για τα καθυστερημένα έργα
                  </span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-bullet">•</span>
                  <span className="suggestion-text">
                    Ενίσχυση των ομάδων με περισσότερους πόρους
                  </span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-bullet">•</span>
                  <span className="suggestion-text">
                    Εβδομαδιαία παρακολούθηση προόδου για καλύτερο έλεγχο
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;