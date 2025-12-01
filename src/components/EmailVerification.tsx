/**
 * Email Verification Component
 * 
 * Displays the email verification status page after user clicks the verification link.
 * Handles three states:
 * 1. Verifying - Shows loading spinner while checking verification status
 * 2. Success - Shows success message with button to proceed to sign-in
 * 3. Error - Shows error message with recovery option
 * 
 * The component automatically checks the user's session status on mount
 * to determine if verification was successful. Once verified, user is
 * redirected to the sign-in page by clicking the button.
 */
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function EmailVerification() {

  // State: Tracks verification status (verifying, success, or error)
    /**
   * Effect: Verify email on component mount
   * - Calls Supabase to get current user session
   * - If session exists and user is authenticated, verification was successful
   * - Updates UI state accordingly (success, error, or verifying)
     // Redirect user to home (sign-in page) after email verification is complete
  // Uses window.location.href for page navigation
    */
  // State: Stores error message to display to user if verification fails
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setVerificationStatus('error');
          setErrorMessage('Failed to verify email. Please try again.');
          return;
        }

        if (session && session.user) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage('Email verification completed, but session not found. Please sign in.');
        }
      } catch (err) {
        setVerificationStatus('error');
        setErrorMessage('An error occurred during email verification.');
      }
    };

    verifyEmail();
  }, []);

  const handleSignIn = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {verificationStatus === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">Your email has been successfully verified. You can now sign in to your account.</p>
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}