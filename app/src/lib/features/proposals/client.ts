import { browser } from '$app/environment';
import { page } from '$app/state';
import type { Fetch } from '$lib/types';
import { FetchErr, fetchIntoResult, UnauthorizedError } from '$lib/utils';
import type { ProposalGET, ProposalJSON } from './models';

function processProposalJSON(json: ProposalJSON) {
	const result: ProposalGET = {
		...json,
		created_at: new Date(json.created_at)
	};
	return result;
}

export const proposalsClient = (fetch: Fetch) => {
	return {
		getByProductIdTaskId: async (productId: string, taskId: string) => {
			const proposalsResult = await fetchIntoResult<ProposalJSON[]>(() =>
				fetch(`/api/projects/${productId}/task/${taskId}/proposals`, { method: 'GET' })
			);
			return proposalsResult.map((proposalsJson) => proposalsJson.map(processProposalJSON));
		},
		patchProposalStatus: async (proposalId: number, action: string) => {
			const payload = {
				action
			};
			const response = await fetchIntoResult(() =>
				fetch(`/api/proposals/${proposalId}/status`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				})
			);
			return response;
		},
		createProposal: async (taskId: number) => {
			const payload = {
				task_id: taskId
			};
			const response = await fetchIntoResult(() =>
				fetch('/api/proposals', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				})
			);
			return response;
		},
		updateProposal: async (proposalId: number, content: string, budget: string) => {
			const payload = {
				content: content,
				budget: parseFloat(budget)
			};
			const result = await fetchIntoResult<string>(() =>
				fetch(`/api/proposals/${proposalId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				})
			);
			return result;
		}
	};
};
