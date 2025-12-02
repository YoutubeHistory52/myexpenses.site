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

  const getCurrentRoute = () => {
    // first check pathname (supports path-based redirects like /reset-password)
    const path = window.location.pathname;
    if (path === '/reset-password') return '#/reset-password'; // normalize to your existing checks
    if (path === '/email-verification') return '#/email-verification';

    // fallback: check hash (legacy)
    const hash = window.location.hash || '';
    if (hash) return hash;

    // also consider query params (supabase might return token & type as query on the hosted verify endpoint,
    // and then the redirect_to may come without hash; we already cover path above)
    return '';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getCurrentRoute());
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  useEffect(() => {
    // On first load, detect Supabase callback (the hosted verify link contains type=... and/or code)
    const href = window.location.href;
    // If Supabase appended something like ?type=recovery or ?type=signup&token=..., check for it:
    if (href.includes('type=') || href.includes('access_token') || href.includes('token=')) {
      // If the URL also contains path /reset-password or /email-verification, that will be handled by routing below.
      // For hosted verify flow, we may need to show EmailVerification.
      if (href.includes('type=signup') || href.includes('type=verify') || href.includes('type=magiclink')) {
        setIsVerifyingEmail(true);
      }
      if (href.includes('type=recovery')) {
        // If recovery type came directly to your origin (i.e. supabase used hosted verify then redirected to /),
        // the best path is to show ResetPassword if possible.
        // We'll let routing logic below show ResetPassword if the path is /reset-password.
      }
    }

    // set initial route normalized
    setCurrentRoute(getCurrentRoute());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onLocationChange = () => setCurrentRoute(getCurrentRoute());
    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
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

      {currentRoute === '#/forgot-password' ? (
        <ForgotPassword onBack={() => (window.location.hash = '')} />
      ) : currentRoute === '#/reset-password' ? (
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
