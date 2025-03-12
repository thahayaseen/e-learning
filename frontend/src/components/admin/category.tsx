"use client";
import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import AdminTable from "@/components/admin/adminuserTable";
import { ICategory } from "@/services/interface/CourseDto";
import { addCategory, allCategorys, deleteCategory } from "@/services/fetchdata";
import { InputField } from "../auth/inputFeiled";
import toast from "react-hot-toast";
import EditcategoryComponent from "./editcategoryComponent";

const AdminPanel = () => {
  const [categories, setCategories] = useState<ICategory[] | null>(null);
  const [isopent, setisopen] = useState(false);
  const [selectedCategory, setSelectCategory] = useState<ICategory | null>(
    null
  );
  const handleClose = () => {
    setisopen(false);
    setSelectCategory(null);
  };
  useEffect(() => {
    const fetchcategorys = async () => {
      const datass = await allCategorys();
      console.log(datass, "in panel");
      setCategories(datass);
    };
    fetchcategorys();
  }, []);
  const [newCategory, setNewCategory] = useState({ name: "", Description: "" });
  const [errors, setError] = useState({ name: "", Description: "" });
  const handleDelete=async (id:string)=>{
   await deleteCategory(id)
    setCategories(prev=>
      prev.filter(data=>data._id!==id)
    )

  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    
    setNewCategory({
      ...newCategory,
      [name]: value,
    });
    console.log(newCategory);

    if (errors[name as keyof typeof errors]) {
      setError((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleEdit = (data) => {
    setCategories(prev => 
      prev.map(category => 
        category._id === data._id ? { ...category, ...data } : category
      )
    );
  };
  
  const validate = () => {
    const Nerror = { ...errors };
    let valid = true;
    if (newCategory.name.trim().length == 0) {
      Nerror.name = "Name feiled cannot be empty";
      valid = false;
    }
    if (newCategory.Description.trim().length == 0) {
      Nerror.Description = "Description cannot be empty";
      valid = false;
    }
    setError(Nerror);
    return valid;
  };
  const handleAddCategory = async () => {
    if (!validate()) return;

    const data = await addCategory({
      Category: newCategory.name.trim(),
      Description: newCategory.Description.trim(),
    });
    if (data && data.data) {
      console.log(data.data);

      setCategories((prev) => [...prev, data.data]);
      toast.success(data.message);
    }

    setNewCategory({ name: "", Description: "" });
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
        {
          if (category.createdAt instanceof Date) {
            return new Date(category.createdAt).toLocaleDateString();
          } else {
            return new Date(category.createdAt).toLocaleDateString();
          }
        }
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (category: ICategory) => (
        <div className="flex gap-2 justify-start">
          <button
            onClick={() => {
              setisopen(true);
              setSelectCategory(category);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded">
            Edit
          </button>
          <button onClick={()=>{handleDelete(String(category._id))}} className="px-3 py-1 bg-red-600 text-white rounded">
            Delete
          </button>
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <div className="col-span-2">
          {categories && (
            <AdminTable columns={categoryColumns} data={categories} />
          )}
        </div>

        <div className="w-full col-span-1">
          <Card className="bg-slate-800 border-slate-700  shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Create Category</CardTitle>
              <CardDescription className="text-slate-400">
                Add a new category to your list
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <InputField
                  value={newCategory.name}
                  error={errors.name}
                  onChange={handleInputChange}
                  label="Category Name"
                  name="name"
                  type="text"

                  // className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <InputField
                  // id="description"
                  name="Description"
                  value={newCategory.Description}
                  onChange={handleInputChange}
                  // placeholder="Category Description"
                  error={errors.Description}
                  type="text"
                  label="Description"
                  // className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  // rows={4}
                />
              </div>
              <Button
                className="w-full bg-blue-700 hover:bg-blue-600 text-white"
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
