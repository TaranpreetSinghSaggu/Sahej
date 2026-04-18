import { RequestHandler } from "express";

import { AppError } from "../middleware/error.middleware";
import { ReflectionResponse, ReflectRequestBody } from "../types/reflection";

const mockReflection: ReflectionResponse = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  mirrorLine: "This sounds more reflective than reactive right now.",
  reframePrompt: "What is the clearest next step you can take with calm intent?",
  dopamineDrain: false
};

export const reflect: RequestHandler<
  Record<string, never>,
  ReflectionResponse,
  ReflectRequestBody
> = (req, res, next) => {
  const { thought } = req.body;

  if (typeof thought !== "string" || thought.trim().length === 0) {
    return next(new AppError(400, "thought is required and must be a non-empty string"));
  }

  return res.status(200).json(mockReflection);
};
