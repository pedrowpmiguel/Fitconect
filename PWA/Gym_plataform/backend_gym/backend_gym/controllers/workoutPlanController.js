import * as workoutPlanService from '../services/workoutPlanService.js';

export async function createPlan(req, res, next) {
	try {
		// req.body contém os dados do plano; req.user.id é o criador (trainer)
		const plan = await workoutPlanService.createWorkoutPlan(req.body, req.user?.id);
		return res.status(201).json({ success: true, plan });
	} catch (err) {
		return next(err);
	}
}

export async function completeSession(req, res, next) {
	try {
		// params.planId, body.sessionId, body.week
		const plan = await workoutPlanService.markSessionCompleted(req.params.planId, req.body.sessionId, req.body.week);
		return res.status(200).json({ success: true, plan });
	} catch (err) {
		return next(err);
	}
}

export async function getStats(req, res, next) {
	try {
		const stats = await workoutPlanService.getPlanStats(req.params.planId);
		return res.status(200).json({ success: true, stats });
	} catch (err) {
		return next(err);
	}
}
