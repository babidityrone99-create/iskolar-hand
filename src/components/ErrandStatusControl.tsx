import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ErrandStatusControlProps {
  errandId: string;
  currentStatus: string;
  isOwner: boolean;
  isHelper: boolean;
  onStatusUpdate: () => void;
}

const ErrandStatusControl = ({ 
  errandId, 
  currentStatus, 
  isOwner, 
  isHelper,
  onStatusUpdate 
}: ErrandStatusControlProps) => {
  const { toast } = useToast();

  const updateStatus = async (newStatus: 'available' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      // If completing, fetch errand details first to create transaction
      if (newStatus === 'completed') {
        const { data: errand, error: fetchError } = await supabase
          .from('errands')
          .select('budget, accepted_by')
          .eq('id', errandId)
          .single();

        if (fetchError) throw fetchError;

        if (errand?.accepted_by && errand?.budget) {
          // Create earning transaction for the helper
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              user_id: errand.accepted_by,
              errand_id: errandId,
              type: 'earning',
              amount: errand.budget,
              description: 'Errand completed - earned payment'
            });

          if (transactionError) throw transactionError;
        }
      }

      const { error } = await supabase
        .from('errands')
        .update({ status: newStatus })
        .eq('id', errandId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: newStatus === 'completed' 
          ? "Errand completed! Payment has been credited." 
          : `Errand marked as ${newStatus.replace('_', ' ')}`,
      });

      onStatusUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Don't show controls if errand is already completed or cancelled
  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return null;
  }

  // Only owners and helpers can manage status
  if (!isOwner && !isHelper) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === 'available' && isHelper && (
          <DropdownMenuItem onClick={() => updateStatus('in_progress')}>
            <Clock className="h-4 w-4 mr-2" />
            Mark In Progress
          </DropdownMenuItem>
        )}
        {currentStatus === 'in_progress' && (
          <>
            <DropdownMenuItem onClick={() => updateStatus('completed')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Completed
            </DropdownMenuItem>
            {isOwner && (
              <DropdownMenuItem onClick={() => updateStatus('cancelled')}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Errand
              </DropdownMenuItem>
            )}
          </>
        )}
        {currentStatus === 'available' && isOwner && (
          <DropdownMenuItem onClick={() => updateStatus('cancelled')}>
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Errand
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ErrandStatusControl;
