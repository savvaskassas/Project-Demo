import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

class ExcelExportService {
  
  // Function 1: exportProjectsToExcel(projects)
  static exportProjectsToExcel(projects, filename = 'projects_export') {
    try {
      // Prepare data
      const data = projects.map((project, index) => {
        const budget = this.calculateProjectBudget(project);
        const paid = this.calculateProjectPaid(project);
        
        return {
          'Α/Α': index + 1,
          'Όνομα Έργου': project.projectTitle || project.name || '',
          'Πελάτης': project.client || '',
          'Ημ. Έναρξης': format(new Date(project.startDate), 'dd/MM/yyyy'),
          'Ημ. Λήξης': format(new Date(project.endDate), 'dd/MM/yyyy'),
          'Κατάσταση': project.projectStage || project.status || '',
          'Προϋπολογισμός': budget,
          'Εισπραχθέντα': paid,
          'Υπόλοιπο': budget - paid
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },  // Α/Α
        { wch: 30 }, // Όνομα
        { wch: 25 }, // Πελάτης
        { wch: 12 }, // Ημ. Έναρξης
        { wch: 12 }, // Ημ. Λήξης
        { wch: 15 }, // Κατάσταση
        { wch: 15 }, // Προϋπολογισμός
        { wch: 15 }, // Εισπραχθέντα
        { wch: 15 }  // Υπόλοιπο
      ];

      // Format currency columns (G, H, I)
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        ['G', 'H', 'I'].forEach(col => {
          const cellAddress = col + (R + 1);
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].z = '€#,##0.00';
          }
        });
      }

      // Create workbook and export
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Έργα');
      
      const fileName = `Projects_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      return true;
    } catch (error) {
      console.error('Error exporting projects to Excel:', error);
      return false;
    }
  }

  // Function 2: exportFinancialReportToExcel(projects) 
  static exportFinancialReportToExcel(projects, filename = 'financial_report') {
    try {
      // Group by month
      const monthlyData = this.groupProjectsByMonth(projects);
      
      const data = monthlyData.map(monthData => ({
        'Μήνας': monthData.month,
        'Νέα Έργα': monthData.newProjects,
        'Ολοκληρωμένα': monthData.completedProjects,
        'Έσοδα': monthData.revenue,
        'Εισπραχθέντα': monthData.collected,
        'Οφειλές': monthData.pending
      }));

      // Add summary row at bottom
      const totals = {
        'Μήνας': 'ΣΥΝΟΛΑ',
        'Νέα Έργα': monthlyData.reduce((sum, month) => sum + month.newProjects, 0),
        'Ολοκληρωμένα': monthlyData.reduce((sum, month) => sum + month.completedProjects, 0),
        'Έσοδα': monthlyData.reduce((sum, month) => sum + month.revenue, 0),
        'Εισπραχθέντα': monthlyData.reduce((sum, month) => sum + month.collected, 0),
        'Οφειλές': monthlyData.reduce((sum, month) => sum + month.pending, 0)
      };
      data.push(totals);

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Μήνας
        { wch: 12 }, // Νέα Έργα
        { wch: 15 }, // Ολοκληρωμένα
        { wch: 15 }, // Έσοδα
        { wch: 15 }, // Εισπραχθέντα
        { wch: 15 }  // Οφειλές
      ];

      // Format currency columns (D, E, F)
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        ['D', 'E', 'F'].forEach(col => {
          const cellAddress = col + (R + 1);
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].z = '€#,##0.00';
          }
        });
      }

      // Create workbook and export
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Χρηματοοικονομική');
      
      const fileName = `Financial_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      return true;
    } catch (error) {
      console.error('Error exporting financial report to Excel:', error);
      return false;
    }
  }

  // Function 3: exportDashboardStatsToExcel(projects)
  static exportDashboardStatsToExcel(projects, filename = 'dashboard_stats') {
    try {
      // Prepare statistics data
      const stats = this.calculateGeneralStats(projects);
      const statsData = Object.entries(stats).map(([key, value]) => ({
        'Μετρική': key,
        'Αξία': value
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(statsData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 25 }, // Μετρική
        { wch: 20 }  // Αξία
      ];

      // Create workbook and export
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Στατιστικά');
      
      const fileName = `Dashboard_Stats_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      return true;
    } catch (error) {
      console.error('Error exporting dashboard stats to Excel:', error);
      return false;
    }
  }

  // Εξαγωγή παραστατικών σε Excel
  static exportInvoicesToExcel(invoices, filename = 'invoices_export') {
    try {
      const exportData = invoices.map(invoice => ({
        'Αριθμός': invoice.invoiceNumber,
        'Τύπος': this.getInvoiceTypeLabel(invoice.type),
        'Πελάτης': invoice.clientName,
        'Ημερομηνία Έκδοσης': this.formatDate(invoice.issueDate || invoice.date),
        'Ημερομηνία Λήξης': this.formatDate(invoice.dueDate),
        'Κατάσταση': this.getInvoiceStatusLabel(invoice.status),
        'Υποσύνολο': parseFloat(invoice.subtotal || 0).toFixed(2),
        'ΦΠΑ %': invoice.taxRate || 24,
        'ΦΠΑ Ποσό': parseFloat(invoice.taxAmount || 0).toFixed(2),
        'Συνολικό Ποσό': parseFloat(invoice.total || 0).toFixed(2),
        'Αντικείμενα': invoice.items?.length || 0,
        'Σημειώσεις': invoice.notes || '',
        'Έργο': invoice.projectTitle || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
        { wch: 12 }, // Αριθμός
        { wch: 12 }, // Τύπος
        { wch: 20 }, // Πελάτης
        { wch: 12 }, // Ημ. Έκδοσης
        { wch: 12 }, // Ημ. Λήξης
        { wch: 12 }, // Κατάσταση
        { wch: 10 }, // Υποσύνολο
        { wch: 8 },  // ΦΠΑ %
        { wch: 10 }, // ΦΠΑ Ποσό
        { wch: 12 }, // Συνολικό
        { wch: 10 }, // Αντικείμενα
        { wch: 25 }, // Σημειώσεις
        { wch: 20 }  // Έργο
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Παραστατικά');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(data, `${filename}_${timestamp}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Σφάλμα κατά την εξαγωγή παραστατικών σε Excel:', error);
      return false;
    }
  }

  // Εξαγωγή πληρωμών έργου σε Excel
  static exportPaymentsToExcel(project, filename = 'project_payments') {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Συνολικά (Summary)
      const summaryData = [{
        'Έργο': project.projectTitle || project.name || '',
        'Πελάτης': project.client || '',
        'Προϋπολογισμός': this.formatCurrency(project.budget || 0),
        'Εισπραχθέντα': this.formatCurrency(project.paidAmount || 0),
        'Υπόλοιπο': this.formatCurrency((project.budget || 0) - (project.paidAmount || 0)),
        'Ποσοστό Εξόφλησης': `${Math.round(((project.paidAmount || 0) / (project.budget || 1)) * 100)}%`
      }];
      
      const ws1 = XLSX.utils.json_to_sheet(summaryData);
      ws1['!cols'] = [
        { wch: 30 }, // Έργο
        { wch: 20 }, // Πελάτης
        { wch: 15 }, // Προϋπολογισμός
        { wch: 15 }, // Εισπραχθέντα
        { wch: 15 }, // Υπόλοιπο
        { wch: 18 }  // Ποσοστό Εξόφλησης
      ];
      XLSX.utils.book_append_sheet(wb, ws1, 'Συνολικά');

      // Sheet 2: Πληρωμές (Details)
      const paymentsData = (project.payments || []).map(payment => ({
        'Ημερομηνία': this.formatDateDDMMYYYY(payment.date),
        'Τύπος': payment.type || 'Πληρωμή',
        'Ποσό': this.formatCurrency(payment.amount || 0),
        'Τρόπος Πληρωμής': payment.method || 'Μετρητά',
        'Περιγραφή': payment.description || '',
        'Αρ. Παραστατικού': payment.invoiceNumber || ''
      }));

      // Προσθήκη συνόλου στο τέλος
      const totalPayments = (project.payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
      paymentsData.push({
        'Ημερομηνία': '',
        'Τύπος': 'ΣΥΝΟΛΟ',
        'Ποσό': this.formatCurrency(totalPayments),
        'Τρόπος Πληρωμής': '',
        'Περιγραφή': '',
        'Αρ. Παραστατικού': ''
      });

      const ws2 = XLSX.utils.json_to_sheet(paymentsData);
      ws2['!cols'] = [
        { wch: 12 }, // Ημερομηνία
        { wch: 12 }, // Τύπος
        { wch: 15 }, // Ποσό
        { wch: 15 }, // Τρόπος Πληρωμής
        { wch: 25 }, // Περιγραφή
        { wch: 15 }  // Αρ. Παραστατικού
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'Πληρωμές');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const projectName = (project.projectTitle || project.name || 'project').replace(/[^a-zA-Z0-9]/g, '_');
      saveAs(data, `${filename}_${projectName}_${timestamp}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Σφάλμα κατά την εξαγωγή πληρωμών σε Excel:', error);
      return false;
    }
  }

  // Εξαγωγή υλικών έργου σε Excel
  static exportMaterialsToExcel(project, filename = 'project_materials') {
    try {
      const materialsData = (project.materials || []).map((material, index) => ({
        'Α/Α': index + 1,
        'Υλικό': material.name || material.description || '',
        'Ποσότητα': material.quantity || 0,
        'Μονάδα Μέτρησης': material.unit || 'τεμ.',
        'Τιμή Μονάδας': this.formatCurrency(material.unitPrice || 0),
        'Συνολική Αξία': this.formatCurrency((material.quantity || 0) * (material.unitPrice || 0)),
        'Προμηθευτής': material.supplier || '',
        'Κατηγορία': material.category || '',
        'Κωδικός': material.code || ''
      }));

      // Προσθήκη συνόλου
      const totalValue = materialsData.reduce((sum, material) => {
        const value = parseFloat(material['Συνολική Αξία'].replace('€', '').replace(',', '')) || 0;
        return sum + value;
      }, 0);

      materialsData.push({
        'Α/Α': '',
        'Υλικό': 'ΣΥΝΟΛΟ',
        'Ποσότητα': '',
        'Μονάδα Μέτρησης': '',
        'Τιμή Μονάδας': '',
        'Συνολική Αξία': this.formatCurrency(totalValue),
        'Προμηθευτής': '',
        'Κατηγορία': '',
        'Κωδικός': ''
      });

      const ws = XLSX.utils.json_to_sheet(materialsData);
      ws['!cols'] = [
        { wch: 5 },  // Α/Α
        { wch: 25 }, // Υλικό
        { wch: 10 }, // Ποσότητα
        { wch: 15 }, // Μονάδα Μέτρησης
        { wch: 12 }, // Τιμή Μονάδας
        { wch: 15 }, // Συνολική Αξία
        { wch: 20 }, // Προμηθευτής
        { wch: 15 }, // Κατηγορία
        { wch: 12 }  // Κωδικός
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Υλικά');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const projectName = (project.projectTitle || project.name || 'project').replace(/[^a-zA-Z0-9]/g, '_');
      saveAs(data, `${filename}_${projectName}_${timestamp}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Σφάλμα κατά την εξαγωγή υλικών σε Excel:', error);
      return false;
    }
  }

  // Function 4: exportFinancialReportToExcel(projects)
  static exportFinancialReportToExcel(projects, filename = 'financial_report') {
    try {
      // Group by month
      const monthlyData = this.groupProjectsByMonth(projects);
      
      const data = monthlyData.map(monthData => ({
        'Μήνας': monthData.month,
        'Νέα Έργα': monthData.newProjects,
        'Ολοκληρωμένα': monthData.completedProjects,
        'Έσοδα': monthData.revenue,
        'Εισπραχθέντα': monthData.collected,
        'Οφειλές': monthData.pending
      }));

      // Add summary row at bottom
      const totals = {
        'Μήνας': 'ΣΥΝΟΛΑ',
        'Νέα Έργα': monthlyData.reduce((sum, month) => sum + month.newProjects, 0),
        'Ολοκληρωμένα': monthlyData.reduce((sum, month) => sum + month.completedProjects, 0),
        'Έσοδα': monthlyData.reduce((sum, month) => sum + month.revenue, 0),
        'Εισπραχθέντα': monthlyData.reduce((sum, month) => sum + month.collected, 0),
        'Οφειλές': monthlyData.reduce((sum, month) => sum + month.pending, 0)
      };
      data.push(totals);

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Μήνας
        { wch: 12 }, // Νέα Έργα
        { wch: 15 }, // Ολοκληρωμένα
        { wch: 15 }, // Έσοδα
        { wch: 15 }, // Εισπραχθέντα
        { wch: 15 }  // Οφειλές
      ];

      // Format currency columns (D, E, F)
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        ['D', 'E', 'F'].forEach(col => {
          const cellAddress = col + (R + 1);
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].z = '€#,##0.00';
          }
        });
      }

      // Create workbook and export
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Χρηματοοικονομική');
      
      const fileName = `Financial_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      return true;
    } catch (error) {
      console.error('Error exporting financial report to Excel:', error);
      return false;
    }
  }

  // Εξαγωγή στατιστικών dashboard σε Excel
  static exportDashboardStatsToExcel(projects, filename = 'dashboard_stats') {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Γενικά Στατιστικά
      const generalStats = this.calculateGeneralStats(projects);
      const ws1 = XLSX.utils.json_to_sheet([generalStats]);
      XLSX.utils.book_append_sheet(wb, ws1, 'Γενικά Στατιστικά');

      // Sheet 2: Ανάλυση κατά Στάδιο
      const stageStats = this.calculateStageStats(projects);
      const ws2 = XLSX.utils.json_to_sheet(stageStats);
      XLSX.utils.book_append_sheet(wb, ws2, 'Ανάλυση Σταδίων');

      // Sheet 3: Ανάλυση κατά Πελάτη
      const clientStats = this.calculateClientStats(projects);
      const ws3 = XLSX.utils.json_to_sheet(clientStats);
      XLSX.utils.book_append_sheet(wb, ws3, 'Ανάλυση Πελατών');

      // Sheet 4: Χρονική Ανάλυση
      const timeStats = this.calculateTimeStats(projects);
      const ws4 = XLSX.utils.json_to_sheet(timeStats);
      XLSX.utils.book_append_sheet(wb, ws4, 'Χρονική Ανάλυση');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(data, `${filename}_${timestamp}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Σφάλμα κατά την εξαγωγή στατιστικών σε Excel:', error);
      return false;
    }
  }

  // Βοηθητικές μέθοδοι
  static formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('el-GR');
    } catch {
      return dateString;
    }
  }

  static getProjectStatus(project) {
    if (project.projectStage === 'Ολοκληρωμένο') return 'Ολοκληρωμένο';
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Καθυστερημένο';
    if (diffDays <= 7) return 'Λήγει Σύντομα';
    return 'Εντός Χρονοδιαγράμματος';
  }

  static getInvoiceTypeLabel(type) {
    const types = {
      'invoice': 'Τιμολόγιο',
      'receipt': 'Απόδειξη',
      'quote': 'Προσφορά',
      'estimate': 'Προσφορά',
      'proforma': 'Προτιμολόγιο'
    };
    return types[type] || type;
  }

  static getInvoiceStatusLabel(status) {
    const statuses = {
      'draft': 'Πρόχειρο',
      'sent': 'Εστάλη',
      'paid': 'Εξοφλημένο',
      'overdue': 'Ληξιπρόθεσμο',
      'cancelled': 'Ακυρωμένο'
    };
    return statuses[status] || status;
  }

  static calculateGeneralStats(projects) {
    const total = projects.length;
    const completed = projects.filter(p => p.projectStage === 'Ολοκληρωμένο').length;
    const inProgress = total - completed;
    const overdue = projects.filter(p => {
      const today = new Date();
      const endDate = new Date(p.endDate);
      return endDate < today && p.projectStage !== 'Ολοκληρωμένο';
    }).length;

    return {
      'Συνολικά Έργα': total,
      'Ολοκληρωμένα': completed,
      'Σε Εξέλιξη': inProgress,
      'Καθυστερημένα': overdue,
      'Ποσοστό Ολοκλήρωσης': total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%',
      'Συνολικοί Συνεργάτες': new Set(projects.flatMap(p => p.assignedCollaborators || [])).size,
      'Συνολικά Αντικείμενα': projects.reduce((sum, p) => sum + (p.items?.length || 0), 0),
      'Συνολικές Φωτογραφίες': projects.reduce((sum, p) => sum + (p.photos?.length || 0), 0)
    };
  }

  static calculateStageStats(projects) {
    const stages = {};
    projects.forEach(project => {
      const stage = project.projectStage || 'Άγνωστο';
      stages[stage] = (stages[stage] || 0) + 1;
    });

    return Object.entries(stages).map(([stage, count]) => ({
      'Στάδιο': stage,
      'Αριθμός Έργων': count,
      'Ποσοστό': `${Math.round((count / projects.length) * 100)}%`
    }));
  }

  static calculateClientStats(projects) {
    const clients = {};
    projects.forEach(project => {
      const client = project.client || 'Άγνωστος';
      clients[client] = (clients[client] || 0) + 1;
    });

    return Object.entries(clients)
      .sort(([,a], [,b]) => b - a)
      .map(([client, count]) => ({
        'Πελάτης': client,
        'Αριθμός Έργων': count,
        'Ποσοστό': `${Math.round((count / projects.length) * 100)}%`
      }));
  }

  static calculateTimeStats(projects) {
    const currentYear = new Date().getFullYear();
    const months = {};

    projects.forEach(project => {
      const startDate = new Date(project.startDate);
      if (startDate.getFullYear() === currentYear) {
        const monthName = startDate.toLocaleDateString('el-GR', { month: 'long' });
        months[monthName] = (months[monthName] || 0) + 1;
      }
    });

    return Object.entries(months).map(([month, count]) => ({
      'Μήνας': month,
      'Νέα Έργα': count
    }));
  }

  // Βοηθητικές μέθοδοι για τις νέες λειτουργίες

  static formatDateDDMMYYYY(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  static groupProjectsByMonth(projects) {
    const monthlyData = {};
    
    projects.forEach(project => {
      const date = new Date(project.startDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('el-GR', { 
        month: 'long', 
        year: 'numeric' 
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          newProjects: 0,
          completedProjects: 0,
          revenue: 0,
          collected: 0,
          pending: 0
        };
      }

      monthlyData[monthKey].newProjects++;
      
      if (project.projectStage === 'Ολοκληρωμένο') {
        monthlyData[monthKey].completedProjects++;
      }

      const budget = project.budget || 0;
      const paid = project.paidAmount || 0;
      
      monthlyData[monthKey].revenue += budget;
      monthlyData[monthKey].collected += paid;
      monthlyData[monthKey].pending += (budget - paid);
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  static calculateProjectBudget(project) {
    // Υπολογισμός προϋπολογισμού από υλικά και εργασία
    const materialsCost = (project.materials || []).reduce((sum, material) => {
      return sum + ((material.quantity || 0) * (material.unitPrice || 0));
    }, 0);
    
    const laborCost = project.laborCost || 0;
    const overheadCost = project.overheadCost || 0;
    
    return project.budget || (materialsCost + laborCost + overheadCost) || 45000; // Default value for demo
  }

  static calculateProjectPaid(project) {
    // Υπολογισμός εισπραχθέντων από πληρωμές
    const paymentsTotal = (project.payments || []).reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);
    
    return project.paidAmount || paymentsTotal || (this.calculateProjectBudget(project) * 0.3); // Default 30% for demo
  }
}

export default ExcelExportService;