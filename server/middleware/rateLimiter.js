import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true, 
  legacyHeaders: false, 
});

export const userWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: { message: "Too many user management requests, please try again shortly" },
  standardHeaders: true,
  legacyHeaders: false,
});