"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Users } from "lucide-react";
// Import shadcn components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getuserwithperfomence } from "@/services/fetchdata";
import PaginationComponent from "@/components/default/pagination";
import Usermanagment from "@/components/mentor/Usermanagment";

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [page, setpage] = useState(1);
  const [totalscount, setTotalCount] = useState(0);
  const debounce = <F extends (...args: any[]) => void>(
    func: F,
    delay: number
  ) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<F>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
    debounced.cancel = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    return debounced;
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterRole !== "all") {
        queryParams.append("role", filterRole);
      }
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }
      queryParams.append("page", (page + 1).toString());
      queryParams.append("limit", "5");

      const response = await getuserwithperfomence(queryParams.toString());
      const data: any = response;

      if (data.success) {
        setUsers(data.data);
        setTotalCount(data.total);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
 
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filterRole, searchTerm, page]);

  const debouncedFetchUsers = useCallback(
    debounce(() => {
      fetchUsers();
    }, 500),
    [fetchUsers]
  );

  // Trigger debounced fetch when search term changes
  useEffect(() => {
    if (searchTerm) {
      debouncedFetchUsers();
    }
    return () => {
      debouncedFetchUsers.cancel(); // Cancel any pending debounced calls on unmount
    };
  }, [searchTerm, debouncedFetchUsers]);
  useEffect(() => {
    fetchUsers();
  }, [page, filterRole]);

  // Calculate user stats from progress data
  const calculateUserStats = (user) => {
    // If we have pre-calculated stats from the API, use those
    if (userStats) {
      return userStats;
    }
    if (!user || !user.progress || user.progress.length === 0) {
      return {
        totalCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        completionRate: 0,
        totalWatchTime: 0,
        avgScore: 0,
      };
    }

    // Otherwise calculate from user progress data
    const totalCourses = user.purchasedCourses?.length || 0;
    const totalLessons = user.progress.reduce(
      (acc, course) => acc + (course.lesson_progress?.length || 0),
      0
    );
    const completedLessons = user.progress.reduce(
      (acc, course) =>
        acc +
        (course.lesson_progress?.filter((lesson) => lesson.Completed)?.length ||
          0),
      0
    );
    const completionRate =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    const totalWatchTime = user.progress.reduce(
      (acc, course) =>
        acc +
        (course.lesson_progress?.reduce(
          (sum, lesson) => sum + (lesson.WatchTime || 0),
          0
        ) || 0),
      0
    );
    const avgScore =
      user.progress.length > 0
        ? Math.round(
            user.progress.reduce((acc, curr) => acc + (curr.Score || 0), 0) /
              user.progress.length
          )
        : 0;

    return {
      totalCourses,
      totalLessons,
      completedLessons,
      completionRate,
      totalWatchTime,
      avgScore,
    };
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || ""
    );
  };

  return (
    <div className="flex flex-col h-full w-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              User Management
            </h1>
            <p className="text-slate-400">
              Monitor student performance and progress
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200">
              <Users className="h-4 w-4 mr-2 text-emerald-400" />
              {users.length} Users
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            type="text"
            className="pl-10 bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-200 placeholder:text-slate-500"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value ? e.target.value : " ")
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={filterRole}
            onValueChange={(value) => {
              setFilterRole(value);
              setSelectedUser(null);
            }}>
            <SelectTrigger className="w-40 border-slate-700 bg-slate-800 text-slate-200">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="mentor">Mentors</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <Usermanagment
        activeTab={activeTab}
        calculateUserStats={calculateUserStats}
        filteredUsers={users}
        getInitials={getInitials}
        loading={loading}
        loadingStats={loadingStats}
        selectedUser={selectedUser}
        setActiveTab={setActiveTab}
        setSelectedUser={setSelectedUser}
      />
      <div className="border-t border-slate-800 p-4 bg-slate-900">
        <PaginationComponent
          page={page}
          setPage={setpage}
          itemsPerPage={5}
          total={totalscount}
        />
      </div>
    </div>
  );
};
export default UserManagementDashboard;
