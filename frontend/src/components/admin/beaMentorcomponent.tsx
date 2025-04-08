"use client";
import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Check, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { actionBementor, getallrequst } from "@/services/fetchdata";
import AdminTable from "./adminuserTable";
import UserDetailsDialog from "./moreMentorRequst";
import PaginationComponent from "../default/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

// Experience filter component
const ExperienceFilter = ({ 
  experience, 
  onExperienceChange 
}: { 
  experience: string, 
  onExperienceChange: (value: string) => void 
}) => {
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");

  // Handle experience selection
  const handleApply = () => {
    // Format experience as "min-max"
    const expRange = minExp && maxExp 
      ? `${minExp}-${maxExp}` 
      : (minExp ? `${minExp}+` : (maxExp ? `0-${maxExp}` : ""));
    onExperienceChange(expRange);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" /> 
          Experience 
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Filter by Experience</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Experience (Years)
              </label>
              <Input 
                type="number" 
                placeholder="Min Years"
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                min="0"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Experience (Years)
              </label>
              <Input 
                type="number" 
                placeholder="Max Years"
                value={maxExp}
                onChange={(e) => setMaxExp(e.target.value)}
                min="0"
                className="w-full"
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Leave fields blank to remove that constraint.
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setMinExp("");
              setMaxExp("");
              onExperienceChange("");
            }}
          >
            Clear
          </Button>
          <Button onClick={handleApply}>
            Apply Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { clearNotifications } from "@/lib/features/message";
import { useDispatch } from "react-redux";
function BeAMentorComponent() {
  const dispatch=useDispatch()
  const [allData, setAllData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Status options
  const STATUS_OPTIONS = [
    { value: " ", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" }
  ];
useEffect(()=>{
  dispatch(clearNotifications())
})
  // Fetch data with filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const urlParams = new URLSearchParams();
        urlParams.append("page", String(page));
        
        if (search) urlParams.append("search", search);
        if (experience) urlParams.append("experience", experience);
        if (status) urlParams.append("status", status);

        const result = await getallrequst(String(urlParams));
        setTotal(result.data.total);
        setAllData(result.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, search, experience, status]);

  // Handle mentor action
  const handleUpdate = async (action: string, dataId: string) => {
    try {
      await actionBementor(action, dataId);
      // Refresh data after action
      const urlParams = new URLSearchParams();
      urlParams.append("page", String(page));
      const result = await getallrequst(String(urlParams));
      setAllData(result.data.data);
    } catch (error) {
      console.error("Error updating mentor status:", error);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setExperience("");
    setStatus("");
    setPage(1);
  };

  // Table columns configuration
  const columns = [
    {
      key: "Name",
      header: "Username",
      render: (data: any) => data.fullname,
    },
    {
      key: "email",
      header: "Email",
      render: (data: any) => data.email,
    },
    {
      key: "qualification",
      header: "Qualification",
      render: (data) => data.qualification,
    },
    {
      key: "experience",
      header: "Experience",
      render: (data) => `${data.experience} Years`,
    },
    {
      key: "status",
      header: "Status",
      render: (data: any) => (
        <span
          className={`py-1 px-3 text-sm font-medium rounded-full 
          ${data.status === "pending" ? "bg-yellow-500 text-white" : ""}
          ${data.status === "accepted" ? "bg-green-500 text-white" : ""}
          ${data.status === "rejected" ? "bg-red-500 text-white" : ""}`}
        >
          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
        </span>
      ),
    },
    {
      key: "more",
      header: "Details",
      render: (data) => <UserDetailsDialog data={data} />,
    },
    {
      key: "action",
      header: "Action",
      render: (data) =>
        data.status === "pending" ? (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-500 border-green-500 hover:bg-green-500/10"
              onClick={() => handleUpdate("accepted", data._id)}
            >
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-500 border-red-500 hover:bg-red-500/10"
              onClick={() => handleUpdate("rejected", data._id)}
            >
              <X className="mr-2 h-4 w-4" /> Reject
            </Button>
          </div>
        ) : (
          <Check className="text-green-500" />
        ),
    },
  ];

  return (
    <Card className="w-full bg-[#0f172a] text-white border-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mentor Requests</span>
          <div className="flex items-center space-x-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 w-64 bg-[#1e293b] text-white border-[#334155] focus:border-blue-500"
              />
            </div>

            {/* Experience Filter */}
            <ExperienceFilter 
              experience={experience}
              onExperienceChange={setExperience}
            />

            {/* Status Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center bg-[#1e293b] text-white border-[#334155] hover:bg-[#334155]">
                  <Filter className="mr-2 h-4 w-4" /> 
                  Status 
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-[#1e293b] border-[#334155]">
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value.trim())}
                >
                  <SelectTrigger className="bg-[#1e293b] text-white border-[#334155]">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-[#334155] focus:bg-[#334155]"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PopoverContent>
            </Popover>

            {/* Reset Filters Button */}
            {(search || experience || status) && (
              <Button 
                variant="ghost" 
                className="text-red-500 hover:bg-red-500/10"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AdminTable 
          data={allData} 
          columns={columns} 
          isLoading={loading} 
        />
        <div className="mt-4">
          <PaginationComponent 
            page={page} 
            total={total} 
            itemsPerPage={6} 
            setPage={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default BeAMentorComponent;