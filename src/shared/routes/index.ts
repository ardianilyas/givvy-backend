import { Router } from "express";
import creatorRoute from "@/feature/creator/routes/creator.route";
import donationRoute from "@/feature/donation/donation.route";
import withdrawalRoute from "@/feature/withdrawal/withdrawal.route";

const router = Router();

router.use('/creators', creatorRoute);
router.use('/donations', donationRoute);
router.use('/withdrawals', withdrawalRoute);

export default router;
