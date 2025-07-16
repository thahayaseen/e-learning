import s3 from "@/services/S3.init";
import {
  S3Client,
  PutObjectCommand,
  GetObjectAclCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// export const getImage = async (path) => {
 //   const command = new GetObjectCommand({
//     Bucket: process.env.AWS_BUCKET_NAME!,
//     Key: path,
//   });
 //   return;
// };
export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json(); // Get file name & type from request
console.log(fileName,'nameis');

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `exi/${fileName}`,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour expiry

    return NextResponse.json({ uploadUrl }); // Return pre-signed URL
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
