"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Settings, PlusCircle, FileText, Grid, List, ChevronDown } from "lucide-react";

import DashboardStats from "./dashboard-stats";
import CourseCard from "./course-card";
import CourseTable from "./course-table";
import CourseFilters from "./course-filters";
import CourseEditDialog from "./course-edit-dialog";
import CourseCreation from "@/components/course/course-creation";
import { useCourseRepository } from "@/hooks/use-course-repository";

import { useDebounce } from "@/hooks/use-debounce";
import type { ICourses } from "@/services/interface/CourseDto";
import PaginationComponent from "../default/pagination";
import { Progress } from "@radix-ui/react-progress";
import LoadingAnimation from "../loadincomp";

// Course validation schema
const courseSchema = z.object({
  Title: z.string().min(4, "Title must be more than 4 letters"),
  Description: z.string().min(5, "Description must be more than 5 letters"),
  Price: z.coerce.number().positive("Price cannot be less than 0"),
  Category: z.string().optional(),
  Content: z.string().optional(),
});

const MentorDashboard = () => {
  const router = useRouter();
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ICourses | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  // Filters state
  const [filters, setFilters] = useState({
    status: "all", // "all", "approved", "pending", "rejected"
    priceRange: "all", // "all", "free", "paid", "premium"
    sortBy: "newest", // "newest", "oldest", "price-high", "price-low", "students"
  });

  // Use the course repository hook
  const {
    courses,
    setCourses,
    latestCourses,
    isLoading,
    totalCourses,
    totalStudents,
    totalRevenue,
    fetchCourses,
    updateCourse,
    ActionCourse,
  } = useCourseRepository();

  // Fetch courses when filters, search term, or pagination changes
  useEffect(() => {
     fetchCourses({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchTerm,
      status: filters.status,
      priceRange: filters.priceRange,
      sortBy: filters.sortBy,
    });
  }, [debouncedSearchTerm, filters, currentPage, pageSize, fetchCourses]);

  // Update total pages when total courses changes
  useEffect(() => {
     setTotalPages(totalCourses);
  }, [totalCourses, pageSize]);

  const handleEditCourse = (course: ICourses) => {
     setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleActionCourse = async (courseId: string) => {
    try {
      await ActionCourse(courseId);
      // toast.success("Course Unlited successfully");
    } catch (error) {
      toast.error("Failed to delete course", {
        description: "Please try again later",
      });
    }
  };

  const handleUpdateCourse = async (courseId: string, courseData: any) => {
    try {
       // Validate with Zod
      courseSchema.parse(courseData);

      await updateCourse(courseId, courseData);
      setIsEditDialogOpen(false);

      // Refresh the courses data after successful update
      fetchCourses({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm,
        status: filters.status,
        priceRange: filters.priceRange,
        sortBy: filters.sortBy,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });

        // Show toast for the first error
        const firstError = error.errors[0];
        toast.error(`Validation Error: ${firstError.message}`, {
          description: `Please check the ${firstError.path[0]} field`,
        });
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to update course",
          {
            description: "Please try again later",
          }
        );
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      status: "all",
      priceRange: "all",
      sortBy: "newest",
    });
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-950 to-cyan-950 min-h-screen px-4 py-6">
      <div className={`w-full  mx-auto ${createCourseOpen ? "blur-sm" : ""}`}>
 

        <div className="flex w-full justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Course Management</h1>
            <p className="text-blue-300">Manage your courses and content</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
                size={18}
              />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-blue-900 border-blue-700 text-white w-64 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Button
                variant="outline"
                className="bg-blue-900 border-blue-700 text-white hover:bg-blue-800 transition-colors duration-200 flex items-center gap-2"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                data-filter-dropdown
              >
                <Settings size={18} />
                Filters
                <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isFilterOpen && (
                <CourseFilters
                  filters={filters}
                  setFilters={setFilters}
                  setIsFilterOpen={setIsFilterOpen}
                />
              )}
            </div>

            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md transition-all duration-200 flex items-center gap-2"
              onClick={() => setCreateCourseOpen(true)}
            >
              <PlusCircle size={18} />
              <span>Add New Course</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="latest" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-5 bg-gradient-to-r from-blue-800 to-cyan-800 rounded-lg border-none overflow-hidden">
            <TabsTrigger
              value="latest"
              className="text-lg text-blue-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-cyan-900 data-[state=active]:text-white py-3 transition-all duration-200"
            >
              Latest Courses
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-lg text-blue-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-cyan-900 data-[state=active]:text-white py-3 transition-all duration-200"
            >
              All Courses
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2 mb-6 bg-blue-900/50 p-4 rounded-lg border border-blue-800">
            {searchTerm && (
              <Badge className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white px-3 py-1.5 flex items-center">
                <span>Search: {searchTerm}</span>
                <button
                  className="ml-2 hover:text-blue-200 bg-blue-800/50 rounded-full h-5 w-5 flex items-center justify-center"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              </Badge>
            )}

            {filters.status !== "all" && (
              <Badge className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white px-3 py-1.5 flex items-center">
                <span>
                  Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                </span>
                <button
                  className="ml-2 hover:text-blue-200 bg-blue-800/50 rounded-full h-5 w-5 flex items-center justify-center"
                  onClick={() => setFilters({ ...filters, status: "all" })}
                >
                  ×
                </button>
              </Badge>
            )}

            {filters.priceRange !== "all" && (
              <Badge className="bg-gradient-to-r from-blue-700 to-cyan-700 text-white px-3 py-1.5 flex items-center">
                <span>
                  Price: {filters.priceRange.charAt(0).toUpperCase() + filters.priceRange.slice(1)}
                </span>
                <button
                  className="ml-2 hover:text-blue-200 bg-blue-800/50 rounded-full h-5 w-5 flex items-center justify-center"
                  onClick={() => setFilters({ ...filters, priceRange: "all" })}
                >
                  ×
                </button>
              </Badge>
            )}

            {(searchTerm || filters.status !== "all" || filters.priceRange !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-300 hover:text-white hover:bg-blue-800/50 transition-all duration-200"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-blue-300">Sort by:</span>
              <select
                className="bg-blue-800 border border-blue-700 text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
                {/* <option value="students">Most Students</option> */}
              </select>
            </div>
          </div>

          <TabsContent value="latest">
            {latestCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onEdit={() => handleEditCourse(course)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-b from-blue-900 to-cyan-900 border border-blue-800 rounded-lg p-8 text-center shadow-lg">
                <FileText size={48} className="mx-auto text-cyan-500 mb-4 opacity-70" />
                <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
                <p className="text-blue-300 mb-6">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700 transition-all duration-200"
                  onClick={handleClearFilters}
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingAnimation />
              </div>
            ) : courses.length > 0 ? (
              <>
                <CourseTable
                  courses={courses}
                  onEdit={handleEditCourse}
                  onAction={handleActionCourse}
                />

                <div className="mt-6 flex justify-center">
                  <PaginationComponent
                    itemsPerPage={pageSize}
                    page={currentPage}
                    setPage={setCurrentPage}
                    total={totalPages}
                  />
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-b from-blue-900 to-cyan-900 border border-blue-800 rounded-lg p-8 text-center shadow-lg">
                <FileText size={48} className="mx-auto text-cyan-500 mb-4 opacity-70" />
                <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
                <p className="text-blue-300 mb-6">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700 transition-all duration-200"
                  onClick={handleClearFilters}
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Course Edit Dialog */}
        {selectedCourse && (
          <CourseEditDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            course={selectedCourse}
            onUpdate={handleUpdateCourse}
            onAction={handleActionCourse}
          />
        )}
      </div>

      {/* Course Creation Modal */}
      <CourseCreation
        open={createCourseOpen}
        onOpenChange={setCreateCourseOpen}
        setCourses={setCourses}
        initialData={initialData}
      />
    </div>
  );
};

export default MentorDashboard;