import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Eye, Edit, UserPlus, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { EditAssetDialog } from "./EditAssetDialog";
import { AssignAssetDialog } from "./AssignAssetDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AssetsListProps {
  status?: string;
  filters?: Record<string, any>;
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  retired: "bg-muted/10 text-muted-foreground border-muted/20",
  disposed: "bg-destructive/10 text-destructive border-destructive/20",
};

export const AssetsList = ({ status, filters = {} }: AssetsListProps) => {
  const [editAsset, setEditAsset] = useState<any>(null);
  const [assignAsset, setAssignAsset] = useState<any>(null);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets", status, filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;
      const orgId = userData?.organisation_id;

      let query = supabase.from("assets").select("*").order("created_at", { ascending: false });

      if (orgId) {
        query = query.eq("organisation_id", orgId);
      } else {
        query = query.eq("tenant_id", tenantId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Client-side filtering
  const filteredAssets = assets.filter((asset: any) => {
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.type && asset.asset_type !== filters.type) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch = 
        asset.name?.toLowerCase().includes(search) || 
        asset.asset_type?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
        <div className="rounded-full bg-muted p-4 mb-3">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">No assets found</h3>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
          {Object.keys(filters).length > 0 
            ? "Try adjusting your filters to see more assets" 
            : "Get started by creating your first asset"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium h-9">ASSET NAME</TableHead>
              <TableHead className="text-xs font-medium h-9">TYPE</TableHead>
              <TableHead className="text-xs font-medium h-9">STATUS</TableHead>
              <TableHead className="text-xs font-medium h-9">PURCHASE DATE</TableHead>
              <TableHead className="text-xs font-medium h-9">PURCHASE PRICE</TableHead>
              <TableHead className="text-xs font-medium h-9">CURRENT VALUE</TableHead>
              <TableHead className="text-xs font-medium h-9">DEPRECIATION</TableHead>
              <TableHead className="text-xs font-medium h-9 text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset: any) => (
              <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="py-2">
                  <div className="font-medium text-sm">{asset.name}</div>
                </TableCell>
                <TableCell className="py-2">
                  {asset.asset_type && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {asset.asset_type}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${statusColors[asset.status || "active"]}`}
                  >
                    {asset.status || 'active'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2">
                  {format(new Date(asset.purchase_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-sm font-medium py-2">
                  ₹{asset.purchase_price.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm py-2">
                  {asset.current_value !== null 
                    ? `₹${asset.current_value.toLocaleString()}` 
                    : '—'}
                </TableCell>
                <TableCell className="text-xs py-2">
                  {asset.depreciation_method ? (
                    <div className="flex flex-col">
                      <span className="capitalize">{asset.depreciation_method}</span>
                      {asset.useful_life_years && (
                        <span className="text-muted-foreground">
                          ({asset.useful_life_years}y)
                        </span>
                      )}
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setEditAsset(asset)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setAssignAsset(asset)}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editAsset && (
        <EditAssetDialog
          asset={editAsset}
          open={!!editAsset}
          onOpenChange={(open) => !open && setEditAsset(null)}
        />
      )}
      
      {assignAsset && (
        <AssignAssetDialog
          asset={assignAsset}
          open={!!assignAsset}
          onOpenChange={(open) => !open && setAssignAsset(null)}
        />
      )}
    </>
  );
};
