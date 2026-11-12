import { Router } from "express";
import creatorRoute from "@/feature/creator/creator.route";
import donationRoute from "@/feature/donation/donation.route";

const router = Router();

router.use('/creators', creatorRoute);
router.use('/donations', donationRoute);

export default router;
