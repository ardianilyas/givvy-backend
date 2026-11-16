import { Router } from "express";
import { WithdrawalService } from "./withdrawal.service";
import { WithdrawalController } from "./withdrawal.controller";
import { authMiddleware } from "@/shared/middlewares/auth.middleware";

const router = Router();

const withdrawalService = new WithdrawalService();
const withdrawalController = new WithdrawalController(withdrawalService);

router.use(authMiddleware);
router.post("/:creatorId/withdraw", withdrawalController.createWithdrawal);

export default router;
