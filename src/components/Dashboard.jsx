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
        photos: [],
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
        photos: [],
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
        photos: [],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        items: []
      }
    ];
    setProjects(mockProjects);
  }, []);

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
    setProjects(projects.map(p => 
      p.id === updatedProject.id ? { ...updatedProject, updatedAt: new Date() } : p
    ));
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
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          projectStage: 'Ολοκληρωμένο',
          updatedAt: new Date()
        };
      }
      return project;
    });
    setProjects(updatedProjects);
    
    // Ενημέρωση του selectedProject αν είναι αυτό που ολοκληρώθηκε
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        projectStage: 'Ολοκληρωμένο'
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
              <h2>Έργα ({projects.length})</h2>
              <button 
                className="create-project-btn"
                onClick={() => setCurrentView('create')}
              >
                + Νέο Έργο
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="no-projects">
                <p>Δεν υπάρχουν έργα. Δημιουργήστε το πρώτο σας έργο!</p>
              </div>
            ) : (
              <div className="projects-list">
                {projects.map(project => (
                  <ProjectCard 
                    key={project.id}
                    project={project}
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentView('details');
                    }}
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
