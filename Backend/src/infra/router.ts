import mentrorouter from "../presentation/routers/mentor";
import user from "../presentation/routers/user";
import { Router } from "express";
const router = Router();

router.use("/", user);
router.use("/mentor", mentrorouter);
export default router;
