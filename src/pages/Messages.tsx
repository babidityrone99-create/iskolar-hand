import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import logo from "@/assets/iskxhand-logo.png";

interface Conversation {
  id: string;
  errand_id: string;
  poster_id: string;
  helper_id: string;
  created_at: string;
  updated_at: string;
  errand_title?: string;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_time?: string;
}

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      fetchConversations(session.user.id);
    };

    checkUser();
  }, [navigate]);

  const fetchConversations = async (currentUserId: string) => {
    setLoading(true);
    
    const { data: conversationsData, error } = await supabase
      .from("conversations")
      .select(`
        *,
        errands (title),
        messages (content, created_at)
      `)
      .or(`poster_id.eq.${currentUserId},helper_id.eq.${currentUserId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
      return;
    }

    const conversationsWithDetails = await Promise.all(
      conversationsData.map(async (conv: any) => {
        const otherUserId = conv.poster_id === currentUserId ? conv.helper_id : conv.poster_id;
        
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", otherUserId)
          .single();

        const messages = conv.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        return {
          ...conv,
          errand_title: conv.errands?.title,
          other_user_name: profileData?.display_name || "Unknown User",
          other_user_avatar: profileData?.avatar_url,
          last_message: lastMessage?.content,
          last_message_time: lastMessage?.created_at,
        };
      })
    );

    setConversations(conversationsWithDetails);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ISKXHand" className="h-8 w-8" />
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Accept an errand to start chatting
              </p>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate(`/chat/${conversation.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={conversation.other_user_avatar} />
                    <AvatarFallback>
                      {conversation.other_user_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {conversation.other_user_name}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {conversation.errand_title}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {conversation.last_message && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message}
                  </p>
                  {conversation.last_message_time && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conversation.last_message_time).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Messages;
