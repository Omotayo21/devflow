import * as activitiesService from './activities.service.js';

export async function getWorkspaceActivity(req, res, next) {
  try {
    const result = await activitiesService.getWorkspaceActivity(
      req.params.workspaceId,
      req.user.userId,
      req.query
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}