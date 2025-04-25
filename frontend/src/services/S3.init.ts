import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION! || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
export async function generateSignedUrl(
  bucket: string = "exi-elarning",
  key: string
) {
   const command = new GetObjectCommand({
    Bucket: bucket,
    Key: `'images/'${key}`,
  });
   const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
   return signedUrl;
}
export default s3;
