"use client";
import React, { useEffect, useState, useCallback } from "react";
import { PlusCircle, Trash2, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import AdminTable from "@/components/admin/adminuserTable";
import { ICategory } from "@/services/interface/CourseDto";
import {
  addCategory,
  allCategorys,
  actionCategory,
} from "@/services/fetchdata";
import { InputField } from "../auth/inputFeiled";
import toast from "react-hot-toast";
import EditcategoryComponent from "./editcategoryComponent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationComponent from "../default/pagination";

// Assuming you need to modify your fetch function or create a new one
// This is a placeholder for the actual implementation
const fetchCategoriesWithParams = async (page, limit, search) => {
  try {
    // Update your API endpoint to accept these params
    const response = await allCategorys(
      `?page=${page}&limit=${limit}&search=${search}`
    );

    return response;
  } catch (error) {
 
    throw error;
  }
};

const AdminPanel = () => {
  const [categories, setCategories] = useState<ICategory[] | null>(null);
  const [isopent, setisopen] = useState(false);
  const [selectedCategory, setSelectCategory] = useState<ICategory | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const handleClose = () => {
    setisopen(false);
    setSelectCategory(null);
  };

  // Debouncing function
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data with params whenever page, limit or search term changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Instead of using allCategorys, we use the function that accepts params
        // Replace this with your actual API call
        const response = await fetchCategoriesWithParams(
          currentPage,
          itemsPerPage,
          debouncedSearchTerm
        );
         // Assuming response has this structure
        const { data, total } = response;

        setCategories(data);
        setTotalItems(total);
        setTotalPages(4);
      } catch (error) {
        toast.error("Failed to fetch categories");
 
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const [newCategory, setNewCategory] = useState({ name: "", Description: "" });
  const [errors, setError] = useState({ name: "", Description: "" });

  const handleList = async (id: string, type: boolean) => {
    try {
      await actionCategory(id, type);
      setCategories((prev) =>
        prev.map((data) =>
          data._id === id
            ? {
                ...data,
                unlist: type,
              }
            : data
        )
      );
      toast.success(type ? "Category unlisted" : "Category listed");
    } catch (error) {
      toast.error("Operation failed");
 
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewCategory({
      ...newCategory,
      [name]: value,
    });

    if (errors[name as keyof typeof errors]) {
      setError((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleEdit = (data) => {
    setCategories((prev) =>
      prev.map((category) =>
        category._id === data._id ? { ...category, ...data } : category
      )
    );
  };

  const validate = () => {
    const Nerror = { ...errors };
    let valid = true;
    if (newCategory.name.trim().length === 0) {
      Nerror.name = "Name field cannot be empty";
      valid = false;
    }
    if (newCategory.Description.trim().length === 0) {
      Nerror.Description = "Description cannot be empty";
      valid = false;
    }
    setError(Nerror);
    return valid;
  };

  const handleAddCategory = async () => {
    if (!validate()) return;

    try {
      const data = await addCategory({
        Category: newCategory.name.trim(),
        Description: newCategory.Description.trim(),
      });

      if (data && data.data) {
        // After adding, re-fetch the current page data to update the list
        const response = await fetchCategoriesWithParams(
          currentPage,
          itemsPerPage,
          debouncedSearchTerm
        );

        setCategories(response.data);
        setTotalItems(response.totalCount);
        setTotalPages(response.pages);

        toast.success(data.message);
        setNewCategory({ name: "", Description: "" });
      }
    } catch (error) {
      toast.error("Failed to add category");
 
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const categoryColumns = [
    {
      key: "name",
      header: "Category Name",
      render: (category: ICategory) => category.Category,
    },
    {
      key: "Description",
      header: "Description",
      render: (category: ICategory) => category.Description,
    },
    {
      key: "courseCount",
      header: "Courses",
      render: (category: ICategory) => (
        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">
          {category.CourseId?.length || 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (category: ICategory) => {
        if (category.createdAt instanceof Date) {
          return new Date(category.createdAt).toLocaleDateString();
        } else {
          return new Date(category.createdAt).toLocaleDateString();
        }
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (category: ICategory) => (
        <div className="flex gap-2 justify-start">
          <Button
            onClick={() => {
              setisopen(true);
              setSelectCategory(category);
            }}
            variant="outline"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-none">
            Edit
          </Button>
          <Button
            onClick={() => {
              handleList(String(category._id), !category.unlist);
            }}
            variant="outline"
            size="sm"
            className={`${
              category.unlist
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white border-none`}>
            {category.unlist ? "Unlisted" : "Listed"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white p-6">
      {selectedCategory && (
        <EditcategoryComponent
          open={isopent}
          setisopen={handleClose}
          selectedCategory={selectedCategory}
          handleEdit={handleEdit}
        />
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <Card className="bg-slate-800 border-slate-700 shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-750 p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-white text-xl">Categories</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 w-full"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : categories && categories.length > 0 ? (
                <AdminTable columns={categoryColumns} data={categories} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Filter className="h-12 w-12 mb-2" />
                  <p>No categories found</p>
                  {debouncedSearchTerm && (
                    <p className="text-sm">
                      Try adjusting your search for "{debouncedSearchTerm}"
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            <PaginationComponent itemsPerPage={itemsPerPage} page={currentPage} setPage={setCurrentPage} total={totalItems}/>
          </Card>
        </div>

        <div className="w-full col-span-1">
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-800 to-purple-800">
              <CardTitle className="text-white">Create Category</CardTitle>
              <CardDescription className="text-slate-300">
                Add a new category to your course list
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <InputField
                  value={newCategory.name}
                  error={errors.name}
                  onChange={handleInputChange}
                  label="Category Name"
                  name="name"
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <InputField
                  name="Description"
                  value={newCategory.Description}
                  onChange={handleInputChange}
                  error={errors.Description}
                  type="text"
                  label="Description"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300"
                onClick={handleAddCategory}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
