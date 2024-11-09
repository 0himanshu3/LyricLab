import express from "express";
import { getRequestsByUserId,acceptRequest, rejectRequest } from "../controllers/request.controller.js";

const router = express.Router();

router.get("/:userId", getRequestsByUserId);
router.post('/accept', acceptRequest);
router.delete('/reject', rejectRequest);

export default router;
