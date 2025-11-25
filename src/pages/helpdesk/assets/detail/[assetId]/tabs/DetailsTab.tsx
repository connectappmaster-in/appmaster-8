import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface DetailsTabProps {
  asset: any;
}

export const DetailsTab = ({ asset }: DetailsTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Serial No</p>
            <p className="font-medium">{asset.serial_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Purchased From</p>
            <p className="font-medium">{asset.purchased_from || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Asset Classification</p>
            <Badge variant="secondary">{asset.classification || "Internal"}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Asset Configuration</p>
            <p className="font-medium">{asset.asset_configuration || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Site</p>
            <p className="font-medium">{asset.site || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">{asset.location || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">{asset.department || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge>{asset.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {asset.assigned_to && (
        <Card>
          <CardHeader>
            <CardTitle>Check-out Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Assigned To</p>
              <p className="font-medium">{asset.assigned_to}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-out Date</p>
              <p className="font-medium">
                {asset.checkout_date ? format(new Date(asset.checkout_date), "dd/MM/yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {asset.due_date ? format(new Date(asset.due_date), "dd/MM/yyyy") : "N/A"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{asset.checkout_notes || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Creation Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium">
              {asset.created_at ? format(new Date(asset.created_at), "dd/MM/yyyy HH:mm") : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created By</p>
            <p className="font-medium">{asset.created_by || "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
