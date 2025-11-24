import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AddAsset = () => {
  const navigate = useNavigate();
  const { organisation } = useOrganisation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("single");

  // Single asset form
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    model: "",
    serial_number: "",
    mac_address: "",
    hostname: "",
    purchase_date: "",
    purchase_price: "",
    currency: "USD",
    location: "",
    warranty_end: "",
    amc_end: "",
    vendor_id: "",
  });

  // Fetch vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ["itam-vendors", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("itam_vendors")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("is_deleted", false);
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  // Generate asset tag
  const generateAssetTag = async (tenantId: number) => {
    const { data, error } = await supabase.rpc("generate_asset_tag", {
      tenant_id_param: tenantId,
    });
    if (error) throw error;
    return data;
  };

  // Create asset mutation
  const createAsset = useMutation({
    mutationFn: async (assetData: any) => {
      if (!organisation?.id) throw new Error("No organization");

      // Generate asset tag
      const assetTag = await generateAssetTag(1); // Assuming tenant_id = 1

      const { data, error } = await supabase
        .from("itam_assets")
        .insert({
          ...assetData,
          asset_tag: assetTag,
          organisation_id: organisation.id,
          tenant_id: 1,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["itam-assets"] });
      toast.success("Asset created successfully");
      navigate(`/helpdesk/assets/detail/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create asset");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error("Please fill in required fields");
      return;
    }

    createAsset.mutate({
      name: formData.name,
      type: formData.type,
      model: formData.model || null,
      serial_number: formData.serial_number || null,
      mac_address: formData.mac_address || null,
      hostname: formData.hostname || null,
      purchase_date: formData.purchase_date || null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      currency: formData.currency,
      location: formData.location || null,
      warranty_end: formData.warranty_end || null,
      amc_end: formData.amc_end || null,
      vendor_id: formData.vendor_id ? parseInt(formData.vendor_id) : null,
      status: "available",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Add New Asset</h1>
            <p className="text-sm text-muted-foreground">
              Add hardware, software, or equipment to your inventory
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="single">Single Asset</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Information</CardTitle>
                  <CardDescription>Basic details about the asset</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Asset Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Dell Laptop"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laptop">Laptop</SelectItem>
                          <SelectItem value="Desktop">Desktop</SelectItem>
                          <SelectItem value="Monitor">Monitor</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                          <SelectItem value="Server">Server</SelectItem>
                          <SelectItem value="Printer">Printer</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="e.g., Latitude 5420"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serial_number">Serial Number</Label>
                      <Input
                        id="serial_number"
                        value={formData.serial_number}
                        onChange={(e) =>
                          setFormData({ ...formData, serial_number: e.target.value })
                        }
                        placeholder="e.g., ABC123XYZ"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mac_address">MAC Address</Label>
                      <Input
                        id="mac_address"
                        value={formData.mac_address}
                        onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                        placeholder="e.g., 00:1B:44:11:3A:B7"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hostname">Hostname</Label>
                      <Input
                        id="hostname"
                        value={formData.hostname}
                        onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                        placeholder="e.g., DESK-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Floor 3, Room 301"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Purchase Information</CardTitle>
                  <CardDescription>Details about the purchase and vendor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor_id">Vendor</Label>
                      <Select
                        value={formData.vendor_id}
                        onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchase_date">Purchase Date</Label>
                      <Input
                        id="purchase_date"
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) =>
                          setFormData({ ...formData, purchase_date: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchase_price">Purchase Price</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) =>
                          setFormData({ ...formData, purchase_price: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warranty_end">Warranty End Date</Label>
                      <Input
                        id="warranty_end"
                        type="date"
                        value={formData.warranty_end}
                        onChange={(e) => setFormData({ ...formData, warranty_end: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amc_end">AMC End Date</Label>
                      <Input
                        id="amc_end"
                        type="date"
                        value={formData.amc_end}
                        onChange={(e) => setFormData({ ...formData, amc_end: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAsset.isPending}>
                  {createAsset.isPending ? "Creating..." : "Create Asset"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>
                  Upload a CSV file to import multiple assets at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <Button variant="outline">Choose File</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Download the{" "}
                  <a href="#" className="text-primary underline">
                    CSV template
                  </a>{" "}
                  to see the required format.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddAsset;
