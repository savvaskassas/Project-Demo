import React from 'react';
import './ProjectItemCard.css';

const ProjectItemCard = ({ item, onEdit, onDelete, isCompact = false }) => {
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
