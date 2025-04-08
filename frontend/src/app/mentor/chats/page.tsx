"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { MessageSquare, Send, X, ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { getallchat, getChatrooms } from "@/services/fetchdata";
import { useSocket } from "@/hooks/socketio";
import { useSelector } from "react-redux";
import { chatEnum } from "@/lib/chat-enums";
import { IMessage } from "@/app/course/chat/[id]/page";
import PaginationComponent from "@/components/default/pagination";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

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
  useEffect(() => {
    fetchChatrooms();

    if (socket) {
      socket.on(chatEnum.receive, handleNewMessage);

      return () => {
        socket.off(chatEnum.receive);
        // socket.off('chatroom_updated');
      };
    }
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      console.log(selectedChat._id);

      fetchMessages(selectedChat._id);

      // Join the chatroom socket room
      if (socket) {
        console.log("emited", selectedChat._id);

        socket.emit(chatEnum.joinRoom, {
          roomId: String(selectedChat._id),
          username: state.name,
          email: state.email,
        });
      }
    }
  }, [selectedChat, socket]);

  const fetchChatrooms = async () => {
    try {
      setIsLoading(true);
      const data = await getChatrooms();
      setTotal(data.data.total);
      setChatrooms(data.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chatrooms:", error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatroomId: any) => {
    try {
      console.log(chatroomId);

      const data = await getallchat(chatroomId);
      console.log(data);

      setMessages(data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleNewMessage = (message: Partial<IMessage>) => {
    console.log("yes here ");

    console.log([message, messages]);

    if (selectedChat && message.chatroomId === selectedChat._id) {
      setMessages((prev) => [...prev, message]);
      return;
    } else {
      setMessages((prev) => [...prev, message]);
    }

    console.log(messages);
  };

  const handleChatroomUpdated = (updatedChatroom: any) => {
    console.log(updatedChatroom);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat && socket) {
      console.log(selectedChat._id);

      const messageData: any = {
        message: newMessage,
        chatroomId: String(selectedChat._id),
        userEmail: state.email,
        username: state.name, // Replace with actual mentor ID
      };
      console.log(messageData);

      // Emit the message through socket
      socket.emit(
        chatEnum.sendMessage,
        newMessage,
        String(selectedChat._id),
        state.email,
        state.name
      );
      messageData.createdAt = new Date();
      //   handleNewMessage(messageData);
      // Clear input
      setNewMessage("");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const selectChat = (chatroom: any) => {
    setSelectedChat(chatroom);
  };

  const closeChat = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  return (
    <div className="min-h-full w-full bg-slate-900 p-6">
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Messages table section */}
        <div
          className={`${selectedChat && "hidden lg:block"} h-[70vh] ${
            !selectedChat ? "col-span-3" : "col-span-2"
          }
          }`}>
          <Card className="bg-slate-800 border-slate-700 shadow-lg w-full h-full">
            <CardHeader className="border-b border-slate-700 bg-slate-800">
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="mr-2" size={24} />
                Message Administration Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-700">
                      <TableRow>
                        <TableHead className="text-slate-200">
                          Participants
                        </TableHead>
                        <TableHead className="text-slate-200">Course</TableHead>
                        <TableHead className="text-slate-200">
                          Last Message
                        </TableHead>
                        <TableHead className="text-slate-200">Date</TableHead>
                        <TableHead className="text-slate-200">Status</TableHead>
                        <TableHead className="text-slate-200">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chatrooms.map((chatroom: any) => (
                        <TableRow
                          key={chatroom._id}
                          className="border-b border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="text-slate-300">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {chatroom.userId.name}
                              </span>
                              {/* <span className="text-xs text-slate-400">with {chatroom.participants.length} participants</span> */}
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
                              <Badge className="bg-green-600 text-white hover:bg-green-700">
                                Replied
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                                Awaiting Reply
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => selectChat(chatroom)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              size="sm">
                              View Chat
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {chatrooms.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-slate-400">
                            No chatrooms found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat section */}
        {selectedChat && (
          <div className="col-span-1 max-h-[70vh]">
            <Card className="bg-slate-800 border-slate-700 shadow-lg h-full flex flex-col">
              {/* Chat header */}
              <CardHeader className="border-b border-slate-700 bg-slate-700 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeChat}
                      className="mr-2 lg:hidden text-slate-200 hover:text-white hover:bg-slate-600">
                      <ArrowLeft size={20} />
                    </Button>
                    <Avatar className="h-10 w-10 mr-3 bg-slate-600">
                      <Image
                        width={100}
                        height={100}
                        src={
                          selectedChat.userId.name?.avatar ||
                          "/api/placeholder/30/30"
                        }
                        alt="User"
                      />
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
              <div className="flex-grow p-4 overflow-y-auto bg-slate-800">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.username === state.name
                            ? "justify-end"
                            : "justify-start"
                        }`}>
                        <div
                          className={`max-w-3/4 p-3 rounded-lg ${
                            message.username === state.name
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 text-slate-200"
                          }`}>
                          <p>{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.username === state.name
                                ? "text-blue-200"
                                : "text-slate-400"
                            }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      No messages in this conversation yet
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow p-2 bg-slate-700 border-slate-600 border rounded-lg mr-2 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      <PaginationComponent
        page={page}
        setPage={setPage}
        total={total}
        itemsPerPage={10}
      />
    </div>
  );
};

export default MessageAdminDashboard;
