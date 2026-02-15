import type { TaskGET, TaskJSON, TaskPOST } from "../task/models";

export interface ProjectJSON {
    id: number;
    user_id: number;
    title: string;
    budget: number;
    currency_code: string;
    content: string;
    created_at: string;
    deadline: string;
    tasks?: Array<TaskJSON>;
}

export interface ProjectGET {
    id?: number;
    user_id: string;
    title: string;
    content: string;
    budget: number;
    currency_code: string;
    deadline: Date;
    created_at: Date;
    tasks?: Array<TaskGET>;
}

export interface ProjectPOST {
    id?: number;
    title: string;
    content: string;
    budget: number;
    deadline: string;
    tasks?: Array<TaskPOST>;
}

export interface TaskForm {
    title?: string;
    content?: string;
    deadline?: string;
    budget?: number;
    skills?: string[];
}

export interface ProjectForm {
    title: string;
    content: string;
    budget: number;
    deadline: string;
}
