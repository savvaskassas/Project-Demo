# Project Form Component

Ένα React component για τη διαχείριση έργων με όλα τα απαραίτητα πεδία.

## Χαρακτηριστικά

- **Τίτλος Έργου**: Υποχρεωτικό πεδίο για τον τίτλο του έργου
- **Πελάτης**: Υποχρεωτικό πεδίο για το όνομα του πελάτη
- **Ημερομηνίες**: Ημερομηνία έναρξης και λήξης με επικύρωση
- **Συνεργάτες**: Δυναμική προσθήκη και αφαίρεση συνεργατών
- **Στάδια Έργου**: Dropdown με προκαθορισμένα στάδια
- **Upload Φωτογραφιών**: Προεπισκόπηση και διαχείριση εικόνων
- **Επικύρωση**: Πλήρη επικύρωση φόρμας με μηνύματα σφάλματος
- **Responsive Design**: Λειτουργεί σε όλες τις συσκευές

## Πώς να ξεκινήσετε

1. **Εγκαταστήστε τις εξαρτήσεις:**
   ```bash
   npm install
   ```

2. **Ξεκινήστε την εφαρμογή:**
   ```bash
   npm start
   ```

3. **Ανοίξτε τον browser στο:** http://localhost:3000

## Χρήση του Component

```jsx
import React from 'react';
import ProjectForm from './components/ProjectForm';

function App() {
  const handleProjectSubmit = (projectData) => {
    console.log('Δεδομένα έργου:', projectData);
    // Εδώ μπορείτε να προσθέσετε τη λογική για αποθήκευση
  };

  return (
    <div className="App">
      <ProjectForm onSubmit={handleProjectSubmit} />
    </div>
  );
}
```

## Δομή Δεδομένων

Τα δεδομένα που επιστρέφει η φόρμα έχουν την ακόλουθη δομή:

```javascript
{
  projectTitle: "Τίτλος Έργου",
  client: "Όνομα Πελάτη",
  startDate: "2023-01-01",
  endDate: "2023-12-31",
  assignedCollaborators: ["Συνεργάτης 1", "Συνεργάτης 2"],
  projectStage: "Ανάπτυξη",
  photos: [
    {
      file: File,
      url: "data:image/...",
      name: "photo1.jpg"
    }
  ]
}
```

## Στάδια Έργου

Τα προκαθορισμένα στάδια έργου είναι:
- Προγραμματισμός
- Ανάλυση Απαιτήσεων
- Σχεδιασμός
- Ανάπτυξη
- Δοκιμές
- Παράδοση
- Συντήρηση

## Ενσωμάτωση με Firebase

Για να συνδέσετε το component με Firebase:

1. **Εγκαταστήστε τις Firebase εξαρτήσεις** (ήδη εγκατεστημένες):
   ```bash
   npm install firebase
   ```

2. **Ρυθμίστε το Firebase config** στο `src/App.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

3. **Uncomment τον κώδικα Firebase** στο `src/App.js` για:
   - Upload φωτογραφιών στο Storage
   - Αποθήκευση δεδομένων στο Firestore

## Δημιουργία PDF

Το project περιλαμβάνει το jsPDF για τη δημιουργία αναφορών PDF. Uncomment τον σχετικό κώδικα στο `src/App.js` για να ενεργοποιήσετε αυτή τη λειτουργία.

## Αρχεία Έργου

```
src/
├── components/
│   ├── ProjectForm.jsx      # Κύριο component
│   └── ProjectForm.css      # Styling
├── App.js                   # Κύρια εφαρμογή
├── index.js                 # Entry point
└── index.css               # Global styles
```

## Προσαρμογή

Μπορείτε εύκολα να προσαρμόσετε:
- Τα στάδια έργου στο `projectStages` array
- Τα στυλ στο `ProjectForm.css`
- Τη λογική επικύρωσης στη function `validateForm`
- Τα μηνύματα σφάλματος

## Εξαρτήσεις

- React 18.2.0
- React Scripts 5.0.1
- Firebase 12.0.0
- jsPDF 3.0.1

## Άδεια

Αυτό το project είναι ελεύθερο για χρήση και τροποποίηση.
