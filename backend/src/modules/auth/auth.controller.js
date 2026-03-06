import * as authService from './auth.service.js';

const cookieOptions = {
  httpOnly: true,      // JS cannot access this cookie
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',  // never sent cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: { user },
    });
  } catch (err) {
    next(err); // passes to central error handler
  }
}

export async function login(req, res, next) {
  try {
    const { accessToken, refreshToken, user } =
      await authService.loginUser(req.body);

    // Refresh token goes in httpOnly cookie — JS can't steal it
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      status: 'success',
      data: { accessToken, user },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.json({ status: 'success', data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logoutUser(refreshToken, req.user?.userId);
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ status: 'success', message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}