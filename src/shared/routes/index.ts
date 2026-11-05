import { Router } from "express";
import creatorRoute from "@/feature/creator/creator.route";

const router = Router();

router.use('/creators', creatorRoute);

export default router;