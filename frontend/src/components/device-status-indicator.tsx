import { Mic, MicOff, Video, VideoOff, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeviceStatusIndicatorProps {
  isVideoOn: boolean
  isMicOn: boolean
  connectionQuality: "good" | "fair" | "poor" | "disconnected"
}

export default function DeviceStatusIndicator({ isVideoOn, isMicOn, connectionQuality }: DeviceStatusIndicatorProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-full w-8 h-8",
          isMicOn ? "bg-green-500/80" : "bg-red-500/80",
        )}
      >
        {isMicOn ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-white" />}
      </div>

      <div
        className={cn(
          "flex items-center justify-center rounded-full w-8 h-8",
          isVideoOn ? "bg-green-500/80" : "bg-red-500/80",
        )}
      >
        {isVideoOn ? <Video className="h-4 w-4 text-white" /> : <VideoOff className="h-4 w-4 text-white" />}
      </div>

      <div
        className={cn(
          "flex items-center justify-center rounded-full w-8 h-8",
          connectionQuality === "good"
            ? "bg-green-500/80"
            : connectionQuality === "fair"
              ? "bg-yellow-500/80"
              : "bg-red-500/80",
        )}
      >
        {connectionQuality === "disconnected" ? (
          <WifiOff className="h-4 w-4 text-white" />
        ) : (
          <Wifi className="h-4 w-4 text-white" />
        )}
      </div>
    </div>
  )
}

