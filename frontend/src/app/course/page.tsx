"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  Search,
  Filter,
  X,
  DollarSign,
  ArrowUpDown,
  Star,
  BookOpen,
  Zap,
} from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Services and Components
import {
  getAllcourseUser,
  allCategorys,
  fetchMentors,
} from "@/services/fetchdata";
import { Explore } from "@/components/mybtns/myBtns";
import PaginationComponent from "@/components/default/pagination";
import { Debouncing } from "@/services/debauncing";
import { useRouter } from "next/navigation";

// Types and Interfaces
interface Mentor {
  _id: string;
  name: string;
  avatar?: string;
}

interface Course {
  _id: string;
  Title: string;
  Description: string;
  Price: number;
  image: string;
  Level: string;
  Category: string;
  Mentor: string;
  Mentor_id: string;
  enrolledCount: number;
  duration?: number;
  rating?: number;
}

interface PaginationData {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

const CourseList: React.FC = () => {
  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const ITEMS_PER_PAGE = 2;
  console.log(mentorFilter, "filter is ");

  // Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Categories and Mentors
        const [categoriesResponse, mentorsResponse] = await Promise.all([
          allCategorys(),
          fetchMentors(),
        ]);

        // Process Categories
        const categoryNames = categoriesResponse.map((cat: any) =>
          typeof cat === "string" ? cat : cat.name || "Uncategorized"
        );
        setCategories(categoryNames);
        setMentors(mentorsResponse);

        // Parse URL Parameters
        const params = new URLSearchParams(window.location.search);
        console.log(params, "url is ");

        const urlParams = {
          search: params.get("search"),
          level: params.get("level"),
          price: params.get("price"),
          category: params.get("category"),
          mentor: params.get("mentor"),
          sort: params.get("sort"),
          page: params.get("page"),
        };

        // Update States from URL
        urlParams.search && setSearchTerm(urlParams.search);
        urlParams.level && setLevelFilter(urlParams.level);
        urlParams.price && setPriceFilter(urlParams.price);
        urlParams.category && setCategoryFilter(urlParams.category);
        urlParams.mentor && setMentorFilter(urlParams.mentor);
        urlParams.sort && setSortBy(urlParams.sort);
        urlParams.page && setCurrentPage(Number.parseInt(urlParams.page) || 1);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Courses Effect
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const filterObj: any = {};

        // Apply Filters
        if (levelFilter !== "all") filterObj.level = levelFilter;
        if (categoryFilter !== "all") filterObj.category = categoryFilter;
        if (mentorFilter !== "all") filterObj.mentor = mentorFilter;
        if (searchTerm) filterObj.search = searchTerm;

        // Price Filtering
        if (priceFilter !== "all") {
          filterObj.price = {};
          switch (priceFilter) {
            case "low":
              filterObj.price = { min: 0, max: 70 };
              break;
            case "medium":
              filterObj.price = { min: 71, max: 100 };
              break;
            case "high":
              filterObj.price = { min: 101 };
              break;
          }
        }

        // Sorting Configuration
        const sortConfig = {
          field: "UpdatedAt",
          order: "desc",
        };

        switch (sortBy) {
          case "most-enrolled":
            sortConfig.field = "enrolledCount";
            sortConfig.order = "desc";
            break;
          case "price-low":
            sortConfig.field = "Price";
            sortConfig.order = "asc";
            break;
          case "price-high":
            sortConfig.field = "Price";
            sortConfig.order = "desc";
            break;
        }

        // Fetch Courses
        const response: PaginationData = await getAllcourseUser({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          filter: filterObj,
          sort: sortConfig,
        });

        setCourses(response.courses);
        setTotalPages(response.totalPages);
        setTotalCourses(response.total);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setTotalPages(0);
        setTotalCourses(0);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchCourses();
    }, 200);
    return () => clearTimeout(debounceTimeout);
  }, [
    searchTerm,
    levelFilter,
    priceFilter,
    categoryFilter,
    mentorFilter,
    sortBy,
    currentPage,
  ]);

  // Utility Functions
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0
      ? `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`
      : `${minutes}m`;
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm("");
    setLevelFilter("all");
    setPriceFilter("all");
    setCategoryFilter("all");
    setMentorFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
    window.history.pushState({}, "", window.location.pathname);
  };

  // Course Card Animation Variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };
  const router = useRouter();
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 min-h-screen p-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white">
            Explore Transformative Courses
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            Discover expert-led learning experiences that empower your personal
            and professional growth
          </p>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-slate-800/70 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-2xl mb-8 max-w-5xl mx-auto">
            <form className="space-y-4">
              {/* Search and Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2 relative">
                  <Input
                    type="text"
                    placeholder="Search courses, mentors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600/30 text-slate-200 placeholder:text-slate-400"
                  />
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                </div>

                {/* Price Filter */}
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/30 text-slate-200">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Price</SelectItem>
                    <SelectItem value="low">Budget (≤ ₹70)</SelectItem>
                    <SelectItem value="medium">Standard (₹71-100)</SelectItem>
                    <SelectItem value="high">Premium (≥ ₹101)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Filter */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/30 text-slate-200">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="most-enrolled">Most Enrolled</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700">
                  <X className="mr-2 h-4 w-4" /> Reset Filters
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Courses Section */}
          <div className="space-y-6">
            {/* Results Info */}
            <div className="flex justify-between items-center px-2">
              <p className="text-slate-400">
                {loading
                  ? "Loading courses..."
                  : `${totalCourses} courses found`}
              </p>
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="grid place-items-center py-20">
                <div className="animate-pulse text-xl text-slate-400">
                  Loading courses...
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🤷‍♀️</p>
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="mt-4">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <motion.div key={course._id} variants={cardVariants}>
                    <Card
                      onClick={() => router.push("/course/" + course._id)}
                      className="bg-slate-800/70 border-slate-700/50 backdrop-blur-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={course.image || "/api/placeholder/500/280"}
                          alt={course.Title}
                          fill
                          className="object-cover transition-transform hover:scale-110"
                        />
                        <Badge className="absolute top-3 right-3 bg-blue-600">
                          {course.Level}
                        </Badge>
                      </div>

                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-white line-clamp-2">
                          {course.Title}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          by {course.Mentor || "Unknown Mentor"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pb-2">
                        <p className="text-slate-300 text-sm line-clamp-3 mb-3">
                          {course.Description}
                        </p>
                        <Explore _id={course._id} />
                      </CardContent>

                      <CardFooter className="border-t border-slate-700/50 pt-3 flex justify-between items-center">
                        <div className="flex items-center space-x-3 text-slate-400">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDuration(course.duration || 3600)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Course Duration</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {course.enrolledCount || 0}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                Total Enrolled Students
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="font-bold text-white">
                          ₹ {course.Price?.toFixed(2) || "0.00"}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {courses.length > 0 && (
              <div className="mt-8 flex justify-center">
                <PaginationComponent
                  page={currentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  total={totalCourses}
                  setPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseList;
