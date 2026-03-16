import * as projectsService from './projects.service.js';

export async function createProject(req, res, next) {
  try {
    const project = await projectsService.createProject(
      { ...req.body, workspaceId: req.params.workspaceId },
      req.user.userId
    );
    res.status(201).json({ status: 'success', data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function getWorkspaceProjects(req, res, next) {
  try {
    const projects = await projectsService.getWorkspaceProjects(
      req.params.workspaceId,
      req.user.userId
    );
    res.json({ status: 'success', data: { projects } });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await projectsService.getProjectById(
      req.params.projectId,
      req.user.userId
    );
    res.json({ status: 'success', data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await projectsService.updateProject(
      req.body,
      req.params.projectId,
      req.user.userId
    );
    res.json({ status: 'success', data: { project } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const result = await projectsService.deleteProject(
      req.params.projectId,
      req.user.userId
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}
