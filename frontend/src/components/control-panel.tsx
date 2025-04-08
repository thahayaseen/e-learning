"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Layout, LayoutGrid } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ControlPanelProps {
  isMicOn: boolean
  isVideoOn: boolean
  layoutMode: "grid" | "spotlight"
  onToggleMic: () => void
  onToggleVideo: () => void
  onToggleLayout: () => void
  onEndCall: () => void
}

export function ControlPanel({
  isMicOn,
  isVideoOn,
  layoutMode,
  onToggleMic,
  onToggleVideo,
  onToggleLayout,
  onEndCall,
}: ControlPanelProps) {
  return (
    <div className="py-4 flex justify-center items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMicOn ? "default" : "destructive"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleMic}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMicOn ? "Mute microphone" : "Unmute microphone"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleVideo}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoOn ? "Turn off camera" : "Turn on camera"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={onEndCall}>
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>End call</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={onToggleLayout}>
              {layoutMode === "grid" ? <LayoutGrid className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle layout mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

