import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface ChangeRequestDetailsViewProps {
  change: any;
  onClose: () => void;
}

export const ChangeRequestDetailsView = ({ change, onClose }: ChangeRequestDetailsViewProps) => {
  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    submitted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="bg-background border rounded-lg p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{change.change_number}</h3>
            <Badge className={statusColors[change.status] || ""}>
              {change.status}
            </Badge>
          </div>
          <h4 className="text-lg font-medium text-muted-foreground">{change.title}</h4>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="text-sm font-semibold mb-2">Description</h5>
          <p className="text-sm text-muted-foreground">{change.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Level
            </h5>
            <Badge variant="outline" className="capitalize">
              {change.risk}
            </Badge>
          </div>
          
          <div>
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Impact
            </h5>
            <Badge variant="outline" className="capitalize">
              {change.impact}
            </Badge>
          </div>

          <div>
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created
            </h5>
            <p className="text-sm text-muted-foreground">
              {format(new Date(change.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {change.implementation_plan && (
          <div>
            <h5 className="text-sm font-semibold mb-2">Implementation Plan</h5>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {change.implementation_plan}
            </p>
          </div>
        )}

        {change.backout_plan && (
          <div>
            <h5 className="text-sm font-semibold mb-2">Backout Plan</h5>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {change.backout_plan}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" size="sm">
            Add Comment
          </Button>
          <Button variant="outline" size="sm">
            Update Status
          </Button>
          <Button variant="outline" size="sm">
            Schedule Change
          </Button>
          <Button variant="outline" size="sm" className="ml-auto">
            Cancel Change
          </Button>
        </div>
      </div>
    </div>
  );
};
