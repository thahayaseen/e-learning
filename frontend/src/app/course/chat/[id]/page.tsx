"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/socketio";
import { useParams, useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle, ArrowLeft } from "lucide-react";
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
enum chatEnum {
  error = "error-message",
  joinRoom = "join-room",
  disconnect = "disconnect",
  sendMessage = "sendMessage",
  receive = "receive_message",
  joinmeet = "join-meet",
  userConnected = "userConnected",
  signal = "signal",
  joined = "joined-user",
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
  const router = useRouter();
  const roomId = params.id;
  const socket = useSocket();

  const [messages, setMessages] = useState<IMessage[] | []>([]);
  const [remortUser, setRemortUser] = useState("Unknown User");
  const [newMessage, setNewMessage] = useState("");

  const [username, setUsername] = useState(state?.name);
  const [email, setEmail] = useState(state?.email);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<any>(null);
  const inputRef = useRef<any>(null);

  // Generate user avatar from username
  const getUserInitials = (name: any) => {
    return name ? name.slice(0, 2).toUpperCase() : "U";
  };

  // Generate random color based on username
  const getUserColor = (name: any) => {
    if (!name) return "hsl(212, 100%, 50%)";
    const hash = name
      .split("")
      .reduce((acc: any, char: any) => char.charCodeAt(0) + acc, 0);
    return `hsl(${hash % 360}, 70%, 45%)`;
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fn = async () => {
      if (!socket) return;

      setIsLoading(true);

      // Set a default username if not already set
      if (!username) {
        const defaultUsername = `User_${Math.floor(Math.random() * 1000)}`;
        setUsername(defaultUsername);
      }

      try {
        const data = await getallchat(String(roomId));
        setMessages(data.data);
        setRemortUser(data.remortUser);
        // Join the room when socket is ready
        socket.emit(chatEnum.joinRoom, { roomId, username, email });
        setIsConnected(true);
        setError("");
      } catch (err) {
        setError("Failed to load chat history. Please try again. You will redirect to login Page" );
        setTimeout(() => {
          router.push("/auth");
        },2000);
      } finally {
        setIsLoading(false);
      }

      // Listen for incoming messages
      socket.on(chatEnum.receive, (messageData: IMessage) => {
        setMessages((prevMessages) => {
          if (!prevMessages) {
            prevMessages = [];
          }
          return [...prevMessages, messageData];
        });
      });

      // Listen for error messages
      socket.on(chatEnum.error, (errorData) => {
        setError(errorData || "An error occurred");
        // Auto-dismiss error after 5 seconds
        setTimeout(() => {
          setError("");
          router.push("/auth");
        }, 5000);
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
  }, [socket, roomId, username, email]);

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    const localMessage = {
      _id: Date.now().toString(),
      message: newMessage,
      username: state.name,
      userEmail: state.email,

      createdAt: new Date().toISOString(),
    };
    socket.emit(chatEnum.sendMessage, newMessage, roomId, email, username);
    setNewMessage("");
    setMessages((prev) => (prev ? [...prev, localMessage] : []));
    // Focus back on input after sending
    inputRef.current?.focus();
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (!socket || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background to-background/80">
        <Card className="w-96 text-center p-6 shadow-lg border-primary/10">
          <CardContent className="pt-6">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-4 w-4 bg-primary rounded-full" />
              <div className="h-4 w-4 bg-primary rounded-full" />
              <div className="h-4 w-4 bg-primary rounded-full" />
            </div>
            <p className="mt-6 text-muted-foreground font-medium">
              Connecting to chat room...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-screen p-4 bg-gradient-to-b from-background to-background/90">
      <Card className="w-full max-w-3xl flex flex-col h-full shadow-lg border-primary/10">
        <CardHeader className="px-6 py-4 bg-primary/5 border-b flex flex-row items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full hover:bg-primary/10"
            aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="font-semibold">To:</span>
              <span className="text-primary">{remortUser}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Logged in as <span className="font-medium">{username}</span>
            </p>
          </div>

          <Badge
            variant={isConnected ? "outline" : "destructive"}
            className={
              isConnected ? "bg-green-50 text-green-700 border-green-200" : ""
            }>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardHeader>

        {error && (
          <Alert
            variant="destructive"
            className="mx-4 mt-4 animate-in fade-in-50 slide-in-from-top-5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground mb-2 font-medium">
                  No messages yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Be the first to send a message!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message: any, index) => {
                  const isOwnMessage = message.username === username;
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}>
                      <div
                        className={`flex gap-3 max-w-xs sm:max-w-md ${
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        }`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
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

                        <div
                          className={`max-w-full ${
                            isOwnMessage ? "items-end" : "items-start"
                          }`}>
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}>
                            <p className="break-words">{message.message}</p>
                          </div>
                          <div
                            className={`text-xs text-muted-foreground mt-2 px-2 ${
                              isOwnMessage ? "text-right" : "text-left"
                            }`}>
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

        <Separator className="my-0" />

        <CardFooter className="p-4">
          <form onSubmit={handleSendMessage} className="flex w-full gap-3">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 text-white rounded-full bg-background focus-visible:ring-primary"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="rounded-full px-5">
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
