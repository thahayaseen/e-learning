"use client"
import CourseView from '@/components/courses/viewCourse'
import { useParams } from 'next/navigation'
import React from 'react'

function Course() {
const params=useParams()
  return (
    <div>
      <CourseView id={params.id}/>
    </div>
  )
}

export default Course
