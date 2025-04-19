import mentrorouter from "../presentation/routers/mentor.route";
import user from "../presentation/routers/user.route";
import { Router } from "express";
const router = Router();

router.use("/", user);
router.use("/mentor", mentrorouter);
export default router;
