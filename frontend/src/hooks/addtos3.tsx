import { useState } from "react";
import { toast } from "react-hot-toast";

function useUploadS3() {
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setuploadVideo] = useState(false);
  const uploadtos3 = async (file: File, fileType: "video" | "image") => {
    try {
      setUploading(fileType === "image");
      setuploadVideo(fileType === "video");
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        throw new Error("Cannot upload other than video or image");
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileCategory: fileType, // Add category to differentiate between image and video
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }
      const { uploadUrl } = await res.json();
      const uploadedUrl = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadedUrl.ok) {
        throw new Error("Failed to upload file");
      }
      console.log(uploadUrl,'urls');
      
      const fileUrl = uploadUrl.split("?")[0];
      console.log(fileUrl);
      
       return fileUrl.split("/")[4]
    } catch (error) {
       toast.error(
        error instanceof Error
          ? error.message
          : `Failed to upload ${fileType}. Please try again.`
      );
      return null;
    } finally {
      setUploading(false);
      setuploadVideo(false);
    }
  };
  return { uploading, uploadingVideo, uploadtos3 };
}

export default useUploadS3;
