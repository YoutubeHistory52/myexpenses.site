import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Toaster } from 'react-hot-toast';
import { ForgotPassword } from './components/ForgotPassword';
import { EmailVerification } from './components/EmailVerification';
import { ResetPassword } from './components/ResetPassword';

function App() {
  const { loading, user } = useAuth();

  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash);

  // Detect verification callback on first load
  useEffect(() => {
    if (window.location.hash.includes('code')) {
      setIsVerifyingEmail(true);
    }
  }, []);

  // Listen for hash changes (forgot/reset navigation)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isVerifyingEmail) {
    return <EmailVerification />;
  }

  return (
    <>
      <Toaster position="top-center" />

      {currentHash === '#/forgot-password' ? (
        <ForgotPassword onBack={() => (window.location.hash = '')} />
      ) : currentHash === '#/reset-password' ? (
        <ResetPassword />
      ) : user ? (
        <Dashboard />
      ) : (
        <Auth />
      )}
    </>
  );
}

export default App;
