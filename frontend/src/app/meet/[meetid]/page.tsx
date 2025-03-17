"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  MessageSquare,
  X,
  Phone,
  Settings,
  Camera,
  ScreenShare,
  Volume2,
  Maximize2,
  RefreshCw,
  PinIcon,
  UserIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { storeType } from "@/lib/store";
import { useSelector } from "react-redux";
import { useMediaStream } from "@/hooks/use-media-stream";
import { useSocket } from "@/hooks/socketio";
import { usePeerConnections } from "@/hooks/use-peer-connections";

const ImprovedVideoCall = () => {
  const socket = useSocket();
  const user = useSelector((state: storeType) => state.User.user);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [callStatus, setCallStatus] = useState("Waiting to connect");
  const [isPinned, setIsPinned] = useState(false);
  const { meetid: meetId } = useParams();
  const router = useRouter();

  const {
    stream,
    streamRef,
    isVideoOn,
    isMicOn,
    isReconnecting,
    toggleVideo,
    toggleMic,
    handleMediaError,
    updatePeersWithStream,
  } = useMediaStream();

  const {
    peers,
    participants,
    messages,
    setVideoRef,
    remoteVideosRef,
    // sendMessage,
    // notifyVideoStateChange,
    // notifyAudioStateChange,
    // roomFull,
  } = usePeerConnections(streamRef, user, meetId);
  console.log(streamRef, "sttream ref is ");
  console.log(remoteVideosRef, "sttream ref is ");

  const localRef = useRef(null);

  // Handle video toggle with notification to peers
  const handleVideoToggle = async () => {
    await toggleVideo();
    // notifyVideoStateChange(!isVideoOn); // Notify using the future state
  };

  // // Handle audio toggle with notification to peers
  const handleAudioToggle = async () => {
    await toggleMic();
    // notifyAudioStateChange(!isMicOn); // Notify using the future state
  };

  // Update connection status based on participants

  // Connect local video stream to video element
  useEffect(() => {
    if (streamRef?.current && localRef?.current) {
      localRef.current.srcObject = streamRef.current;
    }
  }, [stream, streamRef]);

  // Handle sending chat messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // sendMessage(newMessage);
      setNewMessage("");
    }
  };

  // Toggle pinned video
  const togglePinVideo = () => {
    setIsPinned(!isPinned);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Main Video Area */}
      <div className={`flex-1 flex flex-col ${isChatOpen ? "pr-4" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-800 to-slate-800">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold">Video Call</h1>
            <Badge
              variant="outline"
              className={`ml-2 ${
                isConnected ? "bg-green-600" : "bg-amber-600"
              }`}>
              {callStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-blue-300">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 flex flex-col relative">
          {/* Main Video (Remote or Pinned) */}
          <Card className="flex-1 bg-slate-800 border-slate-700 rounded-xl overflow-hidden shadow-lg mb-4">
            <div className="h-full w-full relative">
          
                <video
                  key={1}
                  ref={remoteVideosRef}
                  autoPlay
                  playsInline
                  className="remote-video"
                />
              

              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-5 right-5">
                {isVideoOn ? (
                  <Card className="h-32 w-40 flex-shrink-0 bg-slate-800 border-slate-700 rounded-xl overflow-hidden shadow-lg relative">
                    <video
                      ref={localRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-white bg-opacity-60 px-2 py-0.5 rounded-md text-xs backdrop-blur-sm">
                      You
                    </div>
                    <div className="absolute top-1 right-1">
                      <svg
                        className={`h-4 w-4 ${
                          isConnected ? "text-green-500" : "text-gray-400"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor">
                        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                      </svg>
                    </div>
                  </Card>
                ) : (
                  <Card className="h-24 w-32 flex-shrink-0 bg-slate-700 border-slate-600 rounded-xl overflow-hidden shadow-lg relative flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-slate-400" />
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 px-2 py-0.5 rounded-md text-xs backdrop-blur-sm">
                      You (Camera Off)
                    </div>
                    <div className="absolute top-1 right-1">
                      <svg
                        className={`h-4 w-4 ${
                          isConnected ? "text-green-500" : "text-gray-400"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor">
                        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                      </svg>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Video labels and controls */}
            <div className="absolute bottom-10 left-7 bg-white bg-opacity-60 px-3 py-1 rounded-md text-sm backdrop-blur-sm"></div>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePinVideo}
                className="rounded-full bg-black bg-opacity-30 backdrop-blur-sm border-none">
                <PinIcon
                  className={`h-4 w-4 ${isPinned ? "text-blue-400" : ""}`}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black bg-opacity-30 backdrop-blur-sm border-none">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-black bg-opacity-30 backdrop-blur-sm border-none">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gradient-to-r from-slate-800 to-blue-900 rounded-t-xl mx-4 mb-4 flex items-center justify-center space-x-6 shadow-lg">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 ${
              isMicOn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-red-600 hover:bg-red-700"
            } border-none`}
            onClick={handleAudioToggle}>
            {isMicOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 ${
              isVideoOn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-red-600 hover:bg-red-700"
            } border-none`}
            onClick={handleVideoToggle}>
            {isVideoOn ? (
              <Camera className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 bg-blue-600 hover:bg-blue-700 border-none">
            <ScreenShare className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 ${
              isChatOpen
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-slate-700 hover:bg-slate-600"
            } border-none`}
            onClick={() => setIsChatOpen(!isChatOpen)}>
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 bg-red-600 hover:bg-red-700 border-none"
            onClick={() => router.push("/course")}>
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col shadow-lg">
          <div className="p-4 flex items-center justify-between border-b border-slate-700 bg-gradient-to-r from-slate-800 to-blue-900">
            <h2 className="font-bold">Chat</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-sm text-blue-400">
                    {message.username}
                  </div>
                  <div className="text-xs text-slate-400">
                    {message.timestamp}
                  </div>
                </div>
                <div
                  className={`text-sm mt-1 p-3 rounded-md ${
                    message.username === user?.name ||
                    message.username === "You"
                      ? "bg-blue-800 ml-4 rounded-tr-none"
                      : message.username === "System"
                      ? "bg-slate-700 text-center italic"
                      : "bg-slate-700 mr-4 rounded-tl-none"
                  }`}>
                  {message.message}
                </div>
              </div>
            ))}
          </ScrollArea>
          <Separator />
          <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-700 border-slate-600"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ImprovedVideoCall;
