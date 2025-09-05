import { Router } from "express";
import { newOrders, newRider,upload} from "../controllers/userController.js";
const router=Router();
router.post('/orders',newOrders);
router.post("/riders", upload.single("file"), newRider);
export default router;
