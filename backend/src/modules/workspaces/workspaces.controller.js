import * as workspacesService from './workspaces.service.js';

export async function createWorkspace(req, res, next) {
  try {
    const workspace = await workspacesService.createWorkspace(
      req.body,
      req.user.userId
    );
    res.status(201).json({ status: 'success', data: { workspace } });
  } catch (err) {
    next(err);
  }
}

export async function getMyWorkspaces(req, res, next) {
  try {
    const workspaces = await workspacesService.getUserWorkspaces(req.user.userId);
    res.json({ status: 'success', data: { workspaces } });
  } catch (err) {
    next(err);
  }
}

export async function getWorkspace(req, res, next) {
  try {
    const workspace = await workspacesService.getWorkspaceById(
      req.params.workspaceId,
      req.user.userId
    );
    res.json({ status: 'success', data: { workspace } });
  } catch (err) {
    next(err);
  }
}

export async function inviteMember(req, res, next) {
  try {
    const result = await workspacesService.inviteMember(
      { ...req.body, workspaceId: req.params.workspaceId },
      req.user.userId
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMembers(req, res, next) {
  try {
    const members = await workspacesService.getWorkspaceMembers(
      req.params.workspaceId,
      req.user.userId
    );
    res.json({ status: 'success', data: { members } });
  } catch (err) {
    next(err);
  }
}

export async function deleteWorkspace(req, res, next) {
  try {
    const result = await workspacesService.deleteWorkspace(
      req.params.workspaceId,
      req.user.userId
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}