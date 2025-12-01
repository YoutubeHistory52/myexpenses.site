import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Toaster } from 'react-hot-toast';
import { EmailVerification } from './components/EmailVerification';

function App() {
  const { user, loading } = useAuth();
  const [isVerifyingEmail, setIsVerifyingEmail] = React.useState(false);

  React.useEffect(() => {
    // Check if this is an email verification callback
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsVerifyingEmail(true);
    }
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

  return (
    <>
      if (isVerifyingEmail) return <EmailVerification />;
    <Toaster position="top-center" />
      {user ? <Dashboard /> : <Auth />}
    </>
  );
}

export default App;
