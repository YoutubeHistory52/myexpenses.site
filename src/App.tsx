/**
 * Main App Component - Expense Tracker Application
 * 
 * This component serves as the main entry point for the application.
 * It handles:
 * - User authentication state management
 * - Conditional rendering based on auth status
 * - Email verification callback detection and handling
 * - Navigation between Auth, Email Verification, and Dashboard views
 * 
 * Routes:
 * - /: Shows Auth component for login/signup
 * - /#type=recovery: Shows EmailVerification component
 * - authenticated: Shows Dashboard component
 */

import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Toaster } from 'react-hot-toast';
import { EmailVerification } from './components/EmailVerification';

function App() {
  const { user, loading } = useAuth();
    // State to track if email verification callback is being processed
    /**
   * Effect: Detect email verification callback
   * Runs once on component mount to check if the URL contains the email verification token
   * This happens when user clicks the verification link from their email
   */
    // When URL contains type=recovery, this is set to true to show verification screen
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  useEffect(() => {
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
