import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MapPin, Car, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import GoogleSignIn from './GoogleSignIn';
import TestComponent from './TestComponent';

const AuthScreen = () => {
  console.log('🔍 AuthScreen component is rendering!');
  
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, googleLogin } = useAuth();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(registerForm.email, registerForm.password, registerForm.name);
      if (result.success) {
        toast({
          title: "Account created!",
          description: "Welcome to Business Trip Tracker.",
        });
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        toast({
          title: "Welcome!",
          description: "You've been successfully signed in with Google.",
        });
      } else {
        toast({
          title: "Google authentication failed",
          description: result.error || "Failed to authenticate with Google",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during Google authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Authentication cancelled",
      description: "Google sign-in was cancelled or failed",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-success/5">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center glass-card">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Trip Tracker</h1>
            <p className="text-muted-foreground mt-2">Professional expense tracking for company travel</p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-success/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-success" />
            </div>
            <p className="text-xs text-muted-foreground">GPS Tracking</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Trip Management</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground">Expense Reports</p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="glass-card border-card-border">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      className="bg-background/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      className="bg-background/80"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient-primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  {/* Debug: Check if this section renders */}
                  <div style={{border: '2px solid red', padding: '10px', background: 'yellow'}}>
                    <div>🔍 DEBUG: Sign In GoogleSignIn Section</div>
                    <TestComponent />
                    <GoogleSignIn
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      text="signin_with"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Create account</CardTitle>
                <CardDescription className="text-center">
                  Get started with professional trip tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                      className="bg-background/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@company.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                      className="bg-background/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      className="bg-background/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                      className="bg-background/80"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient-primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  {/* Debug: Check if this section renders */}
                  <div style={{border: '2px solid blue', padding: '10px', background: 'lightblue'}}>
                    <div>🔍 DEBUG: Sign Up GoogleSignIn Section</div>
                    <TestComponent />
                    <GoogleSignIn
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      text="signup_with"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthScreen;