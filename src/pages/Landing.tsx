import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Shield, Star, Users, Clock, Verified, Smartphone, Info } from "lucide-react";
import logo from "@/assets/iskxhand-logo.png";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Student Community",
      description: "Connect with verified UPLB students for trusted errand assistance"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safe & Secure",
      description: "Campus-specific verification and safety features for every transaction"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Rating System",
      description: "Build trust through transparent ratings and reviews"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Quick Matching",
      description: "Fast and easy task matching with real-time updates"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Account",
      description: "Sign up with your UPLB student credentials"
    },
    {
      step: "2",
      title: "Post or Pick Tasks",
      description: "Either post an errand you need help with or browse available tasks"
    },
    {
      step: "3",
      title: "Connect & Complete",
      description: "Match with helpers, communicate securely, and handle payments"
    },
    {
      step: "4",
      title: "Rate & Review",
      description: "Leave feedback to build trust in the community"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#550000] via-[#550000] to-[#440000]">
      {/* Header */}
      <header className="border-b border-white/20 bg-[#550000]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ISKXHand Logo" className="h-12 w-12 rounded-xl" />
            <h1 className="text-2xl font-bold text-white">
              ISKXHand
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/about")}
              className="text-white hover:bg-white/20"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-white text-[#550000] hover:bg-white/90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 mb-6">
            <Verified className="h-4 w-4" />
            <span className="text-sm font-medium">For UPLB Students</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Your Campus{" "}
            <span className="text-green-400">
              Helping Hand
            </span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Turn everyday errands into opportunities. ISKXHand connects UPLB students 
            who need help with those ready to assist—safely and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              className="bg-white text-[#550000] hover:bg-white/90 shadow-lg"
            >
              Start Helping Today
            </Button>
            <Button 
              onClick={() => navigate("/install")} 
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 gap-2"
            >
              <Smartphone className="h-5 w-5" />
              Install App
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Choose ISKXHand?</h3>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Built specifically for the UPLB community with safety and trust at its core
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-white/20 bg-white/10 backdrop-blur-sm"
            >
              <div className="h-12 w-12 rounded-lg bg-white/20 text-white flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h4 className="font-semibold text-lg mb-2 text-white">{feature.title}</h4>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h3>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Four simple steps to start helping or getting help
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {howItWorks.map((item, index) => (
            <div key={index} className="text-center relative">
              <div className="h-16 w-16 rounded-full bg-white text-[#550000] flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                {item.step}
              </div>
              <h4 className="font-semibold text-lg mb-2 text-white">{item.title}</h4>
              <p className="text-white/70 text-sm">{item.description}</p>
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-white/30" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-white/10 backdrop-blur-sm border-white/20">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Get Started?
          </h3>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join the ISKXHand community today and experience campus life made easier
          </p>
          <Button 
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-white text-[#550000] hover:bg-white/90 shadow-lg"
          >
            Create Your Account
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-[#440000] py-8">
        <div className="container mx-auto px-4 text-center text-white/70">
          <p className="mb-2">© 2025 ISKXHand. Made for UPLB iskolar.</p>
          <p className="text-sm">A helping hand platform for the UP Los Baños community</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
