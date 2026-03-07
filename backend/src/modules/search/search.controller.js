import * as searchService from './search.service.js';

export async function search(req, res, next) {
  try {
    const results = await searchService.search(
      req.query.q,
      req.params.workspaceId,
      req.user.userId
    );
    res.json({ status: 'success', data: results });
  } catch (err) {
    next(err);
  }
}
