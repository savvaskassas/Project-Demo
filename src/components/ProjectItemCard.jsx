import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateInvoiceHTML } from './InvoiceGenerator';
import './ProjectItemCard.css';

const ProjectItemCard = ({ item, onEdit, onDelete, isCompact = false }) => {
  const generateInvoiceHTML = (invoiceData) => {
    const formatCurrency = (amount) => `€${parseFloat(amount || 0).toFixed(2)}`;
    
    const getTypeLabel = (type) => {
      const types = {
        'invoice': 'Τιμολόγιο',
        'receipt': 'Απόδειξη',
        'quote': 'Προσφορά',
        'proforma': 'Προτιμολόγιο'
      };
      return types[type] || 'Παραστατικό';
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${getTypeLabel(invoiceData.type)} ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .company-info h1 { margin: 0 0 10px 0; font-size: 24px; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { margin: 0 0 10px 0; font-size: 20px; }
          .client-info { margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9; }
          .client-info h3 { margin: 0 0 10px 0; }
          .project-info { margin-bottom: 20px; padding: 10px; border-left: 4px solid #000; background: #f5f5f5; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; }
          .text-right { text-align: right; }
          .totals { margin-top: 20px; text-align: right; }
          .total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; }
          .notes, .terms { margin-top: 20px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>${invoiceData.companyName}</h1>
            <div>${invoiceData.companyAddress.replace(/\n/g, '<br>')}</div>
            <div>Τηλ: ${invoiceData.companyPhone} | Email: ${invoiceData.companyEmail}</div>
            <div>ΑΦΜ: ${invoiceData.companyTaxId}</div>
          </div>
          <div class="invoice-info">
            <h2>${getTypeLabel(invoiceData.type)}</h2>
            <div>Αρ. ${invoiceData.invoiceNumber}</div>
            <div>Ημ/νία: ${invoiceData.date}</div>
            ${invoiceData.dueDate ? `<div>Λήξη: ${invoiceData.dueDate}</div>` : ''}
          </div>
        </div>

        <div class="client-info">
          <h3>Στοιχεία Πελάτη:</h3>
          <div>${invoiceData.clientName}</div>
          ${invoiceData.clientAddress ? `<div>${invoiceData.clientAddress.replace(/\n/g, '<br>')}</div>` : ''}
          ${invoiceData.clientTaxId ? `<div>ΑΦΜ: ${invoiceData.clientTaxId}</div>` : ''}
        </div>

        ${invoiceData.projectTitle ? `<div class="project-info"><strong>Έργο:</strong> ${invoiceData.projectTitle}</div>` : ''}

        <table>
          <thead>
            <tr>
              <th>Περιγραφή</th>
              <th class="text-right">Ποσότητα</th>
              <th>Μονάδα</th>
              <th class="text-right">Τιμή</th>
              <th class="text-right">Σύνολο</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity}</td>
                <td>${item.unit}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div>Υποσύνολο: ${formatCurrency(invoiceData.subtotal)}</div>
          <div>ΦΠΑ (${invoiceData.taxRate}%): ${formatCurrency(invoiceData.taxAmount)}</div>
          <div class="total">Τελικό Σύνολο: ${formatCurrency(invoiceData.total)}</div>
        </div>

        ${invoiceData.notes ? `<div class="notes"><strong>Σημειώσεις:</strong> ${invoiceData.notes}</div>` : ''}
        <div class="terms">${invoiceData.terms}</div>
      </body>
      </html>
    `;
  };
  const generatePDF = async (invoiceData) => {
    try {
      // Create a temporary div with the invoice HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateInvoiceHTML(invoiceData);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0px';
      tempDiv.style.width = '794px'; // A4 width in pixels (210mm)
      tempDiv.style.minHeight = '1123px'; // A4 height in pixels (297mm)
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.boxSizing = 'border-box';
      document.body.appendChild(tempDiv);

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate canvas from HTML with better settings
      const canvas = await html2canvas(tempDiv, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0,
        allowTaint: false,
        removeContainer: false
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF with correct dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Add image to PDF at full A4 size
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

      // Save PDF
      const docType = invoiceData.type === 'invoice' ? 'Τιμολόγιο' : 
                     invoiceData.type === 'receipt' ? 'Απόδειξη' :
                     invoiceData.type === 'quote' ? 'Προσφορά' : 'Προτιμολόγιο';
      const filename = `${docType}_${invoiceData.invoiceNumber}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Σφάλμα κατά τη δημιουργία του PDF');
    }
  };

  // Συνάρτηση για εκτύπωση παραστατικού
  const handlePrintInvoice = (invoiceData) => {
    try {
      // Δημιουργούμε παράθυρο εκτύπωσης
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Παρακαλώ επιτρέψτε τα pop-ups για εκτύπωση');
        return;
      }
      
      const htmlContent = generateInvoiceHTML(invoiceData);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Περιμένουμε να φορτωθεί και κάνουμε εκτύπωση
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Σφάλμα κατά την εκτύπωση του παραστατικού');
    }
  };

  // Συνάρτηση για εξαγωγή σε PDF
  const handleExportPDF = (invoiceData) => {
    generatePDF(invoiceData);
  };

  const getItemTypeIcon = (type) => {
    const icons = {
      'measurement': '📏',
      'delivery': '📦',
      'installation': '🔧',
      'maintenance': '⚙️',
      'photo': '📷',
      'document': '📄',
      'invoice': '🧾',
      'other': '📋'
    };
    return icons[type] || '📋';
  };

  const getItemTypeLabel = (type) => {
    const labels = {
      'measurement': 'Μέτρηση',
      'delivery': 'Παραγγελία',
      'installation': 'Εγκατάσταση',
      'maintenance': 'Συντήρηση',
      'photo': 'Φωτογραφία',
      'document': 'Έγγραφο',
      'invoice': 'Παραστατικό',
      'other': 'Άλλο'
    };
    return labels[type] || 'Στοιχείο';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR');
  };

  const renderTypeSpecificInfo = () => {
    switch (item.type) {
      case 'measurement':
        return item.measurements && (
          <div className="type-info">
            <h4>Μετρήσεις:</h4>
            <div className="measurements-info">
              {item.measurements.width && <span>Πλάτος: {item.measurements.width}</span>}
              {item.measurements.height && <span>Ύψος: {item.measurements.height}</span>}
              {item.measurements.area && <span>Εμβαδόν: {item.measurements.area}</span>}
            </div>
          </div>
        );
      
      case 'delivery':
        return item.deliveryDetails && (
          <div className="type-info">
            <h4>Στοιχεία Παραγγελίας:</h4>
            <div className="delivery-info">
              {item.deliveryDetails.quantity && <span>Ποσότητα: {item.deliveryDetails.quantity}</span>}
              {item.deliveryDetails.type && <span>Τύπος: {item.deliveryDetails.type}</span>}
            </div>
          </div>
        );

      case 'invoice':
        return item.invoiceData && (
          <div className="type-info invoice-info">
            <h4>Στοιχεία Παραστατικού:</h4>
            <div className="invoice-details">
              <div className="invoice-row">
                <span className="invoice-label">Αριθμός:</span>
                <span className="invoice-value">{item.invoiceData.invoiceNumber}</span>
              </div>
              <div className="invoice-row">
                <span className="invoice-label">Τύπος:</span>
                <span className="invoice-value">
                  {item.invoiceData.type === 'invoice' && '📄 Τιμολόγιο'}
                  {item.invoiceData.type === 'receipt' && '🧾 Απόδειξη'}
                  {item.invoiceData.type === 'quote' && '💼 Προσφορά'}
                  {item.invoiceData.type === 'proforma' && '📋 Προτιμολόγιο'}
                </span>
              </div>
              <div className="invoice-row total-row">
                <span className="invoice-label">Σύνολο:</span>
                <span className="invoice-value total-amount">€{parseFloat(item.invoiceData.total || 0).toFixed(2)}</span>
              </div>
              {item.invoiceData.dueDate && (
                <div className="invoice-row">
                  <span className="invoice-label">Λήξη:</span>
                  <span className="invoice-value">{formatDate(item.invoiceData.dueDate)}</span>
                </div>
              )}
            </div>
            <div className="invoice-actions">
              <button 
                className="view-invoice-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Άνοιγμα του παραστατικού σε νέο παράθυρο για εκτύπωση
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(generateInvoiceHTML(item.invoiceData));
                  printWindow.document.close();
                  printWindow.print();
                }}
                title="Προβολή/Εκτύπωση Παραστατικού"
              >
                🖨️ Εκτύπωση
              </button>
              <button 
                className="export-pdf-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  generatePDF(item.invoiceData);
                }}
                title="Εξαγωγή σε PDF"
              >
                📄 PDF
              </button>
            </div>
          </div>
        );

      case 'other':
        return (
          <div className="type-info">
            <h4>Πληροφορίες:</h4>
            <div className="other-info">
              <span><strong>Κατηγορία:</strong> {item.client}</span>
              {item.startEndDates && <span><strong>Επιπλέον:</strong> {item.startEndDates}</span>}
              {item.stage && <span><strong>Κατάσταση:</strong> {item.stage}</span>}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`project-item-card ${isCompact ? 'compact' : ''}`} data-type={item.type}>
      <div className="item-card-header">
        <div className="item-type">
          <span className="item-icon">{getItemTypeIcon(item.type)}</span>
          <span className="item-type-label">{getItemTypeLabel(item.type)}</span>
        </div>
        <div className="item-actions">
          <button className="edit-item-btn" onClick={onEdit} title="Επεξεργασία">
            ✏️
          </button>
          <button className="delete-item-btn" onClick={onDelete} title="Διαγραφή">
            🗑️
          </button>
        </div>
      </div>

      <div className="item-card-body">
        <h3 className="item-title">{item.title}</h3>
        
        <div className="item-details">
          <div className="detail-item">
            <span className="detail-label">{item.type === 'other' ? 'Κατηγορία:' : 'Πελάτης:'}</span>
            <span className="detail-value">{item.client}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Ημερομηνία:</span>
            <span className="detail-value">{formatDate(item.date)}</span>
          </div>
          
          {item.startEndDates && (
            <div className="detail-item">
              <span className="detail-label">{item.type === 'other' ? 'Επιπλέον:' : 'Διάρκεια:'}</span>
              <span className="detail-value">{item.startEndDates}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="detail-label">Στάδιο:</span>
            <span className="detail-value stage">{item.stage}</span>
          </div>
        </div>

        {renderTypeSpecificInfo()}

        {item.notes && (
          <div className="item-notes">
            <h4>Σημειώσεις:</h4>
            <p>{item.notes}</p>
          </div>
        )}

        {item.photos && item.photos.length > 0 && (
          <div className="item-photos">
            <h4>Φωτογραφίες ({item.photos.length}):</h4>
            <div className="photos-grid">
              {item.photos.slice(0, 4).map((photo, index) => (
                <div key={index} className="photo-mini">
                  <img src={photo.url} alt={photo.name} />
                </div>
              ))}
              {item.photos.length > 4 && (
                <div className="photos-more">
                  +{item.photos.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectItemCard;
