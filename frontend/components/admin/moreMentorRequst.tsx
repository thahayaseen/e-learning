"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  Clipboard,
  ExternalLink,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Clock,
  Eye,
  FileText,
  ImageIcon,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface UserDetailsDialogProps {
  data: {
    createdAt: string
    email: string
    experience: number
    fullname: string
    mobile: string
    profileImage?: string
    profileLink?: string
    idProofImage?: string
    qualification: string
    status: "pending" | "accepted" | "rejected"
    updatedAt: string
    userid: string
    additionalDetails?: {
      department?: string
      designation?: string
      dateOfBirth?: string
      address?: string
    }
  }
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "documents">("profile")

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Helper function to get status color
  const getStatusColor = () => {
    switch (data.status) {
      case "pending":
        return "bg-yellow-500"
      case "accepted":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
    }
  }

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: `${label} Copied`,
          description: "Text has been copied to clipboard",
        })
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex items-center gap-2 bg-gray-600 hover:bg-black text-white">
          <Eye className="h-4 w-4" /> Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>User Profile Details</div>
            <span className={`px-3 py-1 rounded-full text-white text-xs ${getStatusColor()}`}>
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 ${
              activeTab === "profile" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
          >
            Profile Details
          </button>
          {(data.idProofImage || data.profileImage) && (
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 ${
                activeTab === "documents" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
            >
              Documents
            </button>
          )}
        </div>

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Image Column */}
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage
                  src={data.profileImage || "/placeholder.svg?height=128&width=128"}
                  alt={`${data.fullname}'s profile`}
                />
                <AvatarFallback>{data.fullname.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-center break-words max-w-full">{data.fullname}</h2>
            </div>

            {/* Contact Information Column */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium truncate" title={data.email}>
                      {data.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => copyToClipboard(data.email, "Email")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-medium truncate" title={data.mobile}>
                      {data.mobile}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => copyToClipboard(data.mobile, "Mobile Number")}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Professional Information Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Professional Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Qualification</p>
                    <p className="font-medium break-words">{data.qualification}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-medium">{data.experience} years</p>
                  </div>
                </div>
                {data.additionalDetails?.department && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium break-words">{data.additionalDetails.department}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="grid md:grid-cols-2 gap-6">
            {data.profileImage && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-500" /> Profile Image
                </h3>
                <div className="relative w-full h-[300px]">
                  <Image
                    src={data.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    fill
                    className="object-contain rounded-lg shadow-md"
                  />
                </div>
              </div>
            )}
            {data.idProof && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" /> ID Proof
                </h3>
                <div className="relative w-full h-[300px]">
                  <Image
                    src={data.idProof || "/placeholder.svg"}
                    alt="ID Proof"
                    fill
                    className="object-contain rounded-lg shadow-md"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-6 border-t pt-4 grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <h4 className="font-semibold">Account Details</h4>
            </div>
            <div className="space-y-2">
              <p className="flex flex-col sm:flex-row sm:gap-2">
                <strong className="inline-block min-w-24">Created:</strong>
                <span className="text-sm">{formatDate(data.createdAt)}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:gap-2">
                <strong className="inline-block min-w-24">Last Updated:</strong>
                <span className="text-sm">{formatDate(data.updatedAt)}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:gap-2">
                <strong className="inline-block min-w-24">User ID:</strong>
                <span className="text-sm break-all">{data.userid}</span>
              </p>
              {data.additionalDetails?.dateOfBirth && (
                <p className="flex flex-col sm:flex-row sm:gap-2">
                  <strong className="inline-block min-w-24">Date of Birth:</strong>
                  <span className="text-sm">{formatDate(data.additionalDetails.dateOfBirth)}</span>
                </p>
              )}
            </div>
            {data.additionalDetails?.address && (
              <div className="mt-2">
                <strong>Address:</strong>
                <p className="text-sm mt-1 break-words">{data.additionalDetails.address}</p>
              </div>
            )}
          </div>

          {data.profileLink && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-5 w-5 text-gray-500" />
                <h4 className="font-semibold">External Profile</h4>
              </div>
              <a
                href={data.profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-2 break-all"
              >
                View LinkedIn Profile <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsDialog

