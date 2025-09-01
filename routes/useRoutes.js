import { Router } from "express";
import { newOrders } from "../controllers/userController.js";
const router=Router();
router.post('/orders',newOrders);
export default router;
