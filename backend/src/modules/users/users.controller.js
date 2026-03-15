import * as authService from '../auth/auth.service.js';

export async function updateProfile(req, res, next) {
  try {
    const updatedUser = await authService.updateProfile(req.user.userId, req.body);
    res.json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword(req.user.userId, req.body);
    res.json({
      status: 'success',
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}
