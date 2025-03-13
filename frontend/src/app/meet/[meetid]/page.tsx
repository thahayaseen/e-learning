"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  Pin,
  PinOff,
  Send,
} from "lucide-react";
import { useSocket } from "@/hooks/socketio";
import { chatEnum } from "@/app/course/chat/[id]/page";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import SimplePeer from "simple-peer";

export default function VideoChat() {
  const socket = useSocket();
  const { meetid } = useParams();
  const [messages, setMessages] = useState([]);
  const user = useSelector((state) => state.User.user);
  const [inputMessage, setInputMessage] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState({});
  const streamRef = useRef<MediaStream | null>(null);
  interface users {
    id: string;
    name: string;
    email: string;
    isLocal: boolean;
  }
  const [participants, setParticipants] = useState<users[]>([]);
  const [pinnedUser, setPinnedUser] = useState(null);
  const myVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const messagesEndRef = useRef(null);

  // Get local media stream
  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: isMicOn,
        });

        setStream(mediaStream.clone());
        console.log("mediaStream", mediaStream);

        streamRef.current = mediaStream;
        console.log("Media Stream: ", stream); // ✅ Debug
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream.clone();
        }
      } catch (error) {
        console.error("Error getting media stream:", error);
        toast.error("Could not access camera or microphone");
      }
    };

    getMedia();

    return () => {
      // Clean up stream tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMicOn, isVideoOn]);

  // Handle socket connections
  useEffect(() => {
    if (!socket || !meetid || !user) return;

    // Add self to participants
    setParticipants([
      {
        id: user.id || socket.id,
        name: user.name || "You",
        email: user.email,
        isLocal: true,
      },
    ]);

    // Join the meeting
    socket.emit(chatEnum.joinmeet, String(meetid), user.email, user.name);

    // Listen for new user connections
    socket.on(chatEnum.userConnected, (data) => {
      console.log("yser connected");

      toast.success(`${data.username} joined the meeting`);
      console.log(data);

      // Add the new user to participants
      setParticipants((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.username,
          email: data.email,
          isLocal: false,
        },
      ]);
      console.log("Media Stream:2 ", streamRef.current); // ✅ Debug

      // Initiate call to the new user
      // if (streamRef.current) {
        console.log("try to start");

        createPeer(data.id, true);
      // }
    });

    // Listen for user disconnections
    // socket.on(chatEnum.userDisconnected, (data) => {
    //   toast.info(`${data.username} left the meeting`);

    //   // Remove the user from participants
    //   setParticipants((prev) => prev.filter((p) => p.id !== data.id));

    //   // Close and remove peer connection
    //   if (peers[data.id]) {
    //     peers[data.id].destroy();
    //     const newPeers = { ...peers };
    //     delete newPeers[data.id];
    //     setPeers(newPeers);
    //   }
    // });

    // Listen for signal data
    socket.on(chatEnum.signal, (data) => {
      handleSignal(data);
    });

    // // Listen for chat messages
    // socket.on(chatEnum.message, (data) => {
    //   setMessages((prev) => [
    //     ...prev,
    //     {
    //       id: Date.now(),
    //       user: data.from,
    //       content: data.message,
    //     },
    //   ]);
    // });

    // Listen for errors
    socket.on(chatEnum.error, (data) => {
      console.error("Socket error:", data);
      toast.error(data);
    });

    // Clean up
    return () => {
      socket.off(chatEnum.joinmeet);
      socket.off(chatEnum.userConnected);
      // socket.off(chatEnum.userDisconnected);
      socket.off(chatEnum.signal);
      // socket.off(chatEnum.message);
      socket.off(chatEnum.error);

      // Leave the meeting
      socket.emit(chatEnum.leaveMeet, meetid);

      // Destroy all peer connections
      for (const peerId in peers) {
        if (peers[peerId]) {
          peers[peerId].destroy();
        }
      }
    };
  }, [socket, meetid, user, stream, peers]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Create a peer connection
  const createPeer = (remoteId, isInitiator) => {
    console.log(streamRef);
    
    if (!streamRef.current) return null;

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      stream: streamRef.current,
    });
    peer.on("connect", () => {
      console.log("peer condected");
    });
    // Handle peer signals
    peer.on("signal", (signal) => {
      if (socket) {
        socket.emit(chatEnum.signal, {
          signal,
          to: remoteId,
          from: socket.id,
          initiator: isInitiator,
        });
      }
    });

    // Handle remote stream
    peer.on("stream", (remoteStream) => {
      const videoElement = remoteVideosRef.current[remoteId];
      if (videoElement) {
        videoElement.srcObject = remoteStream;
      }
    });

    // Handle peer errors
    peer.on("error", (err) => {
      console.error("Peer error:", err);
      toast.error("Connection error");
    });

    // Update peers state
    setPeers((prev) => ({ ...prev, [remoteId]: peer }));

    return peer;
  };

  // Handle incoming signals
  const handleSignal = (data) => {
    const { signal, from, initiator } = data;

    // If we already have a peer for this user, just signal it
    if (peers[from]) {
      peers[from].signal(signal);
    } else if (!initiator) {
      // If we don't have a peer and we're not the initiator, create one
      const peer = createPeer(from, false);
      if (peer) {
        peer.signal(signal);
      }
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  // End call
  const endCall = () => {
    // Destroy all peer connections
    for (const peerId in peers) {
      if (peers[peerId]) {
        peers[peerId].destroy();
      }
    }

    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Leave the meeting
    if (socket) {
      socket.emit(chatEnum.leaveMeet, meetid);
    }

    // Show success message
    toast.success("Call ended");

    // Navigate back to previous page
    // You might want to implement this based on your navigation system
  };

  // Send chat message
  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        user: user?.name || "You",
        content: inputMessage,
      };

      // Add message to local state
      setMessages((prev) => [...prev, newMessage]);

      // Send message through socket to all participants
      if (socket) {
        socket.emit(chatEnum.message, {
          meetid,
          message: inputMessage,
          from: user?.name || "You",
        });
      }

      // Clear input
      setInputMessage("");
    }
  };

  // Toggle pin user
  const togglePin = (userId) => {
    console.log("clicked pinned");

    if (pinnedUser === userId) {
      setPinnedUser(null);
    } else {
      setPinnedUser(userId);
    }
  };

  // Get user data by ID
  const getUserById = (userId) => {
    return participants.find((p) => p.id === userId) || { name: "Unknown" };
  };

  // Render participant videos
  const renderParticipantVideos = () => {
    if (pinnedUser !== null) {
      // Pinned view
      const pinnedParticipant = getUserById(pinnedUser);
      const otherParticipants = participants.filter((p) => p.id !== pinnedUser);

      return (
        <div className="flex-1 flex flex-col gap-4 mb-4">
          {/* Main pinned video */}
          <Card className="flex-1 bg-slate-800 relative overflow-hidden rounded-lg">
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm">
                {pinnedParticipant.name == user.name
                  ? "You"
                  : pinnedParticipant.name}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50"
                onClick={() => togglePin(pinnedUser)}>
                <PinOff className="h-4 w-4" />
              </Button>

              {pinnedParticipant.isLocal ? (
                <video
                  ref={myVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={(el) => (remoteVideosRef.current[pinnedUser] = el)}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </CardContent>
          </Card>

          {/* Row of thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {otherParticipants.map((participant) => (
              <Card
                key={participant.id}
                className="h-24 w-32 flex-shrink-0 bg-slate-800 relative overflow-hidden rounded-lg">
                <CardContent className="p-0 h-full flex items-center justify-center">
                  <div className="absolute top-2 left-2 bg-black/50 px-2 py-0.5 rounded-full text-xs">
                    {participant.name == user.name ? "You" : participant.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 h-6 w-6"
                    onClick={() => togglePin(participant.id)}>
                    <Pin className="h-3 w-3" />
                  </Button>

                  {participant.isLocal ? (
                    <video
                      ref={myVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={(el) =>
                        (remoteVideosRef.current[participant.id] = el)
                      }
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    } else {
      // Grid view
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-1">
          {participants.map((participant, index) => (
            <Card
              key={index}
              className="bg-slate-800 relative overflow-hidden h-full rounded-lg">
              <CardContent className="p-0 h-full flex items-center justify-center">
                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm">
                  {participant.name == user.name ? "You" : participant.name}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/30 hover:bg-black/50"
                  onClick={() => togglePin(participant.id)}>
                  <Pin className="h-4 w-4" />
                </Button>

                {participant.isLocal ? (
                  <video
                    ref={myVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={(el) => (remoteVideosRef.current[participant.id] = el)}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Video Meeting</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant={showChat ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className="transition-colors">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            {participants.length} participants
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 p-4 flex flex-col">
          {renderParticipantVideos()}

          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              variant={isMicOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleMic}
              className="rounded-full h-12 w-12 shadow-lg">
              {isMicOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              className="rounded-full h-12 w-12 shadow-lg">
              {isVideoOn ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={endCall}
              className="rounded-full h-12 w-12 shadow-lg">
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat Section */}
        {showChat && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              <h2 className="font-semibold">Chat</h2>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-slate-500 text-center my-8">
                  No messages yet
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col">
                      <div className="font-medium text-sm text-slate-400">
                        {message.user}
                      </div>
                      <div className="mt-1 text-white">{message.content}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
