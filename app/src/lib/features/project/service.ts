import { processTaskJson } from "../task/client";
import type { ProjectJSON, ProjectGET } from "./models";

export function processProjectJson(json: ProjectJSON): ProjectGET {
    const project: ProjectGET = {
        id: json.id,
        user_id: json.user_id.toString(),
        title: json.title,
        budget: json.budget,
        currency_code: json.currency_code,
        content: json.content,
        created_at: new Date(json.created_at),
        deadline: new Date(json.deadline),
        tasks: json.tasks?.map((task) => processTaskJson(task)),
    }
    return project;
}

export const parseProjectJSON = (jsonData: ProjectJSON[]) => jsonData.map((json) => processProjectJson(json));