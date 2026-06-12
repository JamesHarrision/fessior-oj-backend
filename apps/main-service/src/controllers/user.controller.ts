import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'Error', message: 'Unauthorized' });
      return;
    }
    
    const user = await userService.getMe(userId);
    
    res.status(200).json({
      status: 'Success',
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};