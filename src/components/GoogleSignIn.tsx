import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// Declare google types
declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

interface GoogleSignInProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  width?: number;
  className?: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  width = 250,
  className = ''
}) => {
  console.log('🚀 GoogleSignIn component is rendering!', { text, className });
  
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualOAuth = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline`;
    
    console.log('Opening manual OAuth flow:', authUrl);
    window.open(authUrl, '_blank', 'width=500,height=600');
  }, []);

  const handleGoogleSignIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      setError('Google Client ID not configured');
      return;
    }

    if (!window.google?.accounts?.id) {
      setError('Google Sign-In not available');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onSuccess,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Use prompt instead of renderButton to avoid DOM conflicts
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.log('Google prompt not displayed:', reason);
          
          if (reason === 'unregistered_origin') {
            setError(`Origin not registered. Current origin: ${window.location.origin}`);
          } else {
            setError(`Google Sign-In unavailable: ${reason}`);
          }
        }
      });
    } catch (err: any) {
      console.error('Error with Google Sign-In:', err);
      const msg = err?.message || 'Google Sign-In failed';
      setError(String(msg));
      onError?.();
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      setError('Google Client ID not configured');
      return;
    }

    // Check if Google is loaded
    const checkGoogle = () => {
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
        setError(null);
      } else {
        setTimeout(checkGoogle, 500);
      }
    };

    checkGoogle();
  }, []);

  const handleFallbackClick = () => {
    handleGoogleSignIn();
  };

  return (
    <div className={className}>
      {/* Debug info */}
      <div style={{fontSize: '12px', color: '#666', marginBottom: '5px', textAlign: 'center'}}>
        🔍 Google: {isGoogleLoaded ? '✅ Loaded' : '⏳ Loading...'} | 
        Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅' : '❌'} | 
        Origin: {window.location.origin}
      </div>
      
      {error && (
        <div style={{fontSize: '11px', color: 'red', marginBottom: '10px', textAlign: 'center', padding: '5px', background: '#ffeaea', borderRadius: '4px'}}>
          ❌ {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleManualOAuth}
          disabled={false}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
        
        {error && error.includes('Origin not registered') && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full text-xs"
            onClick={handleManualOAuth}
          >
            🔄 Try Manual OAuth (Popup)
          </Button>
        )}
      </div>
    </div>
  );
};

export default GoogleSignIn;