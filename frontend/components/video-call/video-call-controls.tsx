"use client"

import { Button } from "../ui/button"
import { Mic, MicOff, VideoOff, ScreenShare, MessageSquare, Phone, Camera } from "lucide-react"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

interface VideoCallControlsProps {
  isMicOn: boolean
  isVideoOn: boolean
  isChatOpen: boolean
  handleAudioToggle: () => Promise<void>
  handleVideoToggle: () => Promise<void>
  setIsChatOpen: (isOpen: boolean) => void
  router: AppRouterInstance
}

const VideoCallControls = ({
  isMicOn,
  isVideoOn,
  isChatOpen,
  handleAudioToggle,
  handleVideoToggle,
  setIsChatOpen,
  router,
}: VideoCallControlsProps) => {
  return (
    <div className="p-6 bg-gradient-to-r from-slate-800 to-blue-900 rounded-t-xl mx-4 mb-4 flex items-center justify-center space-x-6 shadow-lg">
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full h-12 w-12 ${
          isMicOn ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
        } border-none`}
        onClick={handleAudioToggle}
      >
        {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full h-12 w-12 ${
          isVideoOn ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
        } border-none`}
        onClick={handleVideoToggle}
      >
        {isVideoOn ? <Camera className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
      {/* <Button
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 bg-blue-600 hover:bg-blue-700 border-none"
      >
        <ScreenShare className="h-5 w-5" />
      </Button> */}
      {/* <Button
        variant="outline"
        size="icon"
        className={`rounded-full h-12 w-12 ${
          isChatOpen ? "bg-blue-500 hover:bg-blue-600" : "bg-slate-700 hover:bg-slate-600"
        } border-none`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <MessageSquare className="h-5 w-5" />
      </Button> */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 bg-red-600 hover:bg-red-700 border-none"
        onClick={() => router.back()}
      >
        <Phone className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default VideoCallControls

