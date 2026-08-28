import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole, PilotFormService } from "@repo/services";
import { createPilotFormSchema } from "@repo/types";
import { buildApiResponse } from "@repo/services/src/utils/api-response"; 

// 1. Explicitly extend Request to include our injected user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const formRouter = Router();

// Apply auth middleware to all form routes
formRouter.use(requireAuth);
formRouter.use(requireRole(["PILOT"]));

// GET: Fetch all forms for the logged-in pilot
formRouter.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const forms = await PilotFormService.getMyForms(req.user!.userId);
    res.status(200).json(buildApiResponse(forms, "Forms retrieved successfully"));
  } catch (error) {
    next(error);
  }
});

// GET: Fetch single form by ID
formRouter.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 2. Safely cast the param to string to satisfy TS
    const formId = req.params.id as string;
    const form = await PilotFormService.getFormById(formId, req.user!.userId);
    res.status(200).json(buildApiResponse(form, "Form details retrieved"));
  } catch (error) {
    next(error);
  }
});

// POST: Submit a new form
formRouter.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createPilotFormSchema.parse(req.body);
    const newForm = await PilotFormService.createForm(req.user!.userId, validatedData);
    res.status(201).json(buildApiResponse(newForm, "Pilot form submitted successfully"));
  } catch (error) {
    next(error);
  }
});


// PUT: Update an existing form
formRouter.put("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const formId = req.params.id as string;
    const validatedData = createPilotFormSchema.parse(req.body);
    
    const updatedForm = await PilotFormService.updateForm(req.user!.userId, formId, validatedData);
    
    res.status(200).json(buildApiResponse(updatedForm, "Pilot form updated successfully"));
  } catch (error) {
    next(error);
  }
});