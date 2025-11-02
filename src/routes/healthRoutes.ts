import { Router } from 'express';
import { healthCheck, testDelay } from '../controllers/healthController.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/test-delay', testDelay);

export default router;
