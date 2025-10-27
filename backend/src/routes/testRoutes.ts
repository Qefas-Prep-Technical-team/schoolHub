import { fetchTest } from "@controllers/testController";
import { testMiddleware } from "@middleware/testMiddleware";
import { Router } from "express";

const router = Router();

router.get("/:id", testMiddleware, fetchTest);
router.get("/", (req, res) => {
  res.json({ message: "Test route without ID" });
});

export default router;
