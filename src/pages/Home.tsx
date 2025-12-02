import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, MessageSquare, PlusCircle, TrendingUp, Info } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import logo from "@/assets/iskxhand-logo.png";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalErrands: 0,
    activeErrands: 0,
    completedErrands: 0,
    conversations: 0,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch user stats
      const userId = session.user.id;

      const [errandsResult, activeResult, completedResult, conversationsResult] = await Promise.all([
        supabase.from("errands").select("*", { count: "exact" }).eq("user_id", userId),
        supabase.from("errands").select("*", { count: "exact" }).eq("user_id", userId).eq("status", "in_progress"),
        supabase.from("errands").select("*", { count: "exact" }).eq("user_id", userId).eq("status", "completed"),
        supabase.from("conversations").select("*", { count: "exact" }).or(`poster_id.eq.${userId},helper_id.eq.${userId}`),
      ]);

      setStats({
        totalErrands: errandsResult.count || 0,
        activeErrands: activeResult.count || 0,
        completedErrands: completedResult.count || 0,
        conversations: conversationsResult.count || 0,
      });
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ISKXHand" className="h-8 w-8" />
            <h1 className="text-xl font-bold">ISKXHand</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/about")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Greeting Section */}
        <div className="rounded-lg p-6 text-white" style={{ backgroundColor: '#550000' }}>
          <h2 className="text-2xl font-bold">
            Kumusta ka {user?.user_metadata?.full_name?.split(' ')[0] || 'user'}?
          </h2>
          <p className="text-sm opacity-90 mt-1">Welcome back to ISKXHand</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">{stats.totalErrands}</CardTitle>
              <CardDescription>Total Errands</CardDescription>
            </CardHeader>
            <CardContent>
              <ListTodo className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">{stats.activeErrands}</CardTitle>
              <CardDescription>Active</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingUp className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">{stats.completedErrands}</CardTitle>
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">{stats.conversations}</CardTitle>
              <CardDescription>Messages</CardDescription>
            </CardHeader>
            <CardContent>
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate("/errands")} className="w-full" size="lg">
            <ListTodo className="mr-2 h-5 w-5" />
            Browse Errands
          </Button>

          <Button onClick={() => navigate("/post-errand")} variant="secondary" className="w-full" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Post New Errand
          </Button>

          <Button onClick={() => navigate("/messages")} variant="outline" className="w-full" size="lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            View Messages
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
