"use client"
import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Edit, X, Calendar, Clock, Video } from "lucide-react"
import { changeStatusMeet, getMeetings, updateMeetingTime } from "@/services/fetchdata"
import { useSelector } from "react-redux"
import type { storeType } from "@/lib/store"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useRouter } from "next/navigation"

export default function MentorMeetingsTable() {
  // Pagination and filtering states
  const [meetings, setMeetings] = useState([])
  const [filteredMeetings, setFilteredMeetings] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalMeetings, setTotalMeetings] = useState(0)
const router=useRouter()
  // Editing states
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
  })

  // Debounce search updates
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const state = useSelector((state: storeType) => state.User)

  // Apply debouncing to search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])

  // Generate URL with current filters and pagination
  const generateUrl = useCallback(() => {
    const url = new URLSearchParams()

    // Add pagination parameters
    url.append("page", String(page))
    url.append("limit", String(limit))

    // Add filters if they exist
    if (debouncedSearchTerm) {
      url.append("search", debouncedSearchTerm)
    }

    if (statusFilter !== "all") {
      url.append("status", statusFilter)
    }

    return url.toString()
  }, [page, limit, debouncedSearchTerm, statusFilter])

  // Handler for date changes
  const handleDateChange = async (e, meetingId) => {
    const datePart = e.target.value // format: '2025-04-07'

    setEditForm({
      ...editForm,
      date: datePart,
    })

    // Update the meeting time directly on change if already editing
    if (editingMeeting === meetingId) {
      await updateDateTime(meetingId)
    }
  }

  // Handler for time changes
  const handleTimeChange = async (e, meetingId) => {
    const timePart = e.target.value // format: '14:30'

    setEditForm({
      ...editForm,
      time: timePart,
    })

    // Update the meeting time directly on change if already editing
    if (editingMeeting === meetingId) {
      await updateDateTime(meetingId)
    }
  }

  // Update date and time on the backend
  const updateDateTime = async (meetingId) => {
    try {
      // Combine date and time into a new Date object
      const [year, month, day] = editForm.date.split("-")
      const [hours, minutes] = editForm.time.split(":")
      const newScheduledTime = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes))

      // Make API call to update the meeting time
      await updateMeetingTime(meetingId, newScheduledTime)

      // Update local state after successful API call
      const updatedMeetings = meetings.map((meeting) =>
        meeting._id === meetingId
          ? {
              ...meeting,
              scheduledTime: newScheduledTime,
            }
          : meeting,
      )

      setMeetings(updatedMeetings)
      setFilteredMeetings(
        updatedMeetings.filter((meeting) => statusFilter === "all" || meeting.status === statusFilter),
      )
    } catch (error) {
      console.error("Error updating meeting time:", error)
      // You could add toast notification here
    }
  }

  // Fetch meetings with the current URL parameters
  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true)

      const url = generateUrl()
      const data = await getMeetings(url)

      // Check if data.result exists and is an array
      if (data && data.result && Array.isArray(data.result.data)) {
        setMeetings(data.result.data)
        setFilteredMeetings(data.result.data)
        setTotalMeetings(data.result.total || data.result.data.length)
      } else {
        console.error("Invalid data format received:", data)
        setMeetings([])
        setFilteredMeetings([])
        setTotalMeetings(0)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching meetings:", error)
      setLoading(false)
      setMeetings([])
      setFilteredMeetings([])
    }
  }, [generateUrl])

  // Load meetings when filters change
  useEffect(() => {
    // Update URL in browser history without page refresh
    const newUrl = generateUrl()
    window.history.replaceState(null, "", "/mentor/meets?" + newUrl)

    // Fetch meetings with the new URL
    fetchMeetings()
  }, [page, limit, debouncedSearchTerm, statusFilter, fetchMeetings])

  // Handle status change directly
  const handleStatusChange = async (meetingId, newStatus) => {
    try {
      // Call API to update status
      await changeStatusMeet(newStatus, meetingId)

      // Update local state after successful API call
      const updatedMeetings = meetings.map((meeting) =>
        meeting._id === meetingId ? { ...meeting, status: newStatus } : meeting,
      )

      setMeetings(updatedMeetings)
      setFilteredMeetings(
        updatedMeetings.filter((meeting) => statusFilter === "all" || meeting.status === statusFilter),
      )
    } catch (error) {
      console.error("Error updating meeting status:", error)
      // You could add toast notification here
    }
  }

  // Start editing meeting time
  const startEditing = (meeting) => {
    // Format date and time for the input fields
    const date = formatDateForInput(meeting.scheduledTime)
    const time = formatTimeForInput(meeting.scheduledTime)

    setEditForm({
      date,
      time,
    })

    setEditingMeeting(meeting._id)
  }

  // Join meeting handler
  const handleJoinMeeting = (meetingId) => {
    router.push('/meet/'+meetingId)
  }

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata", // IST timezone
    })
  }

  // Format date for input field
  const formatDateForInput = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Format time for input field
  const formatTimeForInput = (date) => {
    const d = new Date(date)
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  // Get status badge class
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "approved":
        return "success"
      case "rejected":
        return "destructive"
      case "canceled":
        return "secondary"
      default:
        return "secondary"
    }
  }

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  // Handle limit change for pagination
  const handleLimitChange = (value) => {
    setLimit(Number(value))
    setPage(1) // Reset to first page when changing limit
  }

  return (
    <Card className="w-full bg-gray-900 text-gray-100 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-300">Mentor Meetings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by username..."
              className="pl-10 pr-4 py-2 border-gray-700 bg-gray-800 text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative sm:w-64">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="border-gray-700 bg-gray-800 text-gray-100">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800 text-gray-100">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Meetings Table */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading meetings...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-md text-center">
            <p className="text-gray-300 text-lg">No meetings found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Mentor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting._id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-100">{meeting.user?.name || "Unknown User"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-100">{meeting.course?.Title || "Unknown Course"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-100">{state.user?.name || "Unknown Mentor"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingMeeting === meeting._id ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                            <input
                              type="date"
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm w-full"
                              value={editForm.date}
                              onChange={(e) => handleDateChange(e, meeting._id)}
                            />
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-400" />
                            <input
                              type="time"
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm w-full"
                              value={editForm.time}
                              onChange={(e) => handleTimeChange(e, meeting._id)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-center text-gray-100">
                            <Calendar className="h-4 w-4 mr-1 text-blue-400" />
                            {formatDate(meeting.scheduledTime)}
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(meeting.scheduledTime)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={meeting.status}
                        onValueChange={(value) => handleStatusChange(meeting._id, value)}
                        disabled={meeting.status === "canceled"}
                      >
                        <SelectTrigger className="h-8 border-0 bg-transparent px-2 -ml-1 w-full">
                          <Badge variant={getStatusBadgeVariant(meeting.status)}>
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent className="border-gray-700 bg-gray-800 text-gray-100">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {editingMeeting === meeting._id ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingMeeting(null)}
                            className="text-xs flex items-center"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Done
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(meeting)}
                            className="bg-transparent text-xs border-gray-600 text-gray-300 flex items-center"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Time
                          </Button>
                        )}

                        {meeting.status === "approved" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleJoinMeeting(meeting._id)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs flex items-center"
                          >
                            <Video className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-gray-400 mb-4 sm:mb-0">
            Showing {filteredMeetings.length} of {totalMeetings} meetings
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-400">Items per page:</span>
              <Select value={limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="h-8 w-20 border-gray-700 bg-gray-800 text-gray-200">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800 text-gray-100">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`border-gray-700 ${
                  page === 1 ? "text-gray-500 cursor-not-allowed" : "text-gray-200 hover:bg-gray-700"
                }`}
              >
                Previous
              </Button>

              <span className="bg-blue-600 text-blue-100 px-3 py-1 rounded text-sm">{page}</span>

              {totalMeetings > page * limit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

