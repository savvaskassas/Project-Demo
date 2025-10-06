import React, { useState } from 'react';
import ExcelExportService from '../../utils/ExcelExportService';
import './ExportButtons.css';

const ExportButtons = ({ 
  projects = [], 
  selectedProject = null, 
  showProjectSpecific = false,
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const handleExport = async (exportType) => {
    setIsExporting(true);
    setExportStatus(`Εξαγωγή ${exportType}...`);

    try {
      let success = false;
      
      switch (exportType) {
        case 'projects':
          success = ExcelExportService.exportProjectsToExcel(projects, 'projects_export');
          break;
        case 'payments':
          if (selectedProject) {
            success = ExcelExportService.exportPaymentsToExcel(selectedProject, 'project_payments');
          } else {
            throw new Error('Δεν έχει επιλεγεί έργο για εξαγωγή πληρωμών');
          }
          break;
        case 'materials':
          if (selectedProject) {
            success = ExcelExportService.exportMaterialsToExcel(selectedProject, 'project_materials');
          } else {
            throw new Error('Δεν έχει επιλεγεί έργο για εξαγωγή υλικών');
          }
          break;
        case 'financial':
          success = ExcelExportService.exportFinancialReportToExcel(projects, 'financial_report');
          break;
        case 'dashboard':
          success = ExcelExportService.exportDashboardStatsToExcel(projects, 'dashboard_stats');
          break;
        default:
          throw new Error('Άγνωστος τύπος εξαγωγής');
      }

      if (success) {
        setExportStatus('✅ Εξαγωγή ολοκληρώθηκε επιτυχώς!');
        setTimeout(() => setExportStatus(''), 3000);
      } else {
        throw new Error('Η εξαγωγή απέτυχε');
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus(`❌ Σφάλμα: ${error.message}`);
      setTimeout(() => setExportStatus(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      key: 'projects',
      label: 'Excel - Έργα',
      icon: '📊',
      description: 'Εξαγωγή όλων των έργων με οικονομικά στοιχεία',
      disabled: projects.length === 0,
      global: true
    },
    {
      key: 'financial',
      label: 'Excel - Χρηματοοικονομική',
      icon: '💰',
      description: 'Χρηματοοικονομική αναφορά ανά μήνα',
      disabled: projects.length === 0,
      global: true
    },
    {
      key: 'dashboard',
      label: 'Excel - Στατιστικά',
      icon: '📈',
      description: 'Στατιστικά και αναλυτικά στοιχεία',
      disabled: projects.length === 0,
      global: true
    },
    {
      key: 'payments',
      label: 'Excel - Πληρωμές',
      icon: '💳',
      description: 'Πληρωμές και οικονομικά στοιχεία έργου',
      disabled: !selectedProject,
      global: false
    },
    {
      key: 'materials',
      label: 'Excel - Υλικά',
      icon: '🏗️',
      description: 'Υλικά και κόστος έργου',
      disabled: !selectedProject,
      global: false
    }
  ];

  const filteredOptions = showProjectSpecific 
    ? exportOptions 
    : exportOptions.filter(option => option.global);

  return (
    <div className={`export-buttons-container ${className}`}>
      <div className="export-buttons-header">
        <h3 className="export-title">
          <span className="export-icon">📊</span>
          Εξαγωγή Δεδομένων
        </h3>
        {exportStatus && (
          <div className={`export-status ${exportStatus.includes('❌') ? 'error' : 'success'}`}>
            {exportStatus}
          </div>
        )}
      </div>

      <div className="export-buttons-grid">
        {filteredOptions.map(option => (
          <button
            key={option.key}
            className={`export-button ${option.disabled ? 'disabled' : ''} ${isExporting ? 'loading' : ''}`}
            onClick={() => handleExport(option.key)}
            disabled={option.disabled || isExporting}
            title={option.description}
          >
            <div className="export-button-icon">
              {isExporting ? (
                <div className="loading-spinner">⏳</div>
              ) : (
                option.icon
              )}
            </div>
            <div className="export-button-content">
              <div className="export-button-label">{option.label}</div>
              <div className="export-button-description">{option.description}</div>
            </div>
          </button>
        ))}
      </div>

      {showProjectSpecific && !selectedProject && (
        <div className="export-info">
          <div className="info-icon">ℹ️</div>
          <p>Επιλέξτε ένα έργο για να ενεργοποιήσετε τις επιλογές εξαγωγής ανά έργο.</p>
        </div>
      )}

      {projects.length === 0 && (
        <div className="export-info">
          <div className="info-icon">📋</div>
          <p>Δεν υπάρχουν έργα για εξαγωγή. Δημιουργήστε το πρώτο σας έργο!</p>
        </div>
      )}
    </div>
  );
};

export default ExportButtons;