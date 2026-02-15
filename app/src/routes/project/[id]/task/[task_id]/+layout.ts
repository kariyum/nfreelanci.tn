import type { TaskGET } from "$lib/features/task/models";
import { fetchIntoResult } from "$lib/utils.js";

export interface ProposalJSON {
    id: number,
    user_id: string,
    task_id: number,
    status: string,
    budget: number | undefined,
    content: string | undefined,
    created_at: string,
}

export interface ProposalGET {
    id: number,
    user_id: string,
    task_id: number,
    status: string,
    budget: number | undefined,
    content: string | undefined,
    created_at: Date,
}

function processProposalJSON(json: ProposalJSON) {
    const result: ProposalGET = {
        ...json,
        created_at: new Date(json.created_at)
    }
    return result;
}

export interface TaskProposalsGET {
    task: TaskGET | undefined,
    proposals: ProposalGET[]
}

export async function load({ fetch, params, parent }) {
    const proposals = await fetchIntoResult<ProposalJSON[]>(() => fetch(`/api/projects/${params.id}/task/${params.task_id}/proposals`, { method: "GET" }));
    const praseProposalJSON = (jsonData: ProposalJSON[]) => jsonData.map((json) => processProposalJSON(json));
    const maybeProposals = proposals.map((value: ProposalJSON[]) => praseProposalJSON(value))
    const parentData = await parent();
    return {
        error: maybeProposals.error,
        proposals: maybeProposals.unwrap(),
        task: parentData.project?.tasks?.find((task) => task.id.toString() === params.task_id)
    };
}