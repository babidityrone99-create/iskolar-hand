import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MapPin, Clock, User, LogOut, UserCircle } from "lucide-react";
import ErrandStatusBadge from "@/components/ErrandStatusBadge";
import ErrandStatusControl from "@/components/ErrandStatusControl";

const Errands = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptedErrands, setAcceptedErrands] = useState<string[]>([]);
  const [errands, setErrands] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  useEffect(() => {
    // Fetch errands from database
    const fetchErrands = async () => {
      const { data, error } = await supabase
        .from('errands')
        .select(`
          *,
          profiles (display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load errands",
          variant: "destructive",
        });
      } else {
        setErrands(data || []);
      }
    };

    if (user) {
      fetchErrands();
    }
  }, [user, toast]);

  const refetchErrands = async () => {
    const { data, error } = await supabase
      .from('errands')
      .select(`
        *,
        profiles (display_name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setErrands(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const handleAcceptErrand = async (errand: any) => {
    if (!user) return;

    try {
      // Ensure user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'Anonymous'
          });

        if (createProfileError) throw createProfileError;
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('errand_id', errand.id)
        .eq('helper_id', user.id)
        .maybeSingle();

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/chat/${existingConversation.id}`);
        return;
      }

      // Update errand with accepted_by
      const { error: updateError } = await supabase
        .from('errands')
        .update({ 
          accepted_by: user.id,
          status: 'in_progress'
        })
        .eq('id', errand.id);

      if (updateError) throw updateError;

      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          errand_id: errand.id,
          poster_id: errand.user_id,
          helper_id: user.id
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Send introduction message
      const helperName = profile?.display_name || user.email?.split('@')[0] || 'Anonymous';
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: newConversation.id,
          sender_id: user.id,
          content: `Hello! I am ${helperName}, the one who will do your errand. Let's discuss the details!`
        });

      if (messageError) throw messageError;

      setAcceptedErrands([...acceptedErrands, errand.id]);
      
      toast({
        title: "Errand Accepted!",
        description: `Starting chat for: ${errand.title}`,
      });

      // Navigate to chat
      navigate(`/chat/${newConversation.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filteredErrands = errands.filter(errand => {
    if (statusFilter !== 'all' && errand.status !== statusFilter) return false;
    if (searchQuery && !errand.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              onClick={() => navigate("/post-errand")}
              className="bg-primary hover:bg-primary-light"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post Errand
            </Button>
          </div>
        </div>

        {/* Errands Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Available Errands</h2>
          {filteredErrands.map((errand) => (
            <Card key={errand.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{errand.title}</h3>
                        <ErrandStatusControl
                          errandId={errand.id}
                          currentStatus={errand.status}
                          isOwner={errand.user_id === user?.id}
                          isHelper={errand.accepted_by === user?.id}
                          onStatusUpdate={refetchErrands}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Posted by {errand.profiles?.display_name || 'Anonymous'} • {getTimeAgo(errand.created_at)}
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
                    <ErrandStatusBadge status={errand.status} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 md:text-right">
                  <div className="text-2xl font-bold text-primary">₱{errand.budget}</div>
                  <Button 
                    size="sm" 
                    className="bg-accent hover:bg-accent-light"
                    onClick={() => handleAcceptErrand(errand)}
                    disabled={
                      acceptedErrands.includes(errand.id) || 
                      errand.user_id === user?.id ||
                      errand.status !== 'available'
                    }
                  >
                    {errand.user_id === user?.id 
                      ? "Your Errand" 
                      : errand.status !== 'available'
                        ? "Not Available"
                        : acceptedErrands.includes(errand.id) 
                          ? "Accepted ✓" 
                          : "Accept Errand"
                    }
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredErrands.length === 0 && (
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
