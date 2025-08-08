import React, { useState } from 'react';
import ProjectItemForm from './ProjectItemForm';
import ProjectItemCard from './ProjectItemCard';
import ProjectNotes from './ProjectNotes';
import './ProjectDetails.css';

const ProjectDetails = ({ 
  project, 
  selectedNoteDate,
  onBack, 
  onEdit, 
  onDelete, 
  onComplete,
  onUpdateProject,
  onAddItem, 
  onUpdateItem, 
  onDeleteItem,
  onClearSelectedNoteDate
}) => {
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '📋 Όλα', icon: '📋' },
    { value: 'measurement', label: '📏 Μέτρηση', icon: '📏' },
    { value: 'delivery', label: '📦 Παραγγελία', icon: '📦' },
    { value: 'installation', label: '🔧 Εγκατάσταση', icon: '🔧' },
    { value: 'maintenance', label: '⚙️ Συντήρηση', icon: '⚙️' },
    { value: 'photo', label: '📷 Φωτογραφία', icon: '📷' },
    { value: 'document', label: '📄 Έγγραφο', icon: '📄' },
    { value: 'invoice', label: '🧾 Παραστατικό', icon: '🧾' },
    { value: 'other', label: '📋 Άλλο', icon: '📋' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAddItem = (itemData) => {
    onAddItem(itemData);
    setShowItemForm(false);
  };

  const handleUpdateItem = (updatedItem) => {
    onUpdateItem(editingItem.id, updatedItem);
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId) => {
    onDeleteItem(itemId);
  };

  const getStageColor = (stage) => {
    const colors = {
      'Προγραμματισμός': '#6c757d',
      'Ανάλυση Απαιτήσεων': '#17a2b8',
      'Σχεδιασμός': '#ffc107',
      'Ανάπτυξη': '#ff7700',
      'Δοκιμές': '#dc3545',
      'Παράδοση': '#28a745',
      'Συντήρηση': '#6f42c1',
      'Ολοκληρωμένο': '#28a745'
    };
    return colors[stage] || '#6c757d';
  };

  const getFilteredItems = () => {
    if (!project.items) return [];
    if (selectedCategory === 'all') return project.items;
    return project.items.filter(item => item.type === selectedCategory);
  };

  const getCategoryCount = (categoryValue) => {
    if (!project.items) return 0;
    if (categoryValue === 'all') return project.items.length;
    return project.items.filter(item => item.type === categoryValue).length;
  };

  if (showItemForm) {
    return (
      <div className="project-details">
        <div className="project-details-header">
          <button className="back-btn" onClick={() => setShowItemForm(false)}>
            ← Πίσω στο Έργο
          </button>
          <h2>{editingItem ? 'Επεξεργασία Στοιχείου' : 'Προσθήκη Νέου Στοιχείου'}</h2>
        </div>
        
        <ProjectItemForm
          onSubmit={editingItem ? handleUpdateItem : handleAddItem}
          onCancel={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
          initialData={editingItem}
          isEditing={!!editingItem}
        />
      </div>
    );
  }

  return (
    <div className="project-details">
      <div className="project-details-header">
        <button className="back-btn" onClick={onBack}>
          ← Πίσω στα Έργα
        </button>
        <div className="project-actions">
          {project.projectStage === 'Ολοκληρωμένο' ? (
            <button className="reopen-btn" onClick={onComplete}>
              🔄 Επανάνοιγμα Έργου
            </button>
          ) : (
            <button className="complete-btn" onClick={onComplete}>
              ✅ Ολοκλήρωση Έργου
            </button>
          )}
          <button className="edit-btn" onClick={onEdit}>
            ✏️ Επεξεργασία
          </button>
          <button className="delete-btn" onClick={onDelete}>
            🗑️ Διαγραφή
          </button>
        </div>
      </div>

      <div className="project-overview">
        <div className="project-header-info">
          <h1 className="project-title-details">{project.projectTitle}</h1>
          <span 
            className="project-stage-details"
            style={{ backgroundColor: getStageColor(project.projectStage) }}
          >
            {project.projectStage}
          </span>
        </div>

        <div className="project-info-grid">
          <div className="info-card">
            <h3>👤 Πελάτης</h3>
            <p>{project.client}</p>
          </div>
          
          <div className="info-card">
            <h3>📅 Ημερομηνίες</h3>
            <p>
              <strong>Έναρξη:</strong> {formatDate(project.startDate)}<br/>
              <strong>Λήξη:</strong> {formatDate(project.endDate)}
            </p>
          </div>
          
          <div className="info-card">
            <h3>👥 Συνεργάτες</h3>
            <div className="collaborators-list-details">
              {project.assignedCollaborators.map((collaborator, index) => (
                <span key={index} className="collaborator-tag-details">
                  {collaborator}
                </span>
              ))}
            </div>
          </div>

          {project.photos && project.photos.length > 0 && (
            <div className="info-card">
              <h3>📷 Φωτογραφίες Έργου</h3>
              <div className="project-photos-grid">
                {project.photos.map((photo, index) => (
                  <div key={index} className="photo-thumbnail-details">
                    <img src={photo.url} alt={photo.name} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="project-items-section">
        <div className="section-header">
          <h2>📋 Στοιχεία Έργου ({getFilteredItems().length})</h2>
          <button 
            className="add-item-btn"
            onClick={() => setShowItemForm(true)}
          >
            + Προσθήκη Στοιχείου
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="category-filter-bar">
          {categories.map(category => (
            <button
              key={category.value}
              className={`category-filter-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label.replace(/^.+ /, '')}</span>
              <span className="category-count">({getCategoryCount(category.value)})</span>
            </button>
          ))}
        </div>

        {!project.items || project.items.length === 0 ? (
          <div className="no-items">
            <div className="no-items-content">
              <span className="no-items-icon">📝</span>
              <h3>Δεν υπάρχουν στοιχεία</h3>
              <p>Προσθέστε μετρήσεις, παραγγελίες, φωτογραφίες και άλλα στοιχεία για αυτό το έργο</p>
              <button 
                className="add-first-item-btn"
                onClick={() => setShowItemForm(true)}
              >
                Προσθήκη Πρώτου Στοιχείου
              </button>
            </div>
          </div>
        ) : getFilteredItems().length === 0 ? (
          <div className="no-items">
            <div className="no-items-content">
              <span className="no-items-icon">🔍</span>
              <h3>Δεν βρέθηκαν στοιχεία</h3>
              <p>Δεν υπάρχουν στοιχεία για την επιλεγμένη κατηγορία</p>
              <button 
                className="add-first-item-btn"
                onClick={() => setShowItemForm(true)}
              >
                Προσθήκη Στοιχείου
              </button>
            </div>
          </div>
        ) : (
          <div className="project-items-grid">
            {getFilteredItems().map(item => (
              <ProjectItemCard
                key={item.id}
                item={item}
                onEdit={() => handleEditItem(item)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Notes */}
      <ProjectNotes 
        project={project}
        selectedNoteDate={selectedNoteDate}
        onUpdateProject={onUpdateProject}
        onClearSelectedNoteDate={onClearSelectedNoteDate}
      />
    </div>
  );
};

export default ProjectDetails;
