import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MapPin, Clock, User, LogOut, UserCircle } from "lucide-react";

const Errands = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptedErrands, setAcceptedErrands] = useState<number[]>([]);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const handleAcceptErrand = (errandId: number, errandTitle: string) => {
    setAcceptedErrands([...acceptedErrands, errandId]);
    toast({
      title: "Errand Accepted!",
      description: `You've accepted: ${errandTitle}`,
    });
  };

  // Sample errands data (will be replaced with real database data)
  const sampleErrands = [
    {
      id: 1,
      title: "Pick up documents from Registrar",
      description: "Need someone to get my transcript of records. Will pay ₱100.",
      location: "Main Building",
      timePosted: "2 hours ago",
      budget: "₱100",
      category: "Documents",
      poster: "Maria Santos"
    },
    {
      id: 2,
      title: "Food delivery from Freedom Wall area",
      description: "Please deliver food from area near Freedom Wall to my dorm. Thanks!",
      location: "Freedom Wall to Molave",
      timePosted: "5 hours ago",
      budget: "₱80",
      category: "Delivery",
      poster: "Juan Cruz"
    },
    {
      id: 3,
      title: "Buy textbook from University Bookstore",
      description: "Looking for someone to buy a specific textbook. Will reimburse cost + ₱150 service fee.",
      location: "UPLB Bookstore",
      timePosted: "1 day ago",
      budget: "₱150",
      category: "Shopping",
      poster: "Ana Reyes"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">IX</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ISKXHand
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <UserCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Create Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search errands..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => navigate("/post-errand")}
            className="bg-primary hover:bg-primary-light"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post Errand
          </Button>
        </div>

        {/* Errands Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Available Errands</h2>
          {sampleErrands.map((errand) => (
            <Card key={errand.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{errand.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Posted by {errand.poster} • {errand.timePosted}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{errand.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {errand.location}
                    </Badge>
                    <Badge variant="outline">{errand.category}</Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 md:text-right">
                  <div className="text-2xl font-bold text-primary">{errand.budget}</div>
                  <Button 
                    size="sm" 
                    className="bg-accent hover:bg-accent-light"
                    onClick={() => handleAcceptErrand(errand.id, errand.title)}
                    disabled={acceptedErrands.includes(errand.id)}
                  >
                    {acceptedErrands.includes(errand.id) ? "Accepted ✓" : "Accept Errand"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {sampleErrands.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No errands available at the moment</p>
            <Button onClick={() => navigate("/post-errand")} className="bg-primary hover:bg-primary-light">
              Be the first to post an errand
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Errands;
