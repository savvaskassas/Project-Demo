import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProjectForm from './ProjectForm';
import ProjectCard from './ProjectCard';
import ProjectDetails from './ProjectDetails';
import Header from './Header';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [isCompactView, setIsCompactView] = useState(false);

  // Mock data για τα έργα
  useEffect(() => {
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

  // Φιλτράρισμα έργων βάσει αναζήτησης και ημερομηνιών
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectStage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.assignedCollaborators.some(collaborator => 
        collaborator.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDateFilter = 
      (dateFilter.start === '' || new Date(project.startDate) >= new Date(dateFilter.start)) &&
      (dateFilter.end === '' || new Date(project.endDate) <= new Date(dateFilter.end));

    return matchesSearch && matchesDateFilter;
  });

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
        const newItem = {
          ...itemData,
          id: (project.items?.length || 0) + 1
        };
        return {
          ...project,
          items: [...(project.items || []), newItem],
          updatedAt: new Date()
        };
      }
      return project;
    });
    setProjects(updatedProjects);
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
            onBack={() => {
              setSelectedProject(null);
              setCurrentView('projects');
            }}
            onEdit={() => {
              setEditingProject(selectedProject);
              setCurrentView('edit');
            }}
            onDelete={() => handleDeleteProject(selectedProject.id)}
            onComplete={() => handleCompleteProject(selectedProject.id)}
            onAddItem={(itemData) => handleAddItemToProject(selectedProject.id, itemData)}
            onUpdateItem={(itemId, updatedItem) => handleUpdateItem(selectedProject.id, itemId, updatedItem)}
            onDeleteItem={(itemId) => handleDeleteItem(selectedProject.id, itemId)}
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
            
            <div className="search-filters">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="🔍 Αναζήτηση έργων (τίτλος, πελάτης, στάδιο, συνεργάτες)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="date-filters">
                <div className="date-filter-group">
                  <label>Από:</label>
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                    className="date-input"
                  />
                </div>
                <div className="date-filter-group">
                  <label>Έως:</label>
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                    className="date-input"
                  />
                </div>
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter({ start: '', end: '' });
                  }}
                >
                  🗑️ Καθαρισμός
                </button>
              </div>
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
                    onClick={() => {
                      setSelectedProject(project);
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
        </nav>

        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
