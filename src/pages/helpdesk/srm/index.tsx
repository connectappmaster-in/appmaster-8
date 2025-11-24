import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Settings, Calendar, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ServiceRequests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Mock data for now (will be replaced with actual database queries)
  const requests: any[] = [];
  const changes: any[] = [];
  const isLoading = false;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 pt-2 pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          {/* Compact Single Row Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <TabsList className="h-8">
              <TabsTrigger value="requests" className="gap-1.5 px-3 text-sm h-7">
                <FileText className="h-3.5 w-3.5" />
                Service Requests
                {requests.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                    {requests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="changes" className="gap-1.5 px-3 text-sm h-7">
                <Calendar className="h-3.5 w-3.5" />
                Change Management
                {changes.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                    {changes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-1.5 px-3 text-sm h-7">
                <Settings className="h-3.5 w-3.5" />
                Admin
              </TabsTrigger>
            </TabsList>

            {activeTab === 'requests' && (
              <>
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-9 h-8"
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? null : value })}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.priority || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? null : value })}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button size="sm" onClick={() => navigate('/helpdesk/service-requests')} className="gap-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="text-sm">New Request</span>
                  </Button>
                </div>
              </>
            )}

            {activeTab === 'changes' && (
              <Button size="sm" onClick={() => navigate('/helpdesk/service-requests/change-management')} className="gap-1.5 h-8 ml-auto">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-sm">New Change</span>
              </Button>
            )}
          </div>

          {/* Service Requests Tab */}
          <TabsContent value="requests" className="space-y-2 mt-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading requests...</p>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No service requests found</h3>
                <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
                  Get started by creating your first service request
                </p>
                <Button onClick={() => navigate('/helpdesk/service-requests')} size="sm" className="gap-1.5 h-8">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-sm">Create First Request</span>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium h-9">REQUEST #</TableHead>
                      <TableHead className="text-xs font-medium h-9">TITLE</TableHead>
                      <TableHead className="text-xs font-medium h-9">STATUS</TableHead>
                      <TableHead className="text-xs font-medium h-9">PRIORITY</TableHead>
                      <TableHead className="text-xs font-medium h-9">REQUESTED BY</TableHead>
                      <TableHead className="text-xs font-medium h-9">CREATED</TableHead>
                      <TableHead className="text-xs font-medium h-9 text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request: any) => (
                      <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono text-xs py-2">{request.request_number || 'N/A'}</TableCell>
                        <TableCell className="py-2">
                          <div className="max-w-[300px]">
                            <div className="font-medium text-sm truncate">{request.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{request.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {request.priority || 'medium'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm py-2">{request.requested_by || 'N/A'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-3.5 w-3.5 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Edit Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Change Management Tab */}
          <TabsContent value="changes" className="space-y-2 mt-2">
            {changes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No change requests found</h3>
                <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
                  Get started by creating your first change request
                </p>
                <Button onClick={() => navigate('/helpdesk/service-requests/change-management')} size="sm" className="gap-1.5 h-8">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-sm">Create First Change</span>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium h-9">CHANGE #</TableHead>
                      <TableHead className="text-xs font-medium h-9">TITLE</TableHead>
                      <TableHead className="text-xs font-medium h-9">STATUS</TableHead>
                      <TableHead className="text-xs font-medium h-9">RISK</TableHead>
                      <TableHead className="text-xs font-medium h-9">IMPACT</TableHead>
                      <TableHead className="text-xs font-medium h-9">CREATED</TableHead>
                      <TableHead className="text-xs font-medium h-9 text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changes.map((change: any) => (
                      <TableRow key={change.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono text-xs py-2">{change.change_number}</TableCell>
                        <TableCell className="py-2">
                          <div className="max-w-[300px]">
                            <div className="font-medium text-sm truncate">{change.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{change.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {change.status || 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {change.risk || 'low'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm py-2">{change.impact || 'low'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2">
                          {new Date(change.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-3.5 w-3.5 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Edit Change
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-2 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate('/helpdesk/service-requests/assignment-rules')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  <h3 className="font-medium text-sm">Assignment Rules</h3>
                </div>
                <p className="text-xs text-muted-foreground">Configure request routing</p>
              </div>

              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate('/helpdesk/service-requests/sla-policies')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-medium text-sm">SLA Policies</h3>
                </div>
                <p className="text-xs text-muted-foreground">Manage service level agreements</p>
              </div>

              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate('/helpdesk/service-requests/reports')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-medium text-sm">Reports</h3>
                </div>
                <p className="text-xs text-muted-foreground">View analytics and metrics</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
