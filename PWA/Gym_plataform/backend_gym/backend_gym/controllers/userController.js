import * as userService from '../services/userService.js';

/* Minimal Express-style handlers (assume async error middleware or try/catch in router) */

export async function postRequestTrainerChange(req, res) {
    // req.params.id = clientId, req.body.requestedTrainer, req.body.reason
    const client = await userService.requestTrainerChange(req.params.id, req.body.requestedTrainer, req.body.reason);
    return res.status(200).json({ success: true, client: client.getPublicProfile() });
}

export async function postProcessTrainerChange(req, res) {
    // req.params.id = clientId, req.body.action = 'approve'|'reject', req.user.id = processorId
    const client = await userService.processTrainerChangeRequest(req.params.id, req.body.action, req.user.id);
    return res.status(200).json({ success: true, client: client.getPublicProfile() });
}

export async function postAssignTrainer(req, res) {
    // req.params.id = clientId, req.body.trainerId, req.user.id = adminId
    const client = await userService.assignTrainerToClient(req.params.id, req.body.trainerId, req.user.id);
    return res.status(200).json({ success: true, client: client.getPublicProfile() });
}

export async function postApproveTrainer(req, res) {
    // req.params.id = trainerId, req.user.id = adminId
    const trainer = await userService.approveTrainer(req.params.id, req.user.id);
    return res.status(200).json({ success: true, trainer: trainer.getPublicProfile() });
}
