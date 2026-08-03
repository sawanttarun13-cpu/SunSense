import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse';

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, `Route not found: ${req.originalUrl}`, 404);
};
