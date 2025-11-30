import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface ErrandStatusBadgeProps {
  status: string;
}

const ErrandStatusBadge = ({ status }: ErrandStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          icon: AlertCircle,
          className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: Clock,
          className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default ErrandStatusBadge;
