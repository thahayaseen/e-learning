"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

// Define validation schema
const contentFormSchema = z.object({
  Content: z.string().optional(),
})

interface CourseContentProps {
  content: string
  updateContent: (content: string) => void
}

const CourseContent = ({ content, updateContent }: CourseContentProps) => {
  // Form setup
  const form = useForm({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      Content: content || "",
    },
  })

  // Update form when content changes
  useEffect(() => {
    form.reset({
      Content: content || "",
    })
  }, [content, form])

  // Auto-save when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.Content !== undefined) {
        updateContent(value.Content)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, updateContent])

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="Content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-700">Course Overview Content</FormLabel>
              <FormDescription className="text-blue-600">
                This content will be shown on the course landing page
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Add detailed information about the course"
                  className="min-h-64 border-blue-200 focus:border-blue-500 hover:border-blue-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default CourseContent

