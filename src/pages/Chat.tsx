import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Chat = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setCurrentUserId(user.id);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const fetchConversation = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          errands (title),
          poster:profiles!conversations_poster_id_fkey (display_name),
          helper:profiles!conversations_helper_id_fkey (display_name)
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        });
        navigate("/errands");
      } else {
        setConversation(data);
      }
    };

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (display_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } else {
        setMessages(data || []);
      }
    };

    fetchConversation();
    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey (display_name)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, navigate, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !currentUserId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isOwnMessage = (senderId: string) => senderId === currentUserId;

  const handleSubmitReport = async () => {
    if (!reportReason || !conversationId || !conversation) return;

    setIsSubmittingReport(true);
    try {
      const reportedUserId = currentUserId === conversation.poster_id 
        ? conversation.helper_id 
        : conversation.poster_id;

      const { error } = await supabase
        .from('reports')
        .insert({
          conversation_id: conversationId,
          errand_id: conversation.errand_id,
          reporter_id: currentUserId,
          reported_user_id: reportedUserId,
          reason: reportReason,
          description: reportDescription || null
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted for review. We'll investigate this matter.",
      });

      // Reset form
      setReportReason("");
      setReportDescription("");
      setShowReportDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/errands")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {conversation?.errands?.title || "Chat"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentUserId === conversation?.poster_id 
                  ? `With ${conversation?.helper?.display_name || 'Helper'}`
                  : `With ${conversation?.poster?.display_name || 'Poster'}`
                }
              </p>
            </div>
            
            <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  SOS
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Report Issue</AlertDialogTitle>
                  <AlertDialogDescription>
                    Report suspicious behavior or unfulfilled errands. Your report will be reviewed by our team.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Select value={reportReason} onValueChange={setReportReason}>
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="errand_not_completed">Errand Not Completed</SelectItem>
                        <SelectItem value="suspicious_behavior">Suspicious Behavior</SelectItem>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="scam_attempt">Scam Attempt</SelectItem>
                        <SelectItem value="safety_concern">Safety Concern</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide any additional information that will help us understand the issue..."
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmittingReport}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmitReport}
                    disabled={!reportReason || isSubmittingReport}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isSubmittingReport ? "Submitting..." : "Submit Report"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 container mx-auto px-4 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message.sender_id) ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`p-4 max-w-[70%] ${
                isOwnMessage(message.sender_id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <p className="text-xs font-semibold mb-1 opacity-70">
                  {message.sender?.display_name || 'Anonymous'}
                </p>
                <p className="break-words">{message.content}</p>
                <p className="text-xs opacity-50 mt-2">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <div className="border-t border-border bg-background sticky bottom-0">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !newMessage.trim()}
              className="bg-primary hover:bg-primary-light"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
