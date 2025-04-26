"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X, ArrowLeft, Search } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getallchat, getChatrooms } from "@/services/fetchdata";
import { useSocket } from "@/hooks/socketio";
import { useSelector } from "react-redux";
import { chatEnum } from "@/lib/chat-enums";
import type { IMessage } from "@/app/course/chat/[id]/page";
import PaginationComponent from "@/components/default/pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getImage } from "@/services/getImage";

const MessageAdminDashboard = () => {
  const [chatrooms, setChatrooms] = useState([]);
  const state = useSelector((state: any) => state.User.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<any>(null);
  const socket = useSocket();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
   // Track if the component is mounted
  const isMounted = useRef(true);
  const currentChatIdRef = useRef<string | null>(null);

  // Set up socket event listeners only once
  useEffect(() => {
    if (!socket) return;

    // Set up the message listener
    socket.on(chatEnum.receive, handleNewMessage);

    return () => {
      isMounted.current = false;
      // Remove event listeners
      socket.off(chatEnum.receive);

      // Leave any active chat room when unmounting
      if (currentChatIdRef.current) {
        socket.emit("leave-room", {
          roomId: currentChatIdRef.current,
          from: "socket chaging",
        });
        currentChatIdRef.current = null;
      }
    };
  }, [socket]);

  // Fetch chatrooms when page changes
  useEffect(() => {
    fetchChatrooms();
  }, [page]);

  // Handle chat selection and room joining
  useEffect(() => {
    if (!selectedChat || !socket) return;

    const chatId = selectedChat._id;

    // If selecting a different chat
    if (currentChatIdRef.current !== chatId) {
      // Leave previous room if exists
      if (currentChatIdRef.current) {
        socket.emit("leave-room", { roomId: currentChatIdRef.current });
      }

      // Join new room
      socket.emit(chatEnum.joinRoom, {
        roomId: chatId,
        username: state?.name,
        email: state?.email,
      });

      // Update reference
      currentChatIdRef.current = chatId;

      // Fetch messages for the selected chat
      fetchMessages(chatId);
    }

    return () => {
      // Clean up function is empty here because we handle room leaving
      // when selecting a different chat or in component unmount
    };
  }, [selectedChat?._id, socket, state?.email, state?.name]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all chatrooms
  const fetchChatrooms = async () => {
    try {
      setIsLoading(true);
      const data = await getChatrooms(page);

      if (isMounted.current) {
        setTotal(data.data.total);
        setChatrooms(data.data.data);

        // Only set selectedChat if not already selected or on first load
        if (!selectedChat && data.data.data.length > 0) {
          setSelectedChat(data.data.data[0]);
        }

        setIsLoading(false);
      }
    } catch (error) {
 
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Fetch messages for a specific chatroom
  const fetchMessages = async (chatroomId) => {
    try {
      const data = await getallchat(chatroomId);
      if (isMounted.current && currentChatIdRef.current === chatroomId) {
        setMessages(data.data);
      }
    } catch (error) {
 
    }
  };

  // Handle new incoming messages
  const handleNewMessage = useCallback((message) => {
    if (!isMounted.current) return;

    // Only update messages if it belongs to the current chat
    if (currentChatIdRef.current === message.chatroomId) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  }, []);

  // Send a new message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedChat || !socket) return;

    const chatId = selectedChat._id;

    // Emit the message through socket
    socket.emit(
      chatEnum.sendMessage,
      newMessage,
      chatId,
      state?.email,
      state?.name
    );

    // Add message to UI immediately for better UX
    const localMessage = {
      _id: Date.now().toString(),
      message: newMessage,
      username: state?.name,
      userEmail: state?.email,
      chatroomId: chatId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, localMessage]);

    // Clear input
    setNewMessage("");
  }, [newMessage, selectedChat?._id, socket, state?.email, state?.name]);

  // Select a chat to view
  const selectChat = useCallback((chatroom) => {
    // Only update if it's a different chat
    if (currentChatIdRef.current !== chatroom._id) {
      setSelectedChat(chatroom);
    }
  }, []);

  // Close the current chat
  const closeChat = useCallback(() => {
    // Leave the room if socket exists
     socket.emit("leave-room", {
      roomId: currentChatIdRef.current,
      from: "dfadfsd",
    });
    currentChatIdRef.current = null;
    if (socket && currentChatIdRef.current) {
    }

    setSelectedChat(null);
  }, [socket]);

  // Helper to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format time for messages
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filter chatrooms based on search term
  const filteredChatrooms = chatrooms.filter(
    (chatroom) =>
      chatroom.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chatroom.courseName &&
        chatroom.courseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chatroom.lastMessage?.message &&
        chatroom.lastMessage.message
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  // Handle keyboard press for sending message
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && newMessage.trim()) {
        handleSendMessage();
      }
    },
    [handleSendMessage, newMessage]
  );

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages table section */}
        <div
          className={`${
            selectedChat
              ? "hidden lg:block lg:col-span-2"
              : "col-span-1 lg:col-span-3"
          } h-[75vh] overflow-hidden`}>
          <Card className="bg-slate-800 border-slate-700 shadow-lg w-full h-full flex flex-col">
            <CardHeader className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="mr-2 text-blue-400" size={24} />
                  Message Administration
                </CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8 bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 focus-visible:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-auto">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-700/70 sticky top-0">
                      <TableRow>
                        <TableHead className="text-slate-200 font-medium">
                          Participants
                        </TableHead>
                        <TableHead className="text-slate-200 font-medium">
                          Course
                        </TableHead>
                        <TableHead className="text-slate-200 font-medium">
                          Last Message
                        </TableHead>
                        <TableHead className="text-slate-200 font-medium">
                          Date
                        </TableHead>
                        <TableHead className="text-slate-200 font-medium">
                          Status
                        </TableHead>
                        <TableHead className="text-slate-200 font-medium">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChatrooms.map((chatroom) => (
                        <TableRow
                          key={chatroom._id}
                          className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                          onClick={() => selectChat(chatroom)}>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 bg-slate-600 border border-slate-500">
                                {chatroom.userId.profile?.avatar ? (
                                  <AvatarImage
                                    src={
                                      getImage(
                                        chatroom.userId.profile.avatar
                                      ) || "/placeholder.svg"
                                    }
                                    alt={chatroom.userId.name}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {chatroom.userId.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="font-medium">
                                {chatroom.userId.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {chatroom.courseName || "N/A"}
                          </TableCell>
                          <TableCell className="text-slate-300 max-w-xs truncate">
                            {chatroom.lastMessage?.message || "No messages"}
                          </TableCell>
                          <TableCell className="text-slate-300 whitespace-nowrap">
                            {chatroom.lastMessage?.createdAt
                              ? formatDate(chatroom.lastMessage.createdAt)
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {chatroom.lastMessage?.senderId === "mentor-id" ? (
                              <Badge className="bg-green-600/80 text-white hover:bg-green-700">
                                Replied
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/80 text-white hover:bg-amber-600">
                                Awaiting Reply
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectChat(chatroom);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              size="sm">
                              View Chat
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredChatrooms.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-slate-400">
                            {searchTerm
                              ? "No matching chatrooms found"
                              : "No chatrooms found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t border-slate-700">
              <PaginationComponent
                page={page}
                setPage={setPage}
                total={total}
                itemsPerPage={10}
              />
            </div>
          </Card>
        </div>

        {/* Chat section */}
        {selectedChat && (
          <div
            className={`${
              selectedChat ? "col-span-1 lg:col-span-1" : "hidden"
            } h-[75vh]`}>
            <Card className="bg-slate-800 border-slate-700 shadow-lg h-full flex flex-col">
              {/* Chat header */}
              <CardHeader className="border-b border-slate-700 bg-slate-700/90 backdrop-blur-sm p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeChat}
                      className="mr-2 lg:hidden text-slate-200 hover:text-white hover:bg-slate-600">
                      <ArrowLeft size={20} />
                    </Button>
                    <Avatar className="h-10 w-10 mr-3 bg-slate-600 border border-slate-500">
                      {selectedChat.userId.profile?.avatar ? (
                        <AvatarImage
                          src={
                            selectedChat.userId.profile.avatar ||
                            "/placeholder.svg"
                          }
                          alt={selectedChat.userId.name}
                        />
                      ) : (
                        <AvatarFallback className="bg-blue-600 text-white">
                          {selectedChat.userId.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">
                        {selectedChat.userId.name}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {selectedChat.courseName || "Course"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeChat}
                    className="hidden lg:flex text-slate-200 hover:text-white hover:bg-slate-600">
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages area */}
              <div className="flex-grow p-4 overflow-y-auto bg-slate-800/70 backdrop-blur-sm">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`flex ${
                          message.username === state?.name
                            ? "justify-end"
                            : "justify-start"
                        }`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.username === state?.name
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-slate-700 text-slate-200 rounded-tl-none"
                          }`}>
                          <p className="break-words">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.username === state?.name
                                ? "text-blue-200"
                                : "text-slate-400"
                            }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-30" />
                    <p>No messages in this conversation yet</p>
                    <p className="text-sm">
                      Start the conversation by sending a message
                    </p>
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-slate-700 bg-slate-800/90 backdrop-blur-sm">
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 focus-visible:ring-blue-500"
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Send size={18} className="mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageAdminDashboard;
