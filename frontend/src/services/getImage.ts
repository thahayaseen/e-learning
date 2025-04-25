import { generateSignedUrl } from "./S3.init";

export const getImage = (id) => {
    if (
    id.split(".")[1]?.startsWith("google") ||
    id.split(".")[1]?.startsWith("s3")
  ) {
    return id;
  }
  // const dat = generateSignedUrl(process.env.AWS_BUCKET_NAME, id).then((dat2) =>
  //   console.log(dat2, "data isssssssss")
  // );

  return process.env.NEXT_PUBLIC_S3Route + id;
};
