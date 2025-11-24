import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ServiceRequestDetailsViewProps {
  request: any;
  onClose: () => void;
}

export const ServiceRequestDetailsView = ({ request, onClose }: ServiceRequestDetailsViewProps) => {
  const priorityColors: Record<string, string> = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    fulfilled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="bg-background border rounded-lg p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{request.request_number}</h3>
            <Badge className={statusColors[request.status] || ""}>
              {request.status}
            </Badge>
            <Badge className={priorityColors[request.priority] || ""}>
              {request.priority}
            </Badge>
          </div>
          <h4 className="text-lg font-medium text-muted-foreground">{request.title}</h4>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Description
          </h5>
          <p className="text-sm text-muted-foreground">{request.description || "No description provided"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created
            </h5>
            <p className="text-sm text-muted-foreground">
              {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          
          <div>
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Requester
            </h5>
            <p className="text-sm text-muted-foreground">{request.requester_id || "Unknown"}</p>
          </div>
        </div>

        {request.additional_notes && (
          <div>
            <h5 className="text-sm font-semibold mb-2">Additional Notes</h5>
            <p className="text-sm text-muted-foreground">{request.additional_notes}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" size="sm">
            Add Comment
          </Button>
          <Button variant="outline" size="sm">
            Update Status
          </Button>
          <Button variant="outline" size="sm" className="ml-auto">
            Close Request
          </Button>
        </div>
      </div>
    </div>
  );
};
