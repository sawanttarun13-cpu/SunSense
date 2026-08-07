/**
 * ---------------------------------------------------------
 * File: validators.ts
 * Purpose:
 * Backend file for validators.
 * ---------------------------------------------------------
 */

import { z } from 'zod';

// Backend logic for validators.
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const DeviceRegisterSchema = z.object({
  name: z.string().min(1).max(255),
});

export const DeviceAuthenticateSchema = z.object({}); // Authenticates via headers
