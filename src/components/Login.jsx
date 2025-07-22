import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@yalodinamiki.gr', name: 'Διαχειριστής' },
    { email: 'user1@yalodinamiki.gr', name: 'Ιωάννης Παπαδόπουλος' },
    { email: 'user2@yalodinamiki.gr', name: 'Μαρία Γεωργίου' },
    { email: 'user3@yalodinamiki.gr', name: 'Δημήτρης Κωνσταντίνου' }
  ];

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123456');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-form-container">
          <div className="company-logo-login">
            <div className="logo-circle-login">
              <span className="logo-text-top-login">ΥΑΛΟΔΥΝΑΜΙΚΗ</span>
              <span className="logo-text-bottom-login">ΡΟΔΟΥ</span>
              <span className="logo-k-login">K</span>
            </div>
            <h1>ΥΑΛΟΔΥΝΑΜΙΚΗ ΡΟΔΟΥ</h1>
            <p>Σύστημα Διαχείρισης Έργων</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <h2>Σύνδεση στο Σύστημα</h2>
            
            {error && <div className="error-message-login">{error}</div>}
            
            <div className="form-group-login">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="username@yalodinamiki.gr"
              />
            </div>

            <div className="form-group-login">
              <label htmlFor="password">Κωδικός Πρόσβασης</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Εισάγετε τον κωδικό σας"
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Σύνδεση...' : 'Σύνδεση'}
            </button>
          </form>

          <div className="demo-accounts">
            <h3>Demo Λογαριασμοί</h3>
            <p>Κλικ για αυτόματη συμπλήρωση (κωδικός: 123456)</p>
            <div className="demo-buttons">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  type="button"
                  className="demo-btn"
                  onClick={() => fillDemoAccount(account.email)}
                >
                  {account.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
