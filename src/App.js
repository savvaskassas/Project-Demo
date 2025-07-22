import React, { useState } from 'react';
import ProjectForm from './components/ProjectForm';
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, addDoc } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Uncomment and configure when you want to connect to Firebase
/*
const firebaseConfig = {
  // Your Firebase configuration
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
*/

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleProjectSubmit = async (projectData) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      console.log('Δεδομένα έργου που υποβλήθηκε:', projectData);

      // Example of what you can do with the data:
      
      // 1. Upload photos to Firebase Storage
      /*
      const photoUrls = [];
      for (const photo of projectData.photos) {
        const photoRef = ref(storage, `project-photos/${Date.now()}_${photo.name}`);
        const snapshot = await uploadBytes(photoRef, photo.file);
        const url = await getDownloadURL(snapshot.ref);
        photoUrls.push({
          name: photo.name,
          url: url
        });
      }
      */

      // 2. Save project data to Firestore
      /*
      const projectDataForDB = {
        ...projectData,
        photos: photoUrls, // Replace file objects with URLs
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'projects'), projectDataForDB);
      console.log('Document written with ID: ', docRef.id);
      */

      // 3. Generate PDF report using jsPDF
      /*
      import jsPDF from 'jspdf';
      
      const pdf = new jsPDF();
      pdf.text('Αναφορά Έργου', 20, 20);
      pdf.text(`Τίτλος: ${projectData.projectTitle}`, 20, 40);
      pdf.text(`Πελάτης: ${projectData.client}`, 20, 50);
      pdf.text(`Ημερομηνία Έναρξης: ${projectData.startDate}`, 20, 60);
      pdf.text(`Ημερομηνία Λήξης: ${projectData.endDate}`, 20, 70);
      pdf.text(`Στάδιο: ${projectData.projectStage}`, 20, 80);
      pdf.text(`Συνεργάτες: ${projectData.assignedCollaborators.join(', ')}`, 20, 90);
      
      pdf.save(`project-${projectData.projectTitle}.pdf`);
      */

      // For now, just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitMessage('Το έργο αποθηκεύτηκε επιτυχώς!');
      
    } catch (error) {
      console.error('Σφάλμα κατά την αποθήκευση:', error);
      setSubmitMessage('Σφάλμα κατά την αποθήκευση του έργου. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Σύστημα Διαχείρισης Έργων</h1>
        <p>Δημιουργήστε και διαχειριστείτε τα έργα σας</p>
      </header>

      <ProjectForm onSubmit={handleProjectSubmit} />

      {isSubmitting && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Αποθήκευση έργου...</p>
        </div>
      )}

      {submitMessage && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          padding: '10px',
          backgroundColor: submitMessage.includes('επιτυχώς') ? '#d4edda' : '#f8d7da',
          color: submitMessage.includes('επιτυχώς') ? '#155724' : '#721c24',
          borderRadius: '5px',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <p>{submitMessage}</p>
        </div>
      )}
    </div>
  );
}

export default App;
