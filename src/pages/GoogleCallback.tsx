import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { googleLogin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Authentication failed",
          description: "Google authentication was cancelled or failed",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        toast({
          title: "Authentication failed",
          description: "No authorization code received from Google",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }

      try {
        // Send the authorization code to our backend using unified API client (/api base)
        const result = await apiService.post<{ token: string; user: any }>(
          '/auth/google/callback',
          { code }
        );

        if (result.success && result.data) {
          // Store the token and user data with consistent keys
          localStorage.setItem('trip_tracker_token', result.data.token);
          localStorage.setItem('trip_tracker_user', JSON.stringify(result.data.user));

          toast({
            title: 'Welcome!',
            description: 'Successfully signed in with Google',
          });

          navigate('/dashboard');
        } else {
          throw new Error(result.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('Error processing Google callback:', err);
        toast({
          title: "Authentication failed",
          description: "Failed to process Google authentication",
          variant: "destructive",
        });
        navigate('/signin');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Processing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;