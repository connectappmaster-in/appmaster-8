import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  Edit, 
  MoreVertical,
  UserCheck,
  Archive,
  Wrench
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { DetailsTab } from "./[assetId]/tabs/DetailsTab";
import { EventsTab } from "./[assetId]/tabs/EventsTab";
import { PhotosTab } from "./[assetId]/tabs/PhotosTab";
import { DocsTab } from "./[assetId]/tabs/DocsTab";
import { WarrantyTab } from "./[assetId]/tabs/WarrantyTab";
import { HistoryTab } from "./[assetId]/tabs/HistoryTab";

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
        .select("*")
        .eq("id", parseInt(assetId || "0"))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assetId,
  });

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "default";
      case "assigned": return "secondary";
      case "in_repair": return "destructive";
      case "retired": return "outline";
      default: return "secondary";
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
      <BackButton />
      
      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        {/* Top Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Asset Photo */}
              <div className="flex-shrink-0">
                {asset.photo_url ? (
                  <img 
                    src={asset.photo_url} 
                    alt={asset.name}
                    className="h-48 w-48 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">No Photo</span>
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{asset.asset_id}</h1>
                    <Badge variant={getStatusColor(asset.status)}>{asset.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">
                        {asset.purchase_date ? format(new Date(asset.purchase_date), "dd/MM/yyyy") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium">₹{asset.cost || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Brand</p>
                      <p className="font-medium">{asset.brand || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Model</p>
                      <p className="font-medium">{asset.model || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{asset.category || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{asset.department || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Site</p>
                      <p className="font-medium">{asset.site || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{asset.location || "N/A"}</p>
                    </div>
                    {asset.assigned_to && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Assigned To</p>
                          <p className="font-medium">{asset.assigned_to}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant="secondary">Checked Out</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    PRINT
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/helpdesk/assets/edit/${asset.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    EDIT
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4 mr-2" />
                        MORE ACTIONS
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {asset.status === "available" && (
                        <DropdownMenuItem onClick={() => navigate(`/helpdesk/assets/assign?assetId=${asset.id}`)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Check-out
                        </DropdownMenuItem>
                      )}
                      {asset.status === "assigned" && (
                        <DropdownMenuItem onClick={() => navigate(`/helpdesk/assets/return?assetId=${asset.id}`)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Check-in
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate(`/helpdesk/assets/repairs/create?assetId=${asset.id}`)}>
                        <Wrench className="h-4 w-4 mr-2" />
                        Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        Reserve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        Upload Docs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        Link Assets
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        Dispose
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-6 lg:grid-cols-11 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="docs">Docs</TabsTrigger>
            <TabsTrigger value="warranty">Warranty</TabsTrigger>
            <TabsTrigger value="linking">Linking</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="reserve">Reserve</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <DetailsTab asset={asset} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsTab assetId={asset.id} />
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <PhotosTab assetId={asset.id} />
          </TabsContent>

          <TabsContent value="docs" className="mt-6">
            <DocsTab assetId={asset.id} />
          </TabsContent>

          <TabsContent value="warranty" className="mt-6">
            <WarrantyTab assetId={asset.id} />
          </TabsContent>

          <TabsContent value="linking" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">Linking feature coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">Maintenance records coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">Contracts feature coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reserve" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">Reservation system coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">Audit logs coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryTab assetId={asset.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AssetDetail;
