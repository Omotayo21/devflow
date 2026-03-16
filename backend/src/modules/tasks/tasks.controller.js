import * as tasksService from './tasks.service.js';

export async function createTask(req, res, next) {
  try {
    const task = await tasksService.createTask(
      { ...req.body, projectId: req.params.projectId },
      req.user.userId
    );
    res.status(201).json({ status: 'success', data: { task } });
  } catch (err) {
    next(err);
  }
}

export async function getProjectTasks(req, res, next) {
  try {
    const result = await tasksService.getProjectTasks(
      req.params.projectId,
      req.user.userId,
      req.query
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await tasksService.updateTask(
      req.params.taskId,
      req.body,
      req.user.userId
    );
    res.json({ status: 'success', data: { task } });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const result = await tasksService.deleteTask(
      req.params.taskId,
      req.user.userId
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}
export async function createComment(req, res, next) {
  try {
    const comment = await tasksService.createComment(
      { ...req.body, taskId: req.params.taskId },
      req.user.userId
    );
    res.status(201).json({ status: 'success', data: { comment } });
  } catch (err) {
    next(err);
  }
}

export async function getTaskComments(req, res, next) {
  try {
    const comments = await tasksService.getTaskComments(
      req.params.taskId,
      req.user.userId
    );
    res.json({ status: 'success', data: { comments } });
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const result = await tasksService.deleteComment(
      req.params.commentId,
      req.user.userId
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateComment(req, res, next) {
  try {
    const comment = await tasksService.updateComment(
      req.params.commentId,
      req.body.content,
      req.user.userId
    );
    res.json({ status: 'success', data: { comment } });
  } catch (err) {
    next(err);
  }
}
