import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectForm from './components/ProjectForm';
import ProjectDetails from './components/ProjectDetails';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Εγκατάσταση Υαλοπίνακα - Κέντρο Ρόδου',
      domain: 'Κατοικίες',
      description: 'Εγκατάσταση διπλών υαλοπινάκων σε νέο διαμέρισμα στο κέντρο της Ρόδου',
      createdAt: '2024-01-15',
      status: 'Σε εξέλιξη',
      priority: 'Υψηλή'
    },
    {
      id: 2,
      title: 'Συντήρηση Υαλοστασίων - Ξενοδοχείο',
      domain: 'Εμπορικά',
      description: 'Συντήρηση και αντικατάσταση υαλοστασίων σε ξενοδοχείο',
      createdAt: '2024-01-10',
      status: 'Ολοκληρωμένο',
      priority: 'Μεσαία'
    }
  ]);

  // If user is not logged in, show login page
  if (!user) {
    return <Login />;
  }

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Νέο'
    };
    setProjects([...projects, newProject]);
    setCurrentView('dashboard');
  };

  const updateProject = (updatedProject) => {
    setProjects(projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
    setEditingProject(null);
    setCurrentView('dashboard');
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'new-project':
        return (
          <ProjectForm
            onSubmit={addProject}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      case 'edit-project':
        return (
          <ProjectForm
            project={editingProject}
            onSubmit={updateProject}
            onCancel={() => {
              setEditingProject(null);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'project-details':
        return (
          <ProjectDetails
            project={selectedProject}
            onBack={() => {
              setSelectedProject(null);
              setCurrentView('dashboard');
            }}
            onEdit={() => {
              setEditingProject(selectedProject);
              setCurrentView('edit-project');
            }}
            onDelete={deleteProject}
          />
        );
      default:
        return (
          <Dashboard
            projects={projects}
            onNewProject={() => setCurrentView('new-project')}
            onViewProject={(project) => {
              setSelectedProject(project);
              setCurrentView('project-details');
            }}
            onEditProject={(project) => {
              setEditingProject(project);
              setCurrentView('edit-project');
            }}
            onDeleteProject={deleteProject}
          />
        );
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
