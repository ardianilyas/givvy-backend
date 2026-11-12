import { authMiddleware } from "@/shared/middlewares/auth.middleware";
import { Router } from "express";
import { DonationService } from "./donation.service";
import { DonationController } from "./donation.controller";

const router = Router();

const donationService = new DonationService();
const donationController = new DonationController(donationService);

// borderpay webhook
router.post('/webhook', donationController.handlePaymentWebhook);

router.use(authMiddleware);
router.post('/', donationController.createDonation);

export default router;
