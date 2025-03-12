import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { ICategory } from "@/services/interface/CourseDto";
import { useForm, FormProvider } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editcourse } from "@/services/fetchdata";
function EditcategoryComponent({
  open,
  setisopen,
  selectedCategory,
  handleEdit
}: {
  open: boolean;
  setisopen: () => void;
  selectedCategory: ICategory;
}) {
  const formSchema = z.object({
    Category: z
      .string()
      .min(3, "Category name must be at least 3 characters long"),
    Description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Category: selectedCategory.Category,
      Description: selectedCategory.Description,
    },
  });

  const onSubmit = (data: Omit<ICategory,'createdAt'>) => {
    const changedata:Partial<ICategory>={}
    for (const i in data) {
      const key = i as keyof  Omit<ICategory,'createdAt'>;

      console.log(data[key], key);
      console.log(selectedCategory[key]);

      if (data[key] !== selectedCategory[key]) {
        changedata[key]=data[key]
        console.log(data[key]);
      }
    }
    console.log('changed is',changedata);
    editcourse(String(selectedCategory._id),changedata)
    console.log("Form Data:", data);
    data._id=selectedCategory._id
    handleEdit(data)
    setisopen();
  };

  return (
    <Dialog open={open} onOpenChange={setisopen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Modify category details below</DialogDescription>
        </DialogHeader>

        {/* Wrap with FormProvider */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Name */}
            <FormField
              control={form.control}
              name="Category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="Description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit & Cancel Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setisopen();
                }}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export default EditcategoryComponent;
