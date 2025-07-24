import React from 'react';
import './InvoiceCard.css';

const InvoiceCard = ({ invoice, onView, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#6c757d';
      case 'sent': return '#007bff';
      case 'paid': return '#28a745';
      case 'overdue': return '#dc3545';
      case 'cancelled': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return '📝 Πρόχειρο';
      case 'sent': return '📤 Απεσταλμένο';
      case 'paid': return '✅ Εξοφλημένο';
      case 'overdue': return '⚠️ Εκπρόθεσμο';
      case 'cancelled': return '❌ Ακυρωμένο';
      default: return '📝 Πρόχειρο';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'estimate': return '📋 Προσφορά';
      case 'invoice': return '📄 Τιμολόγιο';
      case 'receipt': return '🧾 Απόδειξη';
      case 'proforma': return '📋 Προτιμολόγιο';
      default: return '📄 Παραστατικό';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date() && status !== 'paid';
  };

  const overdue = isOverdue(invoice.dueDate, invoice.status);

  return (
    <div className={`invoice-card ${overdue ? 'overdue' : ''}`}>
      <div className="invoice-card-header">
        <div className="invoice-number">
          <h3>{invoice.invoiceNumber}</h3>
          <span className="invoice-type">{getTypeLabel(invoice.type)}</span>
        </div>
        <div 
          className="invoice-status"
          style={{ backgroundColor: getStatusColor(invoice.status) }}
        >
          {getStatusLabel(invoice.status)}
        </div>
      </div>

      <div className="invoice-card-body">
        <div className="client-info">
          <div className="client-name">
            <strong>👤 {invoice.clientName}</strong>
          </div>
          {invoice.clientPhone && (
            <div className="client-contact">
              📞 {invoice.clientPhone}
            </div>
          )}
          {invoice.clientEmail && (
            <div className="client-contact">
              ✉️ {invoice.clientEmail}
            </div>
          )}
        </div>

        <div className="invoice-details">
          <div className="detail-row">
            <span className="label">📅 Έκδοση:</span>
            <span className="value">{formatDate(invoice.issueDate)}</span>
          </div>
          {invoice.dueDate && (
            <div className="detail-row">
              <span className="label">⏰ Λήξη:</span>
              <span className={`value ${overdue ? 'overdue-text' : ''}`}>
                {formatDate(invoice.dueDate)}
              </span>
            </div>
          )}
          <div className="detail-row">
            <span className="label">📊 Στοιχεία:</span>
            <span className="value">{invoice.items?.length || 0} στοιχεία</span>
          </div>
        </div>

        <div className="invoice-amounts">
          <div className="amount-row subtotal">
            <span>Μερικό Σύνολο:</span>
            <span>{formatCurrency(invoice.subtotal)} €</span>
          </div>
          <div className="amount-row tax">
            <span>ΦΠΑ ({invoice.taxRate}%):</span>
            <span>{formatCurrency(invoice.taxAmount)} €</span>
          </div>
          <div className="amount-row total">
            <span>Συνολικό:</span>
            <span>{formatCurrency(invoice.total)} €</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="invoice-notes">
            <strong>📝 Σημειώσεις:</strong>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="invoice-card-actions">
        <button 
          className="action-btn view-btn"
          onClick={() => onView(invoice)}
          title="Προβολή Παραστατικού"
        >
          👁️ Προβολή
        </button>
        <button 
          className="action-btn edit-btn"
          onClick={() => onEdit(invoice)}
          title="Επεξεργασία Παραστατικού"
        >
          ✏️ Επεξεργασία
        </button>
        <button 
          className="action-btn delete-btn"
          onClick={() => onDelete(invoice.id)}
          title="Διαγραφή Παραστατικού"
        >
          🗑️ Διαγραφή
        </button>
      </div>

      {overdue && (
        <div className="overdue-badge">
          ⚠️ Εκπρόθεσμο
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;
