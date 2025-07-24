import React, { useState } from 'react';
import InvoiceCard from './InvoiceCard';
import './InvoiceList.css';

const InvoiceList = ({ 
  invoices, 
  onNewInvoice, 
  onViewInvoice, 
  onEditInvoice, 
  onDeleteInvoice 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const statusOptions = [
    { value: 'all', label: 'Όλα' },
    { value: 'draft', label: '📝 Πρόχειρα' },
    { value: 'sent', label: '📤 Απεσταλμένα' },
    { value: 'paid', label: '✅ Εξοφλημένα' },
    { value: 'overdue', label: '⚠️ Εκπρόθεσμα' },
    { value: 'cancelled', label: '❌ Ακυρωμένα' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Όλα' },
    { value: 'estimate', label: '📋 Προσφορές' },
    { value: 'invoice', label: '📄 Τιμολόγια' },
    { value: 'receipt', label: '🧾 Αποδείξεις' },
    { value: 'proforma', label: '📋 Προτιμολόγια' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Ημερομηνία' },
    { value: 'number', label: 'Αριθμός' },
    { value: 'client', label: 'Πελάτης' },
    { value: 'amount', label: 'Ποσό' },
    { value: 'status', label: 'Κατάσταση' }
  ];

  const getFilteredAndSortedInvoices = () => {
    let filtered = invoices.filter(invoice => {
      // Search term filter
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.clientEmail && invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

      // Type filter
      const matchesType = filterType === 'all' || invoice.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
          break;
        case 'number':
          aValue = a.invoiceNumber.toLowerCase();
          bValue = b.invoiceNumber.toLowerCase();
          break;
        case 'client':
          aValue = a.clientName.toLowerCase();
          bValue = b.clientName.toLowerCase();
          break;
        case 'amount':
          aValue = parseFloat(a.total || 0);
          bValue = parseFloat(b.total || 0);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.issueDate;
          bValue = b.issueDate;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredInvoices = getFilteredAndSortedInvoices();

  const getTotalStats = () => {
    const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const paid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const pending = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

    return { total, paid, pending };
  };

  const stats = getTotalStats();

  const handleDeleteInvoice = (invoiceId) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το παραστατικό;')) {
      onDeleteInvoice(invoiceId);
    }
  };

  return (
    <div className="invoice-list-container">
      <div className="invoice-list-header">
        <div className="header-title">
          <h1>📊 Διαχείριση Παραστατικών</h1>
          <p>Διαχειριστείτε όλα τα παραστατικά σας σε ένα μέρος</p>
        </div>
        
        <button className="new-invoice-btn" onClick={onNewInvoice}>
          ➕ Νέο Παραστατικό
        </button>
      </div>

      {/* Στατιστικά */}
      <div className="invoice-stats">
        <div className="stat-card total">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total.toFixed(2)} €</div>
            <div className="stat-label">Συνολικά Έσοδα</div>
          </div>
        </div>
        <div className="stat-card paid">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.paid.toFixed(2)} €</div>
            <div className="stat-label">Εξοφλημένα</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending.toFixed(2)} €</div>
            <div className="stat-label">Εκκρεμή</div>
          </div>
        </div>
        <div className="stat-card count">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{invoices.length}</div>
            <div className="stat-label">Συνολικά Παραστατικά</div>
          </div>
        </div>
      </div>

      {/* Φίλτρα και Αναζήτηση */}
      <div className="invoice-filters">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="🔍 Αναζήτηση (αριθμός, πελάτης, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Κατάσταση:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Τύπος:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ταξινόμηση:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Σειρά:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Φθίνουσα</option>
              <option value="asc">Αύξουσα</option>
            </select>
          </div>
        </div>
      </div>

      {/* Αποτελέσματα */}
      <div className="invoice-results">
        <div className="results-header">
          <span className="results-count">
            {filteredInvoices.length} από {invoices.length} παραστατικά
          </span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="no-invoices">
            <div className="no-invoices-icon">📄</div>
            <h3>Δεν βρέθηκαν παραστατικά</h3>
            <p>
              {invoices.length === 0 
                ? 'Δεν έχετε δημιουργήσει ακόμα κανένα παραστατικό.'
                : 'Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης ή φιλτραρίσματος.'
              }
            </p>
            {invoices.length === 0 && (
              <button className="create-first-invoice-btn" onClick={onNewInvoice}>
                🚀 Δημιουργήστε το πρώτο σας παραστατικό
              </button>
            )}
          </div>
        ) : (
          <div className="invoice-grid">
            {filteredInvoices.map(invoice => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={onViewInvoice}
                onEdit={onEditInvoice}
                onDelete={handleDeleteInvoice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
