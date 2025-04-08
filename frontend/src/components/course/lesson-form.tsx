"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// Define validation schema
const lessonFormSchema = z.object({
  Lessone_name: z.string().min(1, "Lesson name is required"),
  Content: z.string().min(10, "Content should be at least 10 characters"),
})

interface LessonFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonData: any | null
  onSave: (data: any) => void
}

const LessonForm = ({ open, onOpenChange, lessonData, onSave }: LessonFormProps) => {
  // Form setup
  const form = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      Lessone_name: "",
      Content: "",
    },
  })

  // Update form when lessonData changes
  useEffect(() => {
    if (lessonData) {
      form.reset({
        Lessone_name: lessonData.Lessone_name || "",
        Content: lessonData.Content || "",
      })
    } else {
      form.reset({
        Lessone_name: "",
        Content: "",
      })
    }
  }, [lessonData, form, open])

  // Handle form submission
  const onSubmit = (data: z.infer<typeof lessonFormSchema>) => {
    onSave(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-blue-800">{lessonData ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="Lessone_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700">Lesson Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter lesson name"
                      {...field}
                      className="border-blue-200 focus:border-blue-500 hover:border-blue-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700">Lesson Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter lesson content"
                      className="min-h-32 border-blue-200 focus:border-blue-500 hover:border-blue-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Lesson
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default LessonForm

