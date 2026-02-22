export type ProposalStatus = "declined" | "approved" | "pending" | "cancelled";

export interface TaskJSON {
    id: number,
    project_id: number,
    title: string,
    content: string,
    assignee_id: string,
    budget: number,
    status: string,
    deadline: string,
    created_at: string,
    skills: string[],
    proposal_status: string | undefined,
    proposal_id: number | undefined,
    proposal_content: string | undefined,
    proposal_submission_date: string | undefined,
    proposal_budget: number | undefined,
}

export interface TaskGET {
    id: number,
    project_id: number,
    title: string,
    content: string,
    assignee_id: string,
    budget: number,
    status: string,
    skills: string[],
    deadline: Date,
    created_at: Date,
    proposal_status: ProposalStatus | undefined,
    proposal_id: number | undefined,
    proposal_content: string | undefined,
    proposal_submission_date: Date | undefined,
    proposal_budget: number | undefined,
}

export interface TaskPOST {
    title: string,
    content: string,
    assignee_id: string,
    skills: string[]
    budget: number,
    status: string,
    deadline: string,
}