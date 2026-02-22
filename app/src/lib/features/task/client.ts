import type { TaskGET, TaskJSON } from "./models";
import { fetchIntoResult } from "$lib/utils";

export function processTaskJson(json: TaskJSON) {
    const result: TaskGET = {
        id: json.id,
        project_id: json.project_id,
        title: json.title,
        content: json.content,
        assignee_id: json.assignee_id,
        budget: json.budget,
        status: json.status,
        deadline: new Date(json.deadline),
        created_at: new Date(json.created_at),
        skills: json.skills,
        proposal_status: json.proposal_status as ProposalStatus,
        proposal_id: json.proposal_id,
        proposal_content: json.proposal_content,
        proposal_submission_date: json.proposal_submission_date ? new Date(json.proposal_submission_date) : undefined,
        proposal_budget: json.proposal_budget,
    };
    return result;
}

export type ProposalStatus = "declined" | "approved" | "pending" | "cancelled";

export const taskClient = (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => {
    return {
        
    }
}