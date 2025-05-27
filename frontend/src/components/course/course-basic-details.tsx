"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, IndianRupee, Loader2, Upload, X } from "lucide-react"
import { allCategorys } from "@/services/fetchdata"
import Image from "next/image"

// Define validation schema
const courseFormSchema = z.object({
  Title: z.string().min(1, "Title is required"),
  Description: z.string().min(10, "Description should be at least 10 characters"),
  Price: z.coerce.number().min(0, "Price cannot be negative"),
  Category: z.string().min(1, "Category is required"),
})

interface CourseBasicDetailsProps {
  courseData: any
  updateCourseData: (data: any) => void
  imageFile: File | null
  imagePreview: string
  onImageChange: (file: File | null, preview: string) => void
  uploading: boolean
}

const CourseBasicDetails = ({
  courseData,
  updateCourseData,
  imageFile,
  imagePreview,
  onImageChange,
  uploading,
}: CourseBasicDetailsProps) => {
  const [categories, setCategories] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form setup
  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      Title: courseData.Title || "",
      Description: courseData.Description || "",
      Price: courseData.Price || 0,
      Category: courseData.Category || "",
    },
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await allCategorys()
         setCategories(data.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Update form when courseData changes
  useEffect(() => {
    form.reset({
      Title: courseData.Title || "",
      Description: courseData.Description || "",
      Price: courseData.Price || 0,
      Category: courseData.Category || "",
    })
  }, [courseData, form])

  // Handle form submission
  const onSubmit = (data: z.infer<typeof courseFormSchema>) => {
    updateCourseData(data)
  }

  // Auto-save when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.values(value).some((val) => val !== undefined)) {
        updateCourseData(value)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, updateCourseData])

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageChange(file, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove uploaded image
  const removeImage = () => {
    onImageChange(null, "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="Title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-700">Course Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter course title"
                  {...field}
                  className="border-blue-200 focus:border-blue-500 text-white hover:border-blue-400"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-700">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a detailed description"
                  className="min-h-16 border-blue-200 focus:border-blue-500  text-white hover:border-blue-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="Category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500  text-white hover:border-blue-400">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.Category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700">Price (Rs)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                    <Input
                      type="number"
                      className="pl-10 border-blue-200 focus:border-blue-500  text-white hover:border-blue-400"
                      placeholder="0.00"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <FormLabel className="text-blue-700">Course Cover Image</FormLabel>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:bg-blue-50 transition-colors">
            {!imagePreview ? (
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-blue-400" />
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            ) : (
              <div className="relative">
                {uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-blue-600 font-medium">Uploading...</span>
                  </div>
                ) : null}
                <Image
                  width={400}
                  height={200}
                  src={imagePreview || "/placeholder.svg"}
                  alt="Course cover preview"
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="text-sm text-blue-600 mt-2 font-medium">{imageFile?.name}</p>
                {courseData.image && (
                  <p className="text-xs text-green-600 mt-1">✓ Uploaded to S3: {courseData.image.split("/").pop()}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CourseBasicDetails

