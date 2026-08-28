import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "@repo/services"; // Adjust import path if needed
import { AdminFormService } from "@repo/services/src/form/admin-form.service"; 
import { buildApiResponse } from "@repo/services/src/utils/api-response";
import { z } from "zod";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const adminFormRouter = Router();

// STRICT ADMIN BOUNDARIES
adminFormRouter.use(requireAuth);
adminFormRouter.use(requireRole(["ADMIN"]));

// GET: Fetch all forms for the system dashboard
adminFormRouter.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const forms = await AdminFormService.getAllForms();
    res.status(200).json(buildApiResponse(forms, "System forms retrieved successfully"));
  } catch (error) {
    next(error);
  }
});


// GET: Fetch single form for admin review
adminFormRouter.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const formId = req.params.id as string;
    const form = await AdminFormService.getFormById(formId);
    res.status(200).json(buildApiResponse(form, "Form details retrieved"));
  } catch (error) {
    next(error);
  }
});

// Zod schema for strictly validating the incoming status change
const updateStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

// PATCH: Update only the status of a form
adminFormRouter.patch("/:id/status", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const formId = req.params.id as string;
    const { status } = updateStatusSchema.parse(req.body);
    
    // Cast 'status' to any if TS complains about strict Prisma Enum types matching Zod
    const updatedForm = await AdminFormService.updateFormStatus(formId, status as any);
    
    res.status(200).json(buildApiResponse(updatedForm, `Form status updated to ${status}`));
  } catch (error) {
    next(error);
  }
});