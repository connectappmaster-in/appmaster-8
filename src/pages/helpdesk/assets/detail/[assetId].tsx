import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  Wrench, 
  Archive, 
  Edit, 
  MoreVertical,
  Clock,
  MapPin,
  DollarSign,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

const AssetDetail = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch asset details
  const { data: asset, isLoading } = useQuery({
    queryKey: ["itam-asset-detail", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_assets")
        .select("*, itam_vendors(*)")
        .eq("id", parseInt(assetId || "0"))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assetId,
  });

  // Fetch asset history
  const { data: history = [] } = useQuery({
    queryKey: ["itam-asset-history", assetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("itam_asset_history")
        .select("*")
        .eq("asset_id", parseInt(assetId || "0"))
        .order("performed_at", { ascending: false });
      return data || [];
    },
    enabled: !!assetId,
  });

  // Fetch assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ["itam-asset-assignments", assetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("itam_asset_assignments")
        .select("*")
        .eq("asset_id", parseInt(assetId || "0"))
        .order("assigned_at", { ascending: false });
      return data || [];
    },
    enabled: !!assetId,
  });

  // Fetch repairs
  const { data: repairs = [] } = useQuery({
    queryKey: ["itam-asset-repairs", assetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("itam_repairs")
        .select("*, itam_vendors(*)")
        .eq("asset_id", parseInt(assetId || "0"))
        .order("opened_at", { ascending: false });
      return data || [];
    },
    enabled: !!assetId,
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("itam_assets")
        .update({ 
          status: newStatus,
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq("id", parseInt(assetId || "0"));
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itam-asset-detail", assetId] });
      toast.success("Asset status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_repair": return "bg-yellow-100 text-yellow-800";
      case "retired": return "bg-gray-100 text-gray-800";
      case "lost": return "bg-red-100 text-red-800";
      case "disposed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p>Loading asset details...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p>Asset not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{asset.name}</h1>
                <Badge className={getStatusColor(asset.status)}>
                  {asset.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Asset Tag: {asset.asset_tag}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {asset.status === "available" && (
              <Button onClick={() => navigate(`/helpdesk/assets/assign?assetId=${asset.id}`)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign
              </Button>
            )}
            {asset.status === "assigned" && (
              <Button onClick={() => navigate(`/helpdesk/assets/return?assetId=${asset.id}`)}>
                <Archive className="h-4 w-4 mr-2" />
                Return
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(`/helpdesk/assets/repairs/create?assetId=${asset.id}`)}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Create Repair
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/helpdesk/assets/edit/${asset.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Asset
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus.mutate("retired")}>
                  <Archive className="h-4 w-4 mr-2" />
                  Mark as Retired
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
            <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
            <TabsTrigger value="repairs">Repairs ({repairs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{asset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium">{asset.model || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span className="font-mono text-sm">{asset.serial_number || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MAC Address:</span>
                    <span className="font-mono text-sm">{asset.mac_address || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hostname:</span>
                    <span className="font-medium">{asset.hostname || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location:
                    </span>
                    <span className="font-medium">{asset.location || "—"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Purchase Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="font-medium">
                      {asset.itam_vendors && typeof asset.itam_vendors === 'object' && 'name' in asset.itam_vendors ? String((asset.itam_vendors as any).name) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Purchase Date:
                    </span>
                    <span className="font-medium">
                      {asset.purchase_date ? format(new Date(asset.purchase_date), "MMM dd, yyyy") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Purchase Price:
                    </span>
                    <span className="font-medium">
                      {asset.purchase_price ? `${asset.currency} ${asset.purchase_price}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty End:</span>
                    <span className="font-medium">
                      {asset.warranty_end ? format(new Date(asset.warranty_end), "MMM dd, yyyy") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AMC End:</span>
                    <span className="font-medium">
                      {asset.amc_end ? format(new Date(asset.amc_end), "MMM dd, yyyy") : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset History</CardTitle>
                <CardDescription>Complete audit trail of all changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex gap-3 border-l-2 pl-4 pb-3">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{entry.action.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.performed_at), "MMM dd, yyyy HH:mm")}
                        </p>
                        {entry.details && (
                          <pre className="text-xs mt-2 p-2 bg-accent rounded">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No history available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignment History</CardTitle>
                <CardDescription>Past and current asset assignments</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">User ID: {assignment.user_id}</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned: {format(new Date(assignment.assigned_at), "MMM dd, yyyy")}
                          </p>
                          {assignment.returned_at && (
                            <p className="text-sm text-muted-foreground">
                              Returned: {format(new Date(assignment.returned_at), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                        <Badge variant={assignment.returned_at ? "secondary" : "default"}>
                          {assignment.returned_at ? "Returned" : "Active"}
                        </Badge>
                      </div>
                      {assignment.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{assignment.notes}</p>
                      )}
                    </div>
                  ))}
                  {assignments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No assignments yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repairs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Repair History</CardTitle>
                <CardDescription>Maintenance and repair records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repairs.map((repair) => (
                    <div 
                      key={repair.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                      onClick={() => navigate(`/helpdesk/assets/repairs/detail/${repair.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{repair.issue_description}</p>
                          <p className="text-sm text-muted-foreground">
                            Opened: {format(new Date(repair.opened_at), "MMM dd, yyyy")}
                          </p>
                          {repair.itam_vendors && typeof repair.itam_vendors === 'object' && 'name' in repair.itam_vendors && (
                            <p className="text-sm text-muted-foreground">
                              Vendor: {String((repair.itam_vendors as any).name)}
                            </p>
                          )}
                        </div>
                        <Badge variant={repair.status === "completed" ? "default" : "secondary"}>
                          {repair.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {repairs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No repairs recorded
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AssetDetail;
