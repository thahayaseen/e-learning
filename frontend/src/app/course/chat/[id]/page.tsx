"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/socketio";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { storeType } from "@/lib/store";
import { useSelector } from "react-redux";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getallchat } from "@/services/fetchdata";

// Import your enum
export enum chatEnum{
  error='error-message',
  joinRoom='join-room',
  disconnect='disconnect',
  sendMessage='sendMessage',
  receive="receive_message",
  joinmeet='join-meet',
  userConnected='userConnected',
  signal='signal',
  joined='joined-user',

}
export interface IMessage {
  chatroomId: string;
  senderId: string;
  message: string;
  timestamp: Date;
}

function Chat() {
  const state = useSelector((state: storeType) => state.User.user);
  const params = useParams();
  const roomId = params.id;
  const socket = useSocket();

  const [messages, setMessages] = useState<IMessage[] | []>([]);
  const [newMessage, setNewMessage] = useState("");

  const [username, setUsername] = useState(state?.name);
  const [email, setEmail] = useState(state?.email);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate user avatar from username
  const getUserInitials = (name) => {
    return name ? name.slice(0, 2).toUpperCase() : "U";
  };

  // Generate random color based on username
  const getUserColor = (name) => {
    if (!name) return "hsl(212, 100%, 50%)";
    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return `hsl(${hash % 360}, 70%, 45%)`;
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log(state);

    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fn = async () => {
      if (!socket) return;

      // Set a default username if not already set
      if (!username) {
        const defaultUsername = `User_${Math.floor(Math.random() * 1000)}`;
        setUsername(defaultUsername);
      }
      const data = await getallchat(String(roomId));
      console.log(data);

      setMessages(data.data);
      // Join the room when socket is ready
      socket.emit(chatEnum.joinRoom, { roomId, username, email });
      setIsConnected(true);
      setError("");

      // Listen for incoming messages
      socket.on(chatEnum.receive, (messageData: IMessage) => {
        setMessages((prevMessages) => {
          if (!prevMessages) {
            prevMessages = [];
          }
          console.log([...prevMessages, messageData]);
          return [...prevMessages, messageData];
        });
        console.log(messages);
      });

      // Listen for error messages
      socket.on(chatEnum.error, (errorData) => {
        console.error("Socket error:", errorData);
        setError(errorData || "An error occurred");
        // Auto-dismiss error after 5 seconds
        setTimeout(() => setError(""), 5000);
      });

      // Clean up listeners when component unmounts
      return () => {
        socket.off(chatEnum.sendMessage);
        socket.off(chatEnum.error);
        if (socket.connected) {
          socket.emit(chatEnum.disconnect, { roomId });
        }
      };
    };
    fn();
  }, [socket, roomId, username]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit(chatEnum.sendMessage, newMessage, roomId, email, username);
    setNewMessage("");

    // Focus back on input after sending
    inputRef.current?.focus();
  };

  const formatMessageTime = (timestamp) => {
    console.log(timestamp);

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!socket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96 text-center p-6">
          <CardContent className="pt-6">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-4 w-4 bg-blue-600 rounded-full" />
              <div className="h-4 w-4 bg-blue-600 rounded-full" />
              <div className="h-4 w-4 bg-blue-600 rounded-full" />
            </div>
            <p className="mt-4 text-muted-foreground">
              Connecting to chat room...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-screen p-4">
      <Card className="w-full max-w-3xl flex flex-col h-full">
        <CardHeader className="px-6 py-4 bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Room: {roomId}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Logged in as {username}
              </p>
            </div>
            <Badge variant={isConnected ? "success" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>

        {error && (
          <Alert variant="destructive" className="mx-4 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to send a message!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.username == username;
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}>
                      <div
                        className={`flex gap-2 max-w-xs sm:max-w-md ${
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        }`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback
                                  style={{
                                    backgroundColor: getUserColor(
                                      message.username
                                    ),
                                  }}>
                                  {getUserInitials(message.username)}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{message.username}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <div>
                          <div
                            className={`rounded-lg p-3 ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}>
                            <p>{message.message}</p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 px-1">
                            {formatMessageTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <Separator />

        <CardFooter className="p-4">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Chat;
