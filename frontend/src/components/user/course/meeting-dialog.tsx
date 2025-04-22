"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestMeeting: (date: string, time: string) => Promise<boolean>
}

const MeetingDialog = ({ open, onOpenChange, onRequestMeeting }: MeetingDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [selectedTime, setSelectedTime] = useState<string>("10:00")
  const [requestingMeeting, setRequestingMeeting] = useState(false)

  // Calculate available time slots for today (9AM to 5PM in 30 min increments)
  const getTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        slots.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return slots
  }

  const timeSlots = getTimeSlots()

  const handleRequestMeeting = async () => {
    setRequestingMeeting(true)

    try {
      const success = await onRequestMeeting(selectedDate, selectedTime)
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setRequestingMeeting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Request a Meeting</DialogTitle>
          <DialogDescription className="text-gray-600">
            Schedule a one-on-one session with your mentor.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="date" className="text-gray-700">
              Select Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="mt-1 bg-gray-50 border-gray-200"
            />
          </div>
          <div>
            <Label htmlFor="time" className="text-gray-700">
              Select Time
            </Label>
            <Tabs defaultValue={selectedTime} onValueChange={(value) => setSelectedTime(value)} className="mt-1">
              <TabsList className="grid grid-cols-4 gap-2 h-auto p-2 bg-gray-50">
                {timeSlots.map((slot) => (
                  <TabsTrigger
                    key={slot}
                    value={slot}
                    className="py-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    {slot}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRequestMeeting} disabled={requestingMeeting} className="w-full sm:w-auto">
            {requestingMeeting ? "Scheduling..." : "Request Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MeetingDialog
