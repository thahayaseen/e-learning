"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Settings, PlusCircle, FileText } from "lucide-react";

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
    deleteCourse,
  } = useCourseRepository();

  // Fetch courses when filters, search term, or pagination changes
  useEffect(() => {
    console.log(debouncedSearchTerm, "search is ");

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
    console.log(totalCourses, "totalcourse is ");

    setTotalPages(totalCourses);
  }, [totalCourses, pageSize]);

  const handleEditCourse = (course: ICourses) => {
    console.log(course, "tje cpoure");

    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
    } catch (error) {
      toast.error("Failed to delete course", {
        description: "Please try again later",
      });
    }
  };

  const handleUpdateCourse = async (courseId: string, courseData: any) => {
    try {
      console.log();
      
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

      toast.success("Course updated successfully", {
        description: "Your changes have been saved",
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
    <div className="w-full bg-gradient-to-b mx-1 from-blue-950 to-blue-900 min-h-screen">
      <div className={`w-full p-4 ${createCourseOpen ? "blur-sm" : ""}`}>
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
                className="pl-10 bg-blue-900 border-blue-700 text-white w-64 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Button
                variant="outline"
                className="bg-blue-900 border-blue-700 text-white hover:bg-blue-800"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                data-filter-dropdown>
                <Settings size={18} className="mr-2" />
                Filters
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
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={() => setCreateCourseOpen(true)}>
              <PlusCircle size={18} />
              <span>Add New Course</span>
            </Button>
          </div>
        </div>

        <DashboardStats
          totalCourses={totalCourses}
          totalStudents={totalStudents}
          totalRevenue={totalRevenue}
        />

        <Tabs defaultValue="latest" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-900 border-none">
            <TabsTrigger
              value="latest"
              className="text-lg text-blue-300 data-[state=active]:bg-blue-800 data-[state=active]:text-white">
              Latest Courses
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-lg text-blue-300 data-[state=active]:bg-blue-800 data-[state=active]:text-white">
              All Courses
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge className="bg-blue-700 text-white px-3 py-1">
                Search: {searchTerm}
                <button
                  className="ml-2 hover:text-blue-200"
                  onClick={() => setSearchTerm("")}>
                  ×
                </button>
              </Badge>
            )}

            {filters.status !== "all" && (
              <Badge className="bg-blue-700 text-white px-3 py-1">
                Status:{" "}
                {filters.status.charAt(0).toUpperCase() +
                  filters.status.slice(1)}
                <button
                  className="ml-2 hover:text-blue-200"
                  onClick={() => setFilters({ ...filters, status: "all" })}>
                  ×
                </button>
              </Badge>
            )}

            {filters.priceRange !== "all" && (
              <Badge className="bg-blue-700 text-white px-3 py-1">
                Price:{" "}
                {filters.priceRange.charAt(0).toUpperCase() +
                  filters.priceRange.slice(1)}
                <button
                  className="ml-2 hover:text-blue-200"
                  onClick={() => setFilters({ ...filters, priceRange: "all" })}>
                  ×
                </button>
              </Badge>
            )}

            {(searchTerm ||
              filters.status !== "all" ||
              filters.priceRange !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-300 hover:text-white"
                onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-blue-300">Sort by:</span>
              <select
                className="bg-blue-800 border-blue-700 text-white rounded px-2 py-1"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }>
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
              <div className="bg-blue-900 border border-blue-800 rounded-lg p-8 text-center">
                <FileText size={48} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No courses found
                </h3>
                <p className="text-blue-300 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
                  onClick={handleClearFilters}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {isLoading ? (
              <LoadingAnimation />
            ) : courses.length > 0 ? (
              <>
                <CourseTable
                  courses={courses}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
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
              <div className="bg-blue-900 border border-blue-800 rounded-lg p-8 text-center">
                <FileText size={48} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No courses found
                </h3>
                <p className="text-blue-300 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
                  onClick={handleClearFilters}>
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
            onDelete={handleDeleteCourse}
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
