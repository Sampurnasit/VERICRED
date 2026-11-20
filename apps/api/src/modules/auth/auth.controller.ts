import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { registerUserSchema, loginUserSchema } from '@vericred/shared';
import { sendSuccess } from '../../utils/response.js';
import { ENV } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerUserSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.register(input);

      res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, { user, accessToken }, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginUserSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(input);

      res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { user, accessToken });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided' },
        });
        return;
      }

      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(
        refreshToken
      );

      res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { accessToken });
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    sendSuccess(res, { message: 'Logged out successfully' });
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
