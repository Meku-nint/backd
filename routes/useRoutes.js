import { Router } from "express";
import { newOrders,getOrders,newRider,upload,setPrice,orderAccepted} from "../controllers/userController.js";
const router=Router();
router.post('/price',setPrice);
router.post('/orders',newOrders);
router.get('/rider/getOrders',getOrders);
router.patch('/rider/updateOrder',orderAccepted);
router.post("/riders", upload.single("file"), newRider);
export default router;
