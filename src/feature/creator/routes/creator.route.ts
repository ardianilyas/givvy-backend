import { Router } from "express";
import { CreatorService } from "../services/creator.service";
import { CreatorController } from "../controllers/creator.controller";
import { authMiddleware } from "@/shared/middlewares/auth.middleware";
import { requireRole } from "@/shared/middlewares/require-role";
import { CreatorBankAccountService } from "../services/creator-bank-account.service";
import { CreatorBankAccountController } from "../controllers/creator-bank-account.controller";

const router = Router();

const creatorService = new CreatorService();
const creatorController = new CreatorController(creatorService);

const creatorBankAccountService = new CreatorBankAccountService();
const creatorBankAccountController = new CreatorBankAccountController(creatorBankAccountService);

router.get('/', creatorController.getCreators);
router.get('/:username', creatorController.getCreatorByUsername);

router.use(authMiddleware);
router.post('/', creatorController.createCreator);
router.patch('/:id', creatorController.updateCreator);
router.patch('/:id/generate-alert-token', creatorController.generateAlertToken);

router.route("/:id/bank-account")
  .post(creatorBankAccountController.createBankAccount)
  .get(creatorBankAccountController.getBankAccount)
  .patch(creatorBankAccountController.updateBankAccount);

router.use(requireRole("admin"))
router.patch('/:id/verify', creatorController.verifyCreator);

export default router;
