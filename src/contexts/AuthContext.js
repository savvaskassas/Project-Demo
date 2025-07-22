import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock users - στην πραγματικότητα θα έρχονται από Firebase
  const mockUsers = [
    { id: 1, email: 'admin@yalodinamiki.gr', password: '123456', name: 'Διαχειριστής Συστήματος', role: 'admin' },
    { id: 2, email: 'user1@yalodinamiki.gr', password: '123456', name: 'Ιωάννης Παπαδόπουλος', role: 'user' },
    { id: 3, email: 'user2@yalodinamiki.gr', password: '123456', name: 'Μαρία Γεωργίου', role: 'user' },
    { id: 4, email: 'user3@yalodinamiki.gr', password: '123456', name: 'Δημήτρης Κωνσταντίνου', role: 'user' }
  ];

  useEffect(() => {
    // Έλεγχος για saved session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData = { ...foundUser };
        delete userData.password; // Δεν αποθηκεύουμε τον κωδικό
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Λάθος email ή κωδικός πρόσβασης' };
      }
    } catch (error) {
      return { success: false, error: 'Σφάλμα κατά τη σύνδεση' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
