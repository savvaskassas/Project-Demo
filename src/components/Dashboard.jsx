import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProjectForm from './ProjectForm';
import ProjectCard from './ProjectCard';
import ProjectDetails from './ProjectDetails';
import Header from './Header';
import ProjectOverview from './ProjectOverview';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedNoteDate, setSelectedNoteDate] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [isCompactView, setIsCompactView] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  // Νέα φίλτρα για μεγάλο όγκο δεδομένων
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCollaborator, setSelectedCollaborator] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Φόρτωση δεδομένων από localStorage ή χρήση mock data
  useEffect(() => {
    const savedProjects = localStorage.getItem('projectManagementData');
    
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        return;
      } catch (error) {
        console.error('Σφάλμα κατά τη φόρτωση δεδομένων:', error);
      }
    }
    
    // Mock data για τα έργα (μόνο αν δεν υπάρχουν αποθηκευμένα δεδομένα)
    const mockProjects = [
      {
        id: 1,
        projectTitle: 'Εγκατάσταση Υαλοπινάκων Δημαρχείου',
        client: 'Δήμος Ρόδου',
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        assignedCollaborators: ['Ιωάννης Παπαδόπουλος', 'Μαρία Γεωργίου'],
        projectStage: 'Ανάπτυξη',
        photos: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        items: [
          {
            id: 1,
            type: 'measurement',
            title: 'Μέτρηση Κεντρικής Εισόδου',
            client: 'Δήμος Ρόδου',
            date: '2024-01-20',
            startEndDates: '2024-01-20 - 2024-01-25',
            stage: 'Μέτρηση',
            photos: [],
            measurements: { width: '3.5m', height: '2.8m', area: '9.8m²' }
          },
          {
            id: 2,
            type: 'delivery',
            title: 'Παραγγελία Υαλοπινάκων',
            client: 'Δήμος Ρόδου',
            date: '2024-02-01',
            startEndDates: '2024-02-01 - 2024-02-10',
            stage: 'Παραγγελία',
            photos: [],
            deliveryDetails: { quantity: '15 τεμάχια', type: 'Διπλό Τζάμι 6mm' }
          }
        ]
      },
      {
        id: 2,
        projectTitle: 'Ανακαίνιση Βιτρινών Καταστήματος',
        client: 'Εμπορικό Κέντρο Ρόδου',
        startDate: '2024-02-01',
        endDate: '2024-04-15',
        assignedCollaborators: ['Δημήτρης Κωνσταντίνου'],
        projectStage: 'Σχεδιασμός',
        photos: [
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
        ],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        items: []
      },
      {
        id: 3,
        projectTitle: 'Εγκατάσταση Αλουμινίων Κατοικίας',
        client: 'Ιδιώτης - Κ. Αντωνίου',
        startDate: '2024-03-01',
        endDate: '2024-05-30',
        assignedCollaborators: ['Ιωάννης Παπαδόπουλος', 'Μαρία Γεωργίου', 'Δημήτρης Κωνσταντίνου'],
        projectStage: 'Προγραμματισμός',
        photos: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
        ],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        items: []
      }
    ];
    setProjects(mockProjects);
  }, []);

  // Αποθήκευση δεδομένων στο localStorage όταν αλλάζουν τα projects
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projectManagementData', JSON.stringify(projects));
      console.log('💾 Δεδομένα αποθηκεύτηκαν στο localStorage:', {
        projectsCount: projects.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [projects]);

  // Προχωρημένο φιλτράρισμα και ταξινόμηση για μεγάλο όγκο δεδομένων
  const filteredProjects = React.useMemo(() => {
    let filtered = [...projects];

    // Φιλτράρισμα κειμένου
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.projectTitle.toLowerCase().includes(searchLower) ||
        project.client.toLowerCase().includes(searchLower) ||
        project.projectStage.toLowerCase().includes(searchLower) ||
        project.assignedCollaborators?.some(collaborator => 
          collaborator.toLowerCase().includes(searchLower)
        )
      );
    }

    // Φιλτράρισμα κατά κατάσταση
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => {
        switch (selectedStatus) {
          case 'active':
            return project.projectStage !== 'Ολοκληρωμένο' && project.projectStage !== 'Ακυρωμένο';
          case 'completed':
            return project.projectStage === 'Ολοκληρωμένο';
          case 'planning':
            return ['Προγραμματισμός', 'Σχεδιασμός'].includes(project.projectStage);
          case 'development':
            return ['Ανάπτυξη', 'Εγκατάσταση'].includes(project.projectStage);
          case 'overdue':
            const today = new Date();
            const endDate = new Date(project.endDate);
            return endDate < today && project.projectStage !== 'Ολοκληρωμένο';
          default:
            return true;
        }
      });
    }

    // Φιλτράρισμα κατά συνεργάτη
    if (selectedCollaborator !== 'all') {
      filtered = filtered.filter(project => 
        project.assignedCollaborators?.includes(selectedCollaborator)
      );
    }

    // Φιλτράρισμα ημερομηνιών
    if (dateFilter.start) {
      filtered = filtered.filter(project => 
        new Date(project.startDate) >= new Date(dateFilter.start)
      );
    }
    if (dateFilter.end) {
      filtered = filtered.filter(project => 
        new Date(project.endDate) <= new Date(dateFilter.end)
      );
    }

    // Ταξινόμηση
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'title':
          aValue = a.projectTitle.toLowerCase();
          bValue = b.projectTitle.toLowerCase();
          break;
        case 'client':
          aValue = a.client.toLowerCase();
          bValue = b.client.toLowerCase();
          break;
        case 'status':
          aValue = a.projectStage;
          bValue = b.projectStage;
          break;
        case 'updated':
          aValue = new Date(a.updatedAt || a.startDate);
          bValue = new Date(b.updatedAt || b.startDate);
          break;
        default:
          aValue = a.startDate;
          bValue = b.startDate;
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, searchTerm, selectedStatus, selectedCollaborator, dateFilter, sortBy, sortOrder]);

  // Δημιουργία λιστών για dropdowns
  const allCollaborators = React.useMemo(() => {
    const collaborators = new Set();
    projects.forEach(project => {
      project.assignedCollaborators?.forEach(collaborator => {
        collaborators.add(collaborator);
      });
    });
    return Array.from(collaborators).sort();
  }, [projects]);

  const handleCreateProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: projects.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: []
    };
    setProjects([...projects, newProject]);
    setCurrentView('projects');
  };

  const handleUpdateProject = (updatedProject) => {
    console.log('Updating project:', updatedProject); // Debug log
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? { ...updatedProject, updatedAt: new Date() } : p
    );
    setProjects(updatedProjects);
    
    // Ενημέρωση του selectedProject αν είναι αυτό που επεξεργάστηκε
    if (selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject({ ...updatedProject, updatedAt: new Date() });
    }
    
    setEditingProject(null);
    setCurrentView('projects');
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε αυτό το έργο;')) {
      setProjects(projects.filter(p => p.id !== projectId));
      setSelectedProject(null);
      setCurrentView('projects');
    }
  };

  const handleCompleteProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    const newStage = project.projectStage === 'Ολοκληρωμένο' ? 'Παράδοση' : 'Ολοκληρωμένο';
    
    const updatedProjects = projects.map(proj => {
      if (proj.id === projectId) {
        return {
          ...proj,
          projectStage: newStage,
          updatedAt: new Date()
        };
      }
      return proj;
    });
    setProjects(updatedProjects);
    
    // Ενημέρωση του selectedProject αν είναι αυτό που αλλάζει
    if (selectedProject && selectedProject.id === projectId) {
      const updatedSelectedProject = {
        ...selectedProject,
        projectStage: newStage
      };
      setSelectedProject(updatedSelectedProject);
    }
    
    // Ενημέρωση του editingProject αν είναι αυτό που αλλάζει
    if (editingProject && editingProject.id === projectId) {
      setEditingProject({
        ...editingProject,
        projectStage: newStage
      });
    }
  };

  const handleAddItemToProject = (projectId, itemData) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        // Δημιουργία μοναδικού ID για το νέο στοιχείο
        const timestamp = Date.now();
        const newItem = {
          ...itemData,
          id: `item-${timestamp}`,
          createdAt: new Date().toISOString(),
          projectId: projectId
        };
        
        console.log('📝 Προσθήκη νέου στοιχείου στο έργο:', {
          projectId,
          itemType: newItem.type,
          itemTitle: newItem.title,
          newItemId: newItem.id
        });
        
        return {
          ...project,
          items: [...(project.items || []), newItem],
          updatedAt: new Date()
        };
      }
      return project;
    });
    setProjects(updatedProjects);
    
    console.log('✅ Έργα ενημερώθηκαν στο Dashboard:', {
      totalProjects: updatedProjects.length,
      selectedProjectItems: updatedProjects.find(p => p.id === projectId)?.items?.length || 0
    });
  };

  const handleUpdateItem = (projectId, itemId, updatedItem) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          items: project.items?.map(item => 
            item.id === itemId ? { ...updatedItem, id: itemId } : item
          ) || [],
          updatedAt: new Date()
        };
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const handleDeleteItem = (projectId, itemId) => {
    if (window.confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε αυτό το στοιχείο;')) {
      const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            items: project.items?.filter(item => item.id !== itemId) || [],
            updatedAt: new Date()
          };
        }
        return project;
      });
      setProjects(updatedProjects);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return (
          <ProjectForm 
            onSubmit={handleCreateProject}
            onCancel={() => setCurrentView('projects')}
          />
        );
      case 'overview':
        return (
          <ProjectOverview projects={projects} />
        );
      case 'edit':
        return (
          <ProjectForm 
            onSubmit={handleUpdateProject}
            onCancel={() => {
              setEditingProject(null);
              setCurrentView('projects');
            }}
            initialData={editingProject}
            isEditing={true}
          />
        );
      case 'details':
        return selectedProject ? (
          <ProjectDetails 
            project={selectedProject}
            selectedNoteDate={selectedNoteDate}
            onBack={() => {
              setSelectedProject(null);
              setSelectedNoteDate(null);
              setCurrentView('projects');
            }}
            onEdit={() => {
              setEditingProject(selectedProject);
              setCurrentView('edit');
            }}
            onDelete={() => handleDeleteProject(selectedProject.id)}
            onComplete={() => handleCompleteProject(selectedProject.id)}
            onUpdateProject={(updatedProject) => {
              setProjects(projects.map(p => 
                p.id === updatedProject.id ? updatedProject : p
              ));
              setSelectedProject(updatedProject);
            }}
            onAddItem={(itemData) => handleAddItemToProject(selectedProject.id, itemData)}
            onUpdateItem={(itemId, updatedItem) => handleUpdateItem(selectedProject.id, itemId, updatedItem)}
            onDeleteItem={(itemId) => handleDeleteItem(selectedProject.id, itemId)}
            onClearSelectedNoteDate={() => setSelectedNoteDate(null)}
          />
        ) : null;
      default:
        return (
          <div className="projects-grid">
            <div className="projects-header">
              <h2>Έργα ({filteredProjects.length})</h2>
              <div className="header-controls">
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${isCompactView ? 'active' : ''}`}
                    onClick={() => setIsCompactView(true)}
                    title="Μικρές κάρτες"
                  >
                    ⊞
                  </button>
                  <button 
                    className={`view-btn ${!isCompactView ? 'active' : ''}`}
                    onClick={() => setIsCompactView(false)}
                    title="Μεγάλες κάρτες"
                  >
                    ⊟
                  </button>
                </div>
                <button 
                  className="create-project-btn"
                  onClick={() => setCurrentView('create')}
                >
                  + Νέο Έργο
                </button>
              </div>
            </div>
            
            <div className="advanced-filters">
              {/* Πρώτη σειρά φίλτρων */}
              <div className="filters-row primary">
                <div className="search-section">
                  <input
                    type="text"
                    placeholder="🔍 Αναζήτηση έργων (τίτλος, πελάτης, στάδιο, συνεργάτες)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input enhanced"
                  />
                </div>
                
                <div className="quick-filters">
                  <button 
                    className={`quick-filter-btn ${selectedStatus === 'active' ? 'active' : ''}`}
                    onClick={() => setSelectedStatus(selectedStatus === 'active' ? 'all' : 'active')}
                  >
                    🟢 Ενεργά ({projects.filter(p => p.projectStage !== 'Ολοκληρωμένο' && p.projectStage !== 'Ακυρωμένο').length})
                  </button>
                  <button 
                    className={`quick-filter-btn ${selectedStatus === 'completed' ? 'active' : ''}`}
                    onClick={() => setSelectedStatus(selectedStatus === 'completed' ? 'all' : 'completed')}
                  >
                    ✅ Ολοκληρωμένα ({projects.filter(p => p.projectStage === 'Ολοκληρωμένο').length})
                  </button>
                  <button 
                    className={`quick-filter-btn ${selectedStatus === 'overdue' ? 'active' : ''}`}
                    onClick={() => setSelectedStatus(selectedStatus === 'overdue' ? 'all' : 'overdue')}
                  >
                    ⚠️ Καθυστερημένα
                  </button>
                </div>
              </div>

              {/* Δεύτερη σειρά φίλτρων */}
              <div className="filters-row secondary">
                <div className="filter-group">
                  <label className="filter-label">Κατάσταση:</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Όλες οι καταστάσεις</option>
                    <option value="active">Ενεργά έργα</option>
                    <option value="completed">Ολοκληρωμένα</option>
                    <option value="planning">Σχεδιασμός</option>
                    <option value="development">Ανάπτυξη</option>
                    <option value="overdue">Καθυστερημένα</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Συνεργάτης:</label>
                  <select 
                    value={selectedCollaborator} 
                    onChange={(e) => setSelectedCollaborator(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Όλοι οι συνεργάτες</option>
                    {allCollaborators.map(collaborator => (
                      <option key={collaborator} value={collaborator}>
                        {collaborator}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Ταξινόμηση:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="date">Ημερομηνία Έναρξης</option>
                    <option value="updated">Τελευταία Ενημέρωση</option>
                    <option value="title">Όνομα Έργου</option>
                    <option value="client">Πελάτης</option>
                    <option value="status">Κατάσταση</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Σειρά:</label>
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="filter-select"
                  >
                    <option value="desc">Φθίνουσα</option>
                    <option value="asc">Αύξουσα</option>
                  </select>
                </div>

                <div className="date-range-group">
                  <div className="date-filter-group">
                    <label className="filter-label">Από:</label>
                    <input
                      type="date"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                      className="date-input"
                    />
                  </div>
                  <div className="date-filter-group">
                    <label className="filter-label">Έως:</label>
                    <input
                      type="date"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                      className="date-input"
                    />
                  </div>
                </div>

                <div className="filter-actions">
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('all');
                      setSelectedCollaborator('all');
                      setDateFilter({ start: '', end: '' });
                      setSortBy('date');
                      setSortOrder('desc');
                    }}
                  >
                    🗑️ Καθαρισμός
                  </button>
                </div>
              </div>

              {/* Αποτελέσματα φιλτραρίσματος */}
              {(searchTerm || selectedStatus !== 'all' || selectedCollaborator !== 'all' || dateFilter.start || dateFilter.end) && (
                <div className="filter-results">
                  <span className="results-text">
                    Εμφάνιση {filteredProjects.length} από {projects.length} έργα
                  </span>
                  {filteredProjects.length === 0 && (
                    <span className="no-results">
                      Δεν βρέθηκαν έργα που να ταιριάζουν με τα κριτήρια
                    </span>
                  )}
                </div>
              )}
            </div>

            {filteredProjects.length === 0 ? (
              <div className="no-projects">
                <p>
                  {searchTerm || dateFilter.start || dateFilter.end 
                    ? 'Δεν βρέθηκαν έργα που να ταιριάζουν με τα κριτήρια αναζήτησης.' 
                    : 'Δεν υπάρχουν έργα. Δημιουργήστε το πρώτο σας έργο!'
                  }
                </p>
              </div>
            ) : (
              <div className={`projects-list ${isCompactView ? 'compact-view' : 'full-view'}`}>
                {filteredProjects.map(project => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    onClick={(proj, noteDate) => {
                      setSelectedProject(proj);
                      setSelectedNoteDate(noteDate || null);
                      setCurrentView('details');
                    }}
                    isCompact={isCompactView}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <Header user={user} onLogout={logout} />
      
      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={`nav-btn ${currentView === 'projects' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('projects');
              setSelectedProject(null);
              setEditingProject(null);
            }}
          >
            📋 Έργα
          </button>
          <button 
            className={`nav-btn ${currentView === 'create' ? 'active' : ''}`}
            onClick={() => setCurrentView('create')}
          >
            ➕ Νέο Έργο
          </button>
          <button 
            className={`nav-btn ${currentView === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('overview');
              setSelectedProject(null);
              setEditingProject(null);
            }}
          >
            📊 Επισκόπηση
          </button>
        </nav>

        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
