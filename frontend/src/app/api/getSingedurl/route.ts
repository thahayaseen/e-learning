import { generateSignedUrl } from "@/services/S3.init";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const filename = searchParams.get("name");
//   if (!filename) {
//     return new Response("Missing fileName", { status: 400 });
//   }
//   const dat = await generateSignedUrl(process.env.AWS_BUCKET_NAME, filename);
 // }
