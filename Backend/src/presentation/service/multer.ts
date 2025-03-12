import multer, { diskStorage } from "multer";
import path from "path";
const storage = diskStorage({
  destination(req, file, callback) {
    const upPath = path.join(__dirname, "public/uploads/");
    callback(null, upPath);
  },
  filename(req, file, callback) {
    callback(
      null,
      file.filename + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const uploads = multer({
  storage: storage,
});
export default uploads;
