import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EnhancedLandingPage from '@/components/EnhancedLandingPage';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showLanding, setShowLanding] = useState(true);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-success/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center glass-card animate-pulse">
            <div className="w-8 h-8 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading Business Trip Tracker...</p>
        </div>
      </div>
    );
  }

  // Show enhanced landing page first, then auth
  if (showLanding && !isAuthenticated) {
    return <EnhancedLandingPage onGetStarted={() => navigate('/signin')} />;
  }

  // If not authenticated and not showing landing page, redirect to signin
  if (!isAuthenticated) {
    navigate('/signin');
    return null;
  }
  
  return null;
};

export default Index;
