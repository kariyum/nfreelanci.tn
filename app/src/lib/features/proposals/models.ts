import type { TaskGET } from "../task/models";

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

export interface TaskProposalsGET {
    task: TaskGET | undefined,
    proposals: ProposalGET[]
}