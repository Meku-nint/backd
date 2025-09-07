import { Router } from "express";
import { newOrders, newRider,upload,setPrice} from "../controllers/userController.js";
const router=Router();
router.post('/price',setPrice);
router.post('/orders',newOrders);
router.post("/riders", upload.single("file"), newRider);
export default router;
