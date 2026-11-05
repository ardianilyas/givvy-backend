import { Router } from "express";
import { CreatorService } from "./creator.service";
import { CreatorController } from "./creator.controller";
import { authMiddleware } from "@/shared/middlewares/auth.middleware";

const router = Router();

const creatorService = new CreatorService();
const creatorController = new CreatorController(creatorService);

router.get('/', creatorController.getCreators);
router.get('/:username', creatorController.getCreatorByUsername);

router.use(authMiddleware);
router.post('/', creatorController.createCreator);
router.patch('/:id', creatorController.updateCreator);

export default router;
