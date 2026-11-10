import { Router } from "express";
import { CreatorService } from "./creator.service";
import { CreatorController } from "./creator.controller";
import { authMiddleware } from "@/shared/middlewares/auth.middleware";
import { requireRole } from "@/shared/middlewares/require-role";

const router = Router();

const creatorService = new CreatorService();
const creatorController = new CreatorController(creatorService);

router.get('/', creatorController.getCreators);
router.get('/:username', creatorController.getCreatorByUsername);

router.use(authMiddleware);
router.post('/', creatorController.createCreator);
router.patch('/:id', creatorController.updateCreator);
router.patch('/:id/generate-alert-token', creatorController.generateAlertToken);

router.use(requireRole("admin"))
router.patch('/:id/verify', creatorController.verifyCreator);

export default router;
