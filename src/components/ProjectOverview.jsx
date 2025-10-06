import React, { useState, useMemo } from 'react';
import './ProjectOverview.css';
import DashboardStats from './DashboardStats';
import ExcelExportService from '../utils/ExcelExportService';
import { ExportButtons } from './Export';

const ProjectOverview = ({ projects }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Προηγμένο φιλτράρισμα έργων για μεγάλο όγκο δεδομένων
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // 1. Φιλτράρισμα κειμένου (αναζήτηση)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.projectTitle?.toLowerCase().includes(searchLower) ||
        project.client?.toLowerCase().includes(searchLower) ||
        project.assignedCollaborators?.some(collab => 
          collab.toLowerCase().includes(searchLower)
        ) ||
        project.projectStage?.toLowerCase().includes(searchLower)
      );
    }

    // 2. Φιλτράρισμα κατά πελάτη
    if (selectedClient !== 'all') {
      filtered = filtered.filter(project => project.client === selectedClient);
    }

    // 3. Φιλτράρισμα κατά εύρος προϋπολογισμού
    if (selectedBudgetRange !== 'all') {
      filtered = filtered.filter(project => {
        const budget = project.budget || 0;
        switch (selectedBudgetRange) {
          case 'small': return budget <= 25000;
          case 'medium': return budget > 25000 && budget <= 75000;
          case 'large': return budget > 75000 && budget <= 150000;
          case 'xlarge': return budget > 150000;
          default: return true;
        }
      });
    }

    // 4. Φιλτράρισμα κατά συγκεκριμένο εύρος ημερομηνιών
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(project => 
        new Date(project.startDate) >= startDate
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(project => 
        new Date(project.endDate) <= endDate
      );
    }

    // 5. Φιλτράρισμα κατά χρονικό διάστημα (προκαθορισμένα)
    if (selectedTimeframe !== 'all' && !dateRange.start && !dateRange.end) {
      const now = new Date();
      const timeframes = {
        'today': 1,
        'week': 7,
        'month': 30,
        'quarter': 90,
        'semester': 180,
        'year': 365,
        'current_month': 'current_month',
        'last_month': 'last_month',
        'current_year': 'current_year'
      };
      
      if (selectedTimeframe === 'current_month') {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        filtered = filtered.filter(project => {
          const projectDate = new Date(project.startDate);
          return projectDate.getMonth() === currentMonth && 
                 projectDate.getFullYear() === currentYear;
        });
      } else if (selectedTimeframe === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = filtered.filter(project => {
          const projectDate = new Date(project.startDate);
          return projectDate >= lastMonth && projectDate <= lastMonthEnd;
        });
      } else if (selectedTimeframe === 'current_year') {
        const currentYear = now.getFullYear();
        filtered = filtered.filter(project => 
          new Date(project.startDate).getFullYear() === currentYear
        );
      } else if (timeframes[selectedTimeframe]) {
        const daysBack = timeframes[selectedTimeframe];
        const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(project => 
          new Date(project.startDate) >= cutoffDate
        );
      }
    }

    // 6. Φιλτράρισμα κατά κατάσταση
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => {
        switch (selectedStatus) {
          case 'active':
            return project.projectStage !== 'Ολοκληρωμένο' && project.projectStage !== 'Ακυρωμένο';
          case 'completed':
            return project.projectStage === 'Ολοκληρωμένο';
          case 'cancelled':
            return project.projectStage === 'Ακυρωμένο';
          case 'overdue':
            const today = new Date();
            const endDate = new Date(project.endDate);
            return endDate < today && project.projectStage !== 'Ολοκληρωμένο';
          case 'planning':
            return project.projectStage === 'Προγραμματισμός' || project.projectStage === 'Σχεδιασμός';
          case 'in_progress':
            return project.projectStage === 'Ανάπτυξη' || project.projectStage === 'Εγκατάσταση';
          default:
            return true;
        }
      });
    }

    // 7. Ταξινόμηση με περισσότερες επιλογές
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'date_asc':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'title':
          return a.projectTitle.localeCompare(b.projectTitle);
        case 'client':
          return a.client.localeCompare(b.client);
        case 'status':
          return a.projectStage.localeCompare(b.projectStage);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        case 'budget_asc':
          return (a.budget || 0) - (b.budget || 0);
        case 'end_date':
          return new Date(b.endDate) - new Date(a.endDate);
        case 'progress':
          const progressA = calculateProgress(a);
          const progressB = calculateProgress(b);
          return progressB - progressA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, selectedTimeframe, selectedStatus, sortBy, selectedClient, selectedBudgetRange, searchTerm, dateRange]);

  // Βοηθητική συνάρτηση για υπολογισμό προόδου
  const calculateProgress = (project) => {
    if (project.projectStage === 'Ολοκληρωμένο') return 100;
    if (project.projectStage === 'Προγραμματισμός') return 10;
    if (project.projectStage === 'Σχεδιασμός') return 25;
    if (project.projectStage === 'Ανάπτυξη') return 60;
    if (project.projectStage === 'Εγκατάσταση') return 85;
    return 0;
  };

  // Υπολογισμός μοναδικών πελατών για το dropdown
  const uniqueClients = useMemo(() => {
    const clients = [...new Set(projects.map(p => p.client))].filter(Boolean);
    return clients.sort();
  }, [projects]);

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

        {/* Προχωρημένα Φίλτρα και Αναζήτηση */}
        <div className="overview-controls">
          {/* Πρώτη γραμμή: Αναζήτηση και βασικά φίλτρα */}
          <div className="controls-row">
            <div className="control-group search-group">
              <label className="control-label">🔍 Αναζήτηση:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Έργο, πελάτης, συνεργάτης..."
                className="control-input search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Καθαρισμός αναζήτησης"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="control-group">
              <label className="control-label">Πελάτης:</label>
              <select 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                className="control-select"
              >
                <option value="all">Όλοι οι πελάτες</option>
                {uniqueClients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">Προϋπολογισμός:</label>
              <select 
                value={selectedBudgetRange} 
                onChange={(e) => setSelectedBudgetRange(e.target.value)}
                className="control-select"
              >
                <option value="all">Όλα τα εύρη</option>
                <option value="small">≤ 25.000€</option>
                <option value="medium">25.001€ - 75.000€</option>
                <option value="large">75.001€ - 150.000€</option>
                <option value="xlarge">&gt; 150.000€</option>
              </select>
            </div>
          </div>

          {/* Δεύτερη γραμμή: Χρονικά φίλτρα και κατάσταση */}
          <div className="controls-row">
            <div className="control-group">
              <label className="control-label">Χρονικό Διάστημα:</label>
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="control-select"
              >
                <option value="all">Όλα τα έργα</option>
                <option value="today">Σήμερα</option>
                <option value="week">Τελευταία εβδομάδα</option>
                <option value="month">Τελευταίος μήνας</option>
                <option value="current_month">Τρέχων μήνας</option>
                <option value="last_month">Προηγούμενος μήνας</option>
                <option value="quarter">Τελευταίο τρίμηνο</option>
                <option value="semester">Τελευταίο εξάμηνο</option>
                <option value="year">Τελευταίος χρόνος</option>
                <option value="current_year">Τρέχων έτος</option>
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">Συγκεκριμένες Ημερομηνίες:</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="control-input date-input"
                  placeholder="Από"
                />
                <span className="date-separator">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="control-input date-input"
                  placeholder="Έως"
                />
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Κατάσταση:</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="control-select"
              >
                <option value="all">Όλες οι καταστάσεις</option>
                <option value="planning">📋 Προγραμματισμός/Σχεδιασμός</option>
                <option value="in_progress">🔧 Σε εξέλιξη</option>
                <option value="active">⚡ Ενεργά έργα</option>
                <option value="completed">✅ Ολοκληρωμένα</option>
                <option value="overdue">⚠️ Καθυστερημένα</option>
                <option value="cancelled">❌ Ακυρωμένα</option>
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">Ταξινόμηση:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select"
              >
                <option value="date">📅 Ημερομηνία (Νεότερα πρώτα)</option>
                <option value="date_asc">📅 Ημερομηνία (Παλαιότερα πρώτα)</option>
                <option value="title">🔤 Τίτλος</option>
                <option value="client">👤 Πελάτης</option>
                <option value="status">📊 Κατάσταση</option>
                <option value="budget">💰 Προϋπολογισμός (Μεγαλύτερα πρώτα)</option>
                <option value="budget_asc">💰 Προϋπολογισμός (Μικρότερα πρώτα)</option>
                <option value="end_date">📆 Ημερομηνία λήξης</option>
                <option value="progress">📈 Πρόοδος</option>
              </select>
            </div>
          </div>

          {/* Γραμμή ενεργειών και καθαρισμού φίλτρων */}
          <div className="controls-row actions-row">
            <div className="active-filters">
              {(searchTerm || selectedClient !== 'all' || selectedBudgetRange !== 'all' || 
                selectedTimeframe !== 'all' || selectedStatus !== 'all' || 
                dateRange.start || dateRange.end) && (
                <div className="filters-summary">
                  <span className="filters-count">
                    {filteredProjects.length} από {projects.length} έργα
                  </span>
                  <button 
                    className="clear-all-filters-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedClient('all');
                      setSelectedBudgetRange('all');
                      setSelectedTimeframe('all');
                      setSelectedStatus('all');
                      setDateRange({ start: '', end: '' });
                    }}
                  >
                    🗑️ Καθαρισμός όλων των φίλτρων
                  </button>
                </div>
              )}
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