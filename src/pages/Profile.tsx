import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Star, CheckCircle, Award, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import logo from "@/assets/iskxhand-logo.png";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        
        // Fetch profile data including avatar
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
    };
    getUser();
  }, [navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Sample stats (will be replaced with real data)
  const stats = {
    completedErrands: 12,
    rating: 4.8,
    totalReviews: 10,
    trustScore: 95
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ISKXHand Logo" className="h-12 w-12 rounded-xl" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ISKXHand
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/errands")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Errands
        </Button>

        <Card className="p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url} alt="Profile picture" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-4xl font-bold text-primary-foreground">
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold">
                  {user?.user_metadata?.full_name || "Student"}
                </h2>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{user?.email}</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{stats.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">
                    ({stats.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  <span className="font-semibold">{stats.trustScore}%</span>
                  <span className="text-muted-foreground text-sm">Trust Score</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Activity Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed Errands</span>
                <span className="text-2xl font-bold text-primary">{stats.completedErrands}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Posted Errands</span>
                <span className="text-2xl font-bold text-accent">5</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">My Balance</h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-2">
                <span className="text-4xl font-bold text-primary">₱1,250.00</span>
                <span className="text-sm text-muted-foreground mt-1">Philippine Peso</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Badges Earned</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  🎯
                </div>
                <span className="text-xs text-center">First Errand</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  ⭐
                </div>
                <span className="text-xs text-center">5-Star Helper</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  🔒
                </div>
                <span className="text-xs text-center">Locked</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">by Juan Cruz</span>
              </div>
              <p className="text-sm">Very reliable and fast! Highly recommended.</p>
            </div>
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                  <Star className="h-4 w-4 text-gray-300" />
                </div>
                <span className="text-sm text-muted-foreground">by Maria Santos</span>
              </div>
              <p className="text-sm">Good service, just a bit late. Overall satisfied.</p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
