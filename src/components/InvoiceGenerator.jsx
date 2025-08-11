import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './InvoiceGenerator.css';

const InvoiceGenerator = ({ onSubmit, onCancel, project, initialData = null }) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'invoice',
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    date: initialData?.date || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    companyName: 'Εταιρεία Μου ΑΕ',
    companyAddress: 'Διεύθυνση Εταιρείας 123\n12345 Αθήνα',
    companyPhone: '210-1234567',
    companyEmail: 'info@company.gr',
    companyTaxId: '123456789',
    clientName: project?.client || '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    clientTaxId: '',
    projectTitle: project?.projectTitle || '',
    items: initialData?.items || [{
      id: 1,
      description: '',
      quantity: 1,
      unit: 'τεμ.',
      unitPrice: 0,
      total: 0
    }],
    subtotal: 0,
    taxRate: 24,
    taxAmount: 0,
    total: 0,
    notes: '',
    terms: 'Όροι πληρωμής: 30 ημέρες'
  });

  function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    return `INV-${year}${month}${day}-${time}`;
  }

  const invoiceTypes = [
    { value: 'invoice', label: '📄 Τιμολόγιο' },
    { value: 'receipt', label: '🧾 Απόδειξη' },
    { value: 'quote', label: '💼 Προσφορά' },
    { value: 'proforma', label: '📋 Προτιμολόγιο' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Αυτόματος υπολογισμός συνόλου γραμμής
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = parseFloat(updatedItem.quantity || 0) * parseFloat(updatedItem.unitPrice || 0);
          }
          
          return updatedItem;
        }
        return item;
      });

      // Αυτόματος υπολογισμός συνολικών
      const subtotal = newItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
      const taxAmount = subtotal * (prev.taxRate / 100);
      const total = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        total
      };
    });
  };

  const addItem = () => {
    const newId = Math.max(...formData.items.map(item => item.id)) + 1;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: newId,
        description: '',
        quantity: 1,
        unit: 'τεμ.',
        unitPrice: 0,
        total: 0
      }]
    }));
  };

  const removeItem = (itemId) => {
    if (formData.items.length > 1) {
      setFormData(prev => {
        const newItems = prev.items.filter(item => item.id !== itemId);
        
        // Επανυπολογισμός συνολικών
        const subtotal = newItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        const taxAmount = subtotal * (prev.taxRate / 100);
        const total = subtotal + taxAmount;

        return {
          ...prev,
          items: newItems,
          subtotal,
          taxAmount,
          total
        };
      });
    }
  };

  const generatePDF = async () => {
    try {
      // Δημιουργία ενός προσωρινού div με το παραστατικό
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      
      tempDiv.innerHTML = generateInvoiceHTML(formData);
      document.body.appendChild(tempDiv);

      // Δημιουργία canvas από το HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      });

      // Αφαίρεση του προσωρινού div
      document.body.removeChild(tempDiv);

      // Δημιουργία PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Αποθήκευση του PDF
      const fileName = `${getTypeLabel(formData.type)}_${formData.invoiceNumber}_${formData.date}.pdf`;
      pdf.save(fileName);
      
      alert('✅ Το PDF δημιουργήθηκε επιτυχώς!');
    } catch (error) {
      console.error('Σφάλμα κατά τη δημιουργία PDF:', error);
      alert('❌ Σφάλμα κατά τη δημιουργία PDF. Δοκιμάστε ξανά.');
    }
  };

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
      <div style="font-family: Arial, sans-serif; max-width: 794px; margin: 0 auto; padding: 20px; color: #000; line-height: 1.4;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="flex: 1;">
            <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #000;">${invoiceData.companyName}</h1>
            <div style="margin-bottom: 5px;">${invoiceData.companyAddress.replace(/\n/g, '<br>')}</div>
            <div style="margin-bottom: 5px;">Τηλ: ${invoiceData.companyPhone} | Email: ${invoiceData.companyEmail}</div>
            <div>ΑΦΜ: ${invoiceData.companyTaxId}</div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #000;">${getTypeLabel(invoiceData.type)}</h2>
            <div style="margin-bottom: 5px; font-weight: bold;">Αρ. ${invoiceData.invoiceNumber}</div>
            <div style="margin-bottom: 5px;">Ημ/νία: ${invoiceData.date}</div>
            ${invoiceData.dueDate ? `<div>Λήξη: ${invoiceData.dueDate}</div>` : ''}
          </div>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px;">Στοιχεία Πελάτη:</h3>
          <div style="font-weight: bold;">${invoiceData.clientName}</div>
          ${invoiceData.clientAddress ? `<div>${invoiceData.clientAddress.replace(/\n/g, '<br>')}</div>` : ''}
          ${invoiceData.clientTaxId ? `<div>ΑΦΜ: ${invoiceData.clientTaxId}</div>` : ''}
        </div>

        ${invoiceData.projectTitle ? `<div style="margin-bottom: 20px; padding: 10px; border-left: 4px solid #000; background: #f5f5f5;"><strong>Έργο:</strong> ${invoiceData.projectTitle}</div>` : ''}

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Περιγραφή</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">Ποσότητα</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-weight: bold;">Μονάδα</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">Τιμή</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">Σύνολο</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td style="border: 1px solid #000; padding: 8px;">${item.description}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.quantity}</td>
                <td style="border: 1px solid #000; padding: 8px;">${item.unit}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(item.unitPrice)}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <div style="margin-bottom: 5px;">Υποσύνολο: ${formatCurrency(invoiceData.subtotal)}</div>
          <div style="margin-bottom: 5px;">ΦΠΑ (${invoiceData.taxRate}%): ${formatCurrency(invoiceData.taxAmount)}</div>
          <div style="font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px;">Τελικό Σύνολο: ${formatCurrency(invoiceData.total)}</div>
        </div>

        ${invoiceData.notes ? `<div style="margin-top: 20px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9;"><strong>Σημειώσεις:</strong> ${invoiceData.notes}</div>` : ''}
        <div style="margin-top: 20px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9; text-align: center; font-style: italic;">${invoiceData.terms}</div>
      </div>
    `;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Δημιουργία του στοιχείου έργου
    const invoiceItem = {
      type: 'invoice',
      title: `${invoiceTypes.find(t => t.value === formData.type)?.label} ${formData.invoiceNumber}`,
      client: formData.clientName,
      date: formData.date,
      startEndDates: formData.dueDate ? `Λήξη: ${formData.dueDate}` : '',
      stage: 'Εκδόθηκε',
      notes: `Αξία: €${formData.total.toFixed(2)}${formData.notes ? '\n' + formData.notes : ''}`,
      invoiceData: formData
    };

    // Εμφάνιση μηνύματος επιτυχίας
    alert(`✅ Το παραστατικό ${formData.invoiceNumber} δημιουργήθηκε επιτυχώς!`);
    
    onSubmit(invoiceItem);
  };

  const formatCurrency = (amount) => {
    return `€${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getTypeLabel = (type) => {
    return invoiceTypes.find(t => t.value === type)?.label || 'Παραστατικό';
  };

  return (
    <div className="invoice-generator">
      <div className="invoice-header">
        <h2>🧾 Δημιουργία Παραστατικού</h2>
        <div className="invoice-actions">
          <button type="button" className="pdf-btn" onClick={generatePDF}>
            📄 Εξαγωγή PDF
          </button>
          <button type="button" className="preview-btn" onClick={() => window.print()}>
            🖨️ Προεπισκόπηση
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            ✕ Ακύρωση
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form">
        {/* Τύπος Παραστατικού */}
        <div className="form-section">
          <h3>Στοιχεία Παραστατικού</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Τύπος Παραστατικού</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {invoiceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Αριθμός Παραστατικού</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ημερομηνία Έκδοσης</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ημερομηνία Λήξης</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Στοιχεία Εταιρείας */}
        <div className="form-section">
          <h3>Στοιχεία Εταιρείας</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Επωνυμία</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>ΑΦΜ</label>
              <input
                type="text"
                name="companyTaxId"
                value={formData.companyTaxId}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Διεύθυνση</label>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Τηλέφωνο</label>
              <input
                type="text"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Στοιχεία Πελάτη */}
        <div className="form-section">
          <h3>Στοιχεία Πελάτη</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Επωνυμία/Όνομα</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>ΑΦΜ</label>
              <input
                type="text"
                name="clientTaxId"
                value={formData.clientTaxId}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Διεύθυνση</label>
              <textarea
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Τηλέφωνο</label>
              <input
                type="text"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Έργο */}
        <div className="form-section">
          <h3>Στοιχεία Έργου</h3>
          <div className="form-group">
            <label>Τίτλος Έργου</label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Γραμμές Παραστατικού */}
        <div className="form-section">
          <h3>Γραμμές Παραστατικού</h3>
          <div className="items-table">
            <div className="table-header">
              <div className="col-description">Περιγραφή</div>
              <div className="col-quantity">Ποσότητα</div>
              <div className="col-unit">Μονάδα</div>
              <div className="col-price">Τιμή Μονάδας</div>
              <div className="col-total">Σύνολο</div>
              <div className="col-actions">Ενέργειες</div>
            </div>
            
            {formData.items.map(item => (
              <div key={item.id} className="table-row">
                <div className="col-description">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Περιγραφή υπηρεσίας/προϊόντος"
                    required
                  />
                </div>
                <div className="col-quantity">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-unit">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                    placeholder="τεμ."
                  />
                </div>
                <div className="col-price">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-total">
                  {formatCurrency(item.total)}
                </div>
                <div className="col-actions">
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem(item.id)}
                    disabled={formData.items.length === 1}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button type="button" className="add-item-btn" onClick={addItem}>
            + Προσθήκη Γραμμής
          </button>
        </div>

        {/* Σύνολα */}
        <div className="form-section totals-section">
          <h3>Σύνολα</h3>
          <div className="totals-grid">
            <div className="total-row">
              <label>Υποσύνολο:</label>
              <span>{formatCurrency(formData.subtotal)}</span>
            </div>
            <div className="total-row">
              <label>
                ΦΠΑ ({formData.taxRate}%):
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value || 0);
                    setFormData(prev => ({
                      ...prev,
                      taxRate: rate,
                      taxAmount: prev.subtotal * (rate / 100),
                      total: prev.subtotal + (prev.subtotal * (rate / 100))
                    }));
                  }}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{ width: '60px', marginLeft: '10px' }}
                />
              </label>
              <span>{formatCurrency(formData.taxAmount)}</span>
            </div>
            <div className="total-row final">
              <label>Τελικό Σύνολο:</label>
              <span>{formatCurrency(formData.total)}</span>
            </div>
          </div>
        </div>

        {/* Σημειώσεις και Όροι */}
        <div className="form-section">
          <h3>Σημειώσεις και Όροι</h3>
          <div className="form-group">
            <label>Σημειώσεις</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Πρόσθετες σημειώσεις..."
            />
          </div>
          <div className="form-group">
            <label>Όροι Πληρωμής</label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              rows="2"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            💾 Αποθήκευση Παραστατικού
          </button>
        </div>
      </form>

      {/* Προεπισκόπηση για εκτύπωση */}
      <div className="invoice-preview print-only">
        <div className="preview-header">
          <div className="company-info">
            <h1>{formData.companyName}</h1>
            <div className="address">{formData.companyAddress}</div>
            <div className="contact">
              Τηλ: {formData.companyPhone} | Email: {formData.companyEmail}
            </div>
            <div className="tax-id">ΑΦΜ: {formData.companyTaxId}</div>
          </div>
          <div className="invoice-info">
            <h2>{getTypeLabel(formData.type)}</h2>
            <div className="invoice-number">Αρ. {formData.invoiceNumber}</div>
            <div className="invoice-date">Ημ/νία: {formData.date}</div>
            {formData.dueDate && <div className="due-date">Λήξη: {formData.dueDate}</div>}
          </div>
        </div>

        <div className="client-info">
          <h3>Στοιχεία Πελάτη:</h3>
          <div className="client-name">{formData.clientName}</div>
          {formData.clientAddress && <div className="client-address">{formData.clientAddress}</div>}
          {formData.clientTaxId && <div className="client-tax-id">ΑΦΜ: {formData.clientTaxId}</div>}
        </div>

        {formData.projectTitle && (
          <div className="project-info">
            <strong>Έργο:</strong> {formData.projectTitle}
          </div>
        )}

        <table className="items-table">
          <thead>
            <tr>
              <th>Περιγραφή</th>
              <th>Ποσότητα</th>
              <th>Μονάδα</th>
              <th>Τιμή</th>
              <th>Σύνολο</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map(item => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="subtotal">Υποσύνολο: {formatCurrency(formData.subtotal)}</div>
          <div className="tax">ΦΠΑ ({formData.taxRate}%): {formatCurrency(formData.taxAmount)}</div>
          <div className="total">Τελικό Σύνολο: {formatCurrency(formData.total)}</div>
        </div>

        {formData.notes && (
          <div className="notes">
            <strong>Σημειώσεις:</strong> {formData.notes}
          </div>
        )}

        <div className="terms">
          {formData.terms}
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
