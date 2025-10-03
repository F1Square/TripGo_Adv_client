import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Car, 
  TrendingUp, 
  Shield, 
  Clock, 
  FileText, 
  Smartphone, 
  Zap,
  Twitter,
  ArrowRight,
  CheckCircle,
  Play,
  Star,
  Users,
  Award,
  Globe
} from 'lucide-react';
import heroImage from '@/assets/hero-business-tracking.jpg';
import expenseDashboard from '@/assets/expense-dashboard.jpg';
import gpsTrackingPhone from '@/assets/gps-tracking-phone.jpg';

interface EnhancedLandingPageProps {
  onGetStarted: () => void;
}

const EnhancedLandingPage: React.FC<EnhancedLandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Real-time GPS Tracking",
      description: "Advanced location tracking with sub-meter accuracy",
      icon: MapPin,
      color: "from-primary to-primary-light",
      image: gpsTrackingPhone
    },
    {
      title: "Automated Expense Reports",
      description: "Professional CSV exports for seamless accounting",
      icon: FileText,
      color: "from-success to-success-light",
      image: expenseDashboard
    },
    {
      title: "Enterprise Analytics",
      description: "Comprehensive insights and trip analytics",
      icon: TrendingUp,
      color: "from-destructive to-accent",
      image: heroImage
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with 3D Background */}
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-success/5">
        {/* 3D Background - Replaced with gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-gradient-to-br from-primary/10 via-transparent to-success/10"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-destructive/20 to-transparent rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className={`space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-success/10 glass-card px-4 py-2 rounded-full">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Enterprise Grade Solution</span>
            </div>
            
            {/* Hero Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-foreground">Track Business</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent bg-300% animate-gradient">
                  Trips Seamlessly
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Revolutionary GPS tracking meets professional expense reporting. 
                The most advanced business trip tracker for modern enterprises.
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">50K+</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">2M+</div>
                <div className="text-sm text-muted-foreground">Trips Tracked</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={onGetStarted}
                variant="gradient-primary" 
                size="xl" 
                className="group shadow-depth hover:shadow-glass transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Trusted by 500+ Companies</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="relative glass-card p-8 rounded-3xl shadow-depth">
              <img 
                src={heroImage} 
                alt="Business professional tracking trips"
                className="w-full h-auto rounded-2xl shadow-smooth"
              />
              
              {/* Floating Feature Cards */}
              <div className="absolute -top-4 -left-4 glass-card p-4 rounded-2xl shadow-glass">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-success to-success-light rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-success-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Live Tracking</div>
                    <div className="text-xs text-muted-foreground">Real-time GPS</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 glass-card p-4 rounded-2xl shadow-glass">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">$12,450</div>
                    <div className="text-xs text-muted-foreground">Expenses Tracked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Features Section */}
      <div className="py-24 bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Powerful Features for Modern Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of business trip tracking with cutting-edge technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Feature Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-3xl shadow-depth">
                <img 
                  src={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  className="w-full h-96 object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Feature Navigation */}
              <div className="flex justify-center mt-8 space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeFeature 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Feature Content */}
            <div className="space-y-8 order-1 lg:order-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className={`transform transition-all duration-500 ${
                      index === activeFeature 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-4 opacity-50'
                    }`}
                  >
                    <Card className={`glass-card border-card-border overflow-hidden ${
                      index === activeFeature ? 'ring-2 ring-primary/20' : ''
                    }`}>
                      <CardContent className="p-8">
                        <div className="flex items-start space-x-4">
                          <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-foreground">
                              {feature.title}
                            </h3>
                            <p className="text-lg text-muted-foreground">
                              {feature.description}
                            </p>
                            {index === activeFeature && (
                              <div className="pt-4">
                                <Button variant="outline" size="sm" className="group">
                                  Learn More
                                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Grid */}
      <div className="py-24 bg-gradient-to-br from-muted/5 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Built for Enterprise Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: "Progressive Web App", desc: "Native app experience on any device", gradient: "from-primary to-primary-light" },
              { icon: Shield, title: "Enterprise Security", desc: "Bank-level encryption and compliance", gradient: "from-success to-success-light" },
              { icon: Clock, title: "Real-time Sync", desc: "Instant updates across all devices", gradient: "from-destructive to-accent" },
              { icon: FileText, title: "Smart Reports", desc: "AI-powered expense categorization", gradient: "from-accent to-primary" },
              { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed and performance", gradient: "from-primary-light to-success" },
              { icon: Globe, title: "Global Coverage", desc: "Works worldwide with offline support", gradient: "from-success-light to-destructive" }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass-card border-card-border hover-scale group overflow-hidden">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                    <div className="pt-2">
                      <CheckCircle className="w-6 h-6 text-success mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Call to Action with Twitter */}
      <div className="relative py-24 bg-gradient-to-r from-primary/10 via-background to-success/10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Business Travel?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who trust our platform for accurate, 
              efficient business trip tracking and expense reporting.
            </p>
          </div>
          
          <div className="space-y-8">
            <Button 
              onClick={onGetStarted}
              variant="gradient-primary" 
              size="xl" 
              className="group shadow-depth hover:shadow-glass transition-all duration-300 transform hover:scale-105"
            >
              <Play className="mr-3 w-6 h-6" />
              Start Your Free Trial Today
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="text-sm text-muted-foreground">
              No credit card required • 30-day free trial • Cancel anytime
            </div>
          </div>

          {/* Twitter Contact */}
          <div className="pt-12 border-t border-border/50">
            <a
              href="https://x.com/AbhiBhingradiya"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-8 rounded-3xl inline-block focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center">
                  <Twitter className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">Need Help? We're Excited to Assist! 🎉</div>
                  <div className="text-sm text-muted-foreground">
                    If you have any doubts and issues then ping on Twitter →
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLandingPage;