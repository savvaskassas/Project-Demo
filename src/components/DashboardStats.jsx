import React from 'react';
import './DashboardStats.css';
import MiniChart from './MiniChart';
import StatusIndicator from './StatusIndicator';

const DashboardStats = ({ projects }) => {
  // Υπολογισμός στατιστικών
  const getStats = () => {
    const total = projects.length;
    const stages = {
      'Προγραμματισμός': 0,
      'Ανάλυση Απαιτήσεων': 0,
      'Σχεδιασμός': 0,
      'Ανάπτυξη': 0,
      'Δοκιμές': 0,
      'Παράδοση': 0,
      'Ολοκληρωμένο': 0,
      'Συντήρηση': 0
    };

    const overdue = [];
    const dueThisWeek = [];
    const dueThisMonth = [];
    const totalItems = projects.reduce((sum, project) => sum + (project.items?.length || 0), 0);
    
    // Στατιστικά πελατών
    const clients = {};
    const collaborators = new Set();
    
    // Στατιστικά χρόνου
    let totalDuration = 0;
    let avgDuration = 0;
    
    // Στατιστικά προόδου
    const progressStats = {
      onTrack: 0,
      behind: 0,
      atRisk: 0,
      completed: 0
    };

    projects.forEach(project => {
      // Μετρηση σταδίων
      if (stages.hasOwnProperty(project.projectStage)) {
        stages[project.projectStage]++;
      }

      // Στατιστικά πελατών
      clients[project.client] = (clients[project.client] || 0) + 1;
      
      // Στατιστικά συνεργατών
      project.assignedCollaborators?.forEach(collab => collaborators.add(collab));

      // Υπολογισμός διάρκειας έργου
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);
      totalDuration += duration;

      // Έλεγχος καθυστερήσεων
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (project.projectStage === 'Ολοκληρωμένο') {
        progressStats.completed++;
      } else if (diffDays < 0) {
        overdue.push(project);
        progressStats.atRisk++;
      } else if (diffDays >= 0 && diffDays <= 7) {
        dueThisWeek.push(project);
        progressStats.behind++;
      } else if (diffDays >= 0 && diffDays <= 30) {
        dueThisMonth.push(project);
        progressStats.onTrack++;
      } else {
        progressStats.onTrack++;
      }
    });

    avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;

    return {
      total,
      stages,
      overdue: overdue.length,
      dueThisWeek: dueThisWeek.length,
      dueThisMonth: dueThisMonth.length,
      completed: stages['Ολοκληρωμένο'],
      inProgress: total - stages['Ολοκληρωμένο'],
      totalItems,
      uniqueClients: Object.keys(clients).length,
      totalCollaborators: collaborators.size,
      avgDuration,
      progressStats,
      topClients: Object.entries(clients)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      overdueProjects: overdue,
      upcomingProjects: dueThisWeek
    };
  };

  const stats = getStats();

  // Υπολογισμός ποσοστού ολοκλήρωσης
  const getCompletionPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  // Δημιουργία δεδομένων για το διάγραμμα πίτας σταδίων
  const getStageChartData = () => {
    const stageColors = {
      'Προγραμματισμός': '#6c757d',
      'Ανάλυση Απαιτήσεων': '#17a2b8',
      'Σχεδιασμός': '#ffc107',
      'Ανάπτυξη': '#ff7700',
      'Δοκιμές': '#dc3545',
      'Παράδοση': '#28a745',
      'Ολοκληρωμένο': '#198754',
      'Συντήρηση': '#6f42c1'
    };

    return Object.entries(stats.stages)
      .filter(([stage, count]) => count > 0)
      .map(([stage, count]) => ({
        stage,
        count,
        color: stageColors[stage],
        percentage: Math.round((count / stats.total) * 100)
      }));
  };

  const chartData = getStageChartData();
  const completionPercentage = getCompletionPercentage();

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-stats">
      {/* Enhanced Header */}
      <div className="stats-header">
        <div className="header-content">
          <h2 className="header-title">
            <span className="title-icon">📊</span>
            Επισκόπηση Έργων
          </h2>
          <p className="header-subtitle">Αναλυτικές Στατιστικές & Μετρήσεις Απόδοσης</p>
          <div className="stats-period">
            <span className="period-icon">📅</span>
            Τελευταία ενημέρωση: {getCurrentDate()}
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn export" title="Εξαγωγή αναφοράς">
            <span className="btn-icon">📊</span>
            <span className="btn-text">Εξαγωγή</span>
          </button>
          <button className="action-btn refresh" title="Ανανέωση δεδομένων">
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Ανανέωση</span>
          </button>
        </div>
      </div>

      {/* Alert System */}
      {(stats.overdue > 0 || stats.dueThisWeek > 0) && (
        <div className="alert-system">
          {stats.overdue > 0 && (
            <div className="alert-card critical">
              <div className="alert-header">
                <div className="alert-icon">🚨</div>
                <div className="alert-content">
                  <h4>Κρίσιμη Κατάσταση</h4>
                  <p>{stats.overdue} έργα έχουν καθυστερήσει και χρειάζονται άμεση προσοχή</p>
                </div>
              </div>
              <div className="alert-projects">
                {stats.overdueProjects.slice(0, 3).map(project => (
                  <span key={project.id} className="project-tag overdue">
                    {project.projectTitle}
                  </span>
                ))}
                {stats.overdueProjects.length > 3 && (
                  <span className="project-tag more">
                    +{stats.overdueProjects.length - 3} ακόμη
                  </span>
                )}
              </div>
              <button className="alert-action">Προβολή Όλων</button>
            </div>
          )}
          {stats.dueThisWeek > 0 && (
            <div className="alert-card warning">
              <div className="alert-header">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <h4>Προσεχή Deadline</h4>
                  <p>{stats.dueThisWeek} έργα λήγουν αυτή την εβδομάδα</p>
                </div>
              </div>
              <div className="alert-projects">
                {stats.upcomingProjects.slice(0, 3).map(project => (
                  <span key={project.id} className="project-tag upcoming">
                    {project.projectTitle}
                  </span>
                ))}
                {stats.upcomingProjects.length > 3 && (
                  <span className="project-tag more">
                    +{stats.upcomingProjects.length - 3} ακόμη
                  </span>
                )}
              </div>
              <button className="alert-action">Προβολή Όλων</button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Main Stats */}
      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-header">
            <div className="stat-icon">📁</div>
            <div className="stat-meta">
              <div className="stat-trend positive">
                <span className="trend-icon">📈</span>
                <span className="trend-value">+12%</span>
              </div>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Συνολικά Έργα</div>
            <div className="stat-breakdown">
              <span className="breakdown-item">
                <span className="breakdown-dot active"></span>
                {stats.inProgress} ενεργά
              </span>
              <span className="breakdown-item">
                <span className="breakdown-dot completed"></span>
                {stats.completed} ολοκληρωμένα
              </span>
            </div>
          </div>
          <div className="stat-chart">
            <MiniChart 
              type="sparkline" 
              data={[stats.total - 8, stats.total - 5, stats.total - 2, stats.total]} 
              size="small"
              color="#007bff"
            />
          </div>
        </div>

        <div className="stat-card performance">
          <div className="stat-header">
            <div className="stat-icon">🎯</div>
            <div className="stat-meta">
              <StatusIndicator 
                status={completionPercentage >= 80 ? 'completed' : completionPercentage >= 60 ? 'in-progress' : 'pending'}
                size="small"
              />
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{completionPercentage}%</div>
            <div className="stat-label">Ποσοστό Επιτυχίας</div>
            <div className="stat-breakdown">
              <span className="breakdown-item">
                {stats.completed} από {stats.total} έργα
              </span>
            </div>
          </div>
          <div className="stat-chart">
            <MiniChart 
              type="donut" 
              data={[stats.completed, stats.inProgress]} 
              labels={['Ολοκληρωμένα', 'Ενεργά']}
              colors={['#28a745', '#6c757d']}
              size="medium"
            />
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-header">
            <div className="stat-icon">📊</div>
            <div className="stat-meta">
              <div className="progress-indicator">
                <div className="progress-bar" style={{width: `${stats.total > 0 ? (stats.progressStats.onTrack / stats.total) * 100 : 0}%`}}></div>
              </div>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.progressStats.onTrack}</div>
            <div className="stat-label">Εντός Χρονοδιαγράμματος</div>
            <div className="performance-breakdown">
              <div className="perf-item on-track">
                <span className="perf-dot"></span>
                <span className="perf-label">Εντός Χρόνου</span>
                <span className="perf-value">{stats.progressStats.onTrack}</span>
              </div>
              <div className="perf-item behind">
                <span className="perf-dot"></span>
                <span className="perf-label">Καθυστέρηση</span>
                <span className="perf-value">{stats.progressStats.behind}</span>
              </div>
              <div className="perf-item at-risk">
                <span className="perf-dot"></span>
                <span className="perf-label">Κίνδυνος</span>
                <span className="perf-value">{stats.progressStats.atRisk}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card resources">
          <div className="stat-header">
            <div className="stat-icon">👥</div>
            <div className="stat-meta">
              <div className="resource-trend">
                <span className="trend-icon">👤</span>
                <span className="trend-value">{stats.totalCollaborators}</span>
              </div>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.uniqueClients}</div>
            <div className="stat-label">Ενεργοί Πελάτες</div>
            <div className="resource-breakdown">
              <div className="resource-item">
                <span className="resource-icon">👥</span>
                <span className="resource-text">Συνεργάτες: {stats.totalCollaborators}</span>
              </div>
              <div className="resource-item">
                <span className="resource-icon">📋</span>
                <span className="resource-text">Αντικείμενα: {stats.totalItems}</span>
              </div>
              <div className="resource-item">
                <span className="resource-icon">⏱️</span>
                <span className="resource-text">Μέση Διάρκεια: {stats.avgDuration} ημέρες</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Section */}
      <div className="detailed-analytics">
        <div className="analytics-section stages">
          <div className="section-header">
            <h3>Κατανομή Σταδίων</h3>
            <p>Ανάλυση κατά στάδιο εξέλιξης</p>
          </div>
          <div className="stages-grid">
            {chartData.map((stage, index) => (
              <div key={index} className="stage-item">
                <div className="stage-header">
                  <div className="stage-color" style={{backgroundColor: stage.color}}></div>
                  <span className="stage-name">{stage.stage}</span>
                </div>
                <div className="stage-stats">
                  <span className="stage-count">{stage.count}</span>
                  <span className="stage-percentage">{stage.percentage}%</span>
                </div>
                <div className="stage-bar">
                  <div 
                    className="stage-fill" 
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section clients">
          <div className="section-header">
            <h3>Κορυφαίοι Πελάτες</h3>
            <p>Πελάτες με τα περισσότερα έργα</p>
          </div>
          <div className="clients-list">
            {stats.topClients.map(([client, count], index) => (
              <div key={index} className="client-item">
                <div className="client-rank">#{index + 1}</div>
                <div className="client-info">
                  <span className="client-name">{client}</span>
                  <span className="client-count">{count} έργα</span>
                </div>
                <div className="client-bar">
                  <div 
                    className="client-fill" 
                    style={{
                      width: `${(count / Math.max(...stats.topClients.map(([,c]) => c))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section timeline">
          <div className="section-header">
            <h3>Χρονολόγιο Έργων</h3>
            <p>Πρόοδος έργων στο χρόνο</p>
          </div>
          <div className="timeline-chart">
            <MiniChart 
              type="line" 
              data={projects.slice(-10).map((project, index) => ({
                label: project.projectTitle.substring(0, 10) + '...',
                value: Math.round(((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)))
              }))}
              size="large"
              colors={['#007bff']}
              animated={true}
              showLabel={true}
            />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-metrics">
        <div className="metric-card efficiency">
          <div className="metric-header">
            <div className="metric-icon">⚡</div>
            <h4>Αποδοτικότητα</h4>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <div className="metric-description">
              Ποσοστό ολοκληρώσεων εντός χρονοδιαγράμματος
            </div>
          </div>
        </div>

        <div className="metric-card velocity">
          <div className="metric-header">
            <div className="metric-icon">🚀</div>
            <h4>Ταχύτητα</h4>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {stats.avgDuration} ημέρες
            </div>
            <div className="metric-description">
              Μέση διάρκεια ολοκλήρωσης έργου
            </div>
          </div>
        </div>

        <div className="metric-card quality">
          <div className="metric-header">
            <div className="metric-icon">🏆</div>
            <h4>Ποιότητα</h4>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {stats.overdue === 0 ? '100%' : Math.round(((stats.total - stats.overdue) / stats.total) * 100) + '%'}
            </div>
            <div className="metric-description">
              Έργα χωρίς καθυστερήσεις
            </div>
          </div>
        </div>

        <div className="metric-card utilization">
          <div className="metric-header">
            <div className="metric-icon">📈</div>
            <h4>Αξιοποίηση</h4>
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {Math.round((stats.totalItems / stats.total) * 10) / 10}
            </div>
            <div className="metric-description">
              Μέσα αντικείμενα ανά έργο
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;