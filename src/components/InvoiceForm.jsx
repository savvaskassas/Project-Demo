import React, { useState } from 'react';
import './InvoiceForm.css';

const InvoiceForm = ({ onSubmit, onCancel, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: (initialData?.invoiceNumber) || '',
    type: (initialData?.type) || 'estimate',
    clientName: (initialData?.clientName) || '',
    clientAddress: (initialData?.clientAddress) || '',
    clientPhone: (initialData?.clientPhone) || '',
    clientEmail: (initialData?.clientEmail) || '',
    issueDate: (initialData?.issueDate) || new Date().toISOString().split('T')[0],
    dueDate: (initialData?.dueDate) || '',
    items: (initialData?.items) || [
      { description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    subtotal: (initialData?.subtotal) || 0,
    taxRate: (initialData?.taxRate) || 24,
    taxAmount: (initialData?.taxAmount) || 0,
    total: (initialData?.total) || 0,
    notes: (initialData?.notes) || '',
    status: (initialData?.status) || 'draft'
  });

  const [errors, setErrors] = useState({});

  const invoiceTypes = [
    { value: 'estimate', label: '📋 Προσφορά' },
    { value: 'invoice', label: '📄 Τιμολόγιο' },
    { value: 'receipt', label: '🧾 Απόδειξη' },
    { value: 'proforma', label: '📋 Προτιμολόγιο' }
  ];

  const statusOptions = [
    { value: 'draft', label: '📝 Πρόχειρο' },
    { value: 'sent', label: '📤 Απεσταλμένο' },
    { value: 'paid', label: '✅ Εξοφλημένο' },
    { value: 'overdue', label: '⚠️ Εκπρόθεσμο' },
    { value: 'cancelled', label: '❌ Ακυρωμένο' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Υπολογισμός συνόλου για το item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].total = quantity * unitPrice;
    }

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));

    // Υπολογισμός συνολικών
    calculateTotals(newItems);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
      calculateTotals(newItems);
    }
  };

  const calculateTotals = (items = formData.items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Ο αριθμός παραστατικού είναι υποχρεωτικός';
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Το όνομα πελάτη είναι υποχρεωτικό';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Η ημερομηνία έκδοσης είναι υποχρεωτική';
    }

    if (formData.items.some(item => !item.description.trim())) {
      newErrors.items = 'Όλα τα στοιχεία πρέπει να έχουν περιγραφή';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const invoiceData = {
        ...formData,
        id: initialData?.id || Date.now(),
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onSubmit(invoiceData);
    }
  };

  return (
    <div className="invoice-form-container">
      <div className="invoice-form-header">
        <h2>{isEditing ? 'Επεξεργασία Παραστατικού' : 'Νέο Παραστατικό'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form">
        {/* Βασικές Πληροφορίες */}
        <div className="form-section">
          <h3>📋 Βασικές Πληροφορίες</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Αριθμός Παραστατικού *</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                className={errors.invoiceNumber ? 'error' : ''}
                placeholder="π.χ. INV-2024-001"
              />
              {errors.invoiceNumber && <span className="error-message">{errors.invoiceNumber}</span>}
            </div>

            <div className="form-group">
              <label>Τύπος Παραστατικού *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {invoiceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Κατάσταση</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ημερομηνία Έκδοσης *</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className={errors.issueDate ? 'error' : ''}
              />
              {errors.issueDate && <span className="error-message">{errors.issueDate}</span>}
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

        {/* Στοιχεία Πελάτη */}
        <div className="form-section">
          <h3>👤 Στοιχεία Πελάτη</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Όνομα Πελάτη *</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className={errors.clientName ? 'error' : ''}
                placeholder="Όνομα πελάτη"
              />
              {errors.clientName && <span className="error-message">{errors.clientName}</span>}
            </div>

            <div className="form-group">
              <label>Τηλέφωνο</label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleInputChange}
                placeholder="Τηλέφωνο πελάτη"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                placeholder="Email πελάτη"
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
                placeholder="Διεύθυνση πελάτη"
                rows="2"
              />
            </div>
          </div>
        </div>

        {/* Στοιχεία Παραστατικού */}
        <div className="form-section">
          <h3>📊 Στοιχεία Παραστατικού</h3>
          
          <div className="items-header">
            <span>Περιγραφή</span>
            <span>Ποσότητα</span>
            <span>Τιμή Μονάδας (€)</span>
            <span>Σύνολο (€)</span>
            <span>Ενέργειες</span>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-field">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Περιγραφή υπηρεσίας/προϊόντος"
                />
              </div>
              <div className="item-field">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="item-field">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="item-field">
                <span className="total-display">{item.total.toFixed(2)}</span>
              </div>
              <div className="item-field">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="remove-item-btn"
                  disabled={formData.items.length === 1}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="add-item-btn">
            ➕ Προσθήκη Στοιχείου
          </button>

          {errors.items && <span className="error-message">{errors.items}</span>}
        </div>

        {/* Υπολογισμοί */}
        <div className="form-section">
          <h3>💰 Υπολογισμοί</h3>
          <div className="calculations">
            <div className="calc-row">
              <label>Μερικό Σύνολο:</label>
              <span>{formData.subtotal} €</span>
            </div>
            <div className="calc-row">
              <label>ΦΠΑ ({formData.taxRate}%):</label>
              <span>{formData.taxAmount} €</span>
            </div>
            <div className="calc-row total-row">
              <label>Συνολικό Ποσό:</label>
              <span>{formData.total} €</span>
            </div>
          </div>

          <div className="form-group">
            <label>Ποσοστό ΦΠΑ (%)</label>
            <input
              type="number"
              name="taxRate"
              value={formData.taxRate}
              onChange={(e) => {
                handleInputChange(e);
                calculateTotals();
              }}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        {/* Σημειώσεις */}
        <div className="form-section">
          <h3>📝 Σημειώσεις</h3>
          <div className="form-group full-width">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Επιπλέον σημειώσεις ή όροι πληρωμής..."
              rows="4"
            />
          </div>
        </div>

        {/* Κουμπιά */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            ❌ Ακύρωση
          </button>
          <button type="submit" className="submit-btn">
            💾 {isEditing ? 'Ενημέρωση' : 'Δημιουργία'} Παραστατικού
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
