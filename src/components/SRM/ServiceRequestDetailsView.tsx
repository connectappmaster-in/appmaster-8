import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
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
    <div className="bg-background border rounded-lg animate-fade-in overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-semibold">{request.request_number}</h3>
          <Badge className={statusColors[request.status] || ""} variant="secondary">
            {request.status}
          </Badge>
          <Badge className={priorityColors[request.priority] || ""} variant="secondary">
            {request.priority}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h4 className="font-semibold text-base mb-3">{request.title}</h4>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-3 gap-4 text-sm py-2">
          <div>
            <span className="text-muted-foreground text-xs">Created</span>
            <p className="font-medium mt-0.5">
              {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Requester</span>
            <p className="font-medium mt-0.5 truncate">{request.requester_id || "Unknown"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Status</span>
            <p className="font-medium mt-0.5 capitalize">{request.status}</p>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Description</h5>
          <p className="text-sm leading-relaxed">{request.description || "No description provided"}</p>
        </div>

        {request.additional_notes && (
          <>
            <Separator />
            <div>
              <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Additional Notes</h5>
              <p className="text-sm leading-relaxed">{request.additional_notes}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1">
            Add Comment
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Update Status
          </Button>
          <Button variant="outline" size="sm">
            Close Request
          </Button>
        </div>
      </div>
    </div>
  );
};
