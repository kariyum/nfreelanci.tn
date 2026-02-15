import type { Snippet } from "svelte";
import type { NetworkError, TimeoutError, ClientError, ServerError, ParsingError, UnauthorizedError, NotFound } from "./utils";


export type ClientMessage = {
    discussion_id: number,
    content: string,
    receivers: string[],
}

export interface Discussion {
    id: number;
    title: string;
    created_at: string;
    created_by: string;
    user_ids: Array<string>
}

export type FetchErrors = {
    networkError?: NetworkError;
    timeoutError?: TimeoutError;
    clientError?: ClientError;
    serverError?: ServerError;
    parsingError?: ParsingError;
    unauthorizedError?: UnauthorizedError;
    notFound?: NotFound;
}

export interface Tab {
    snippet: Snippet;
    title: string;
    url: string,
    tab: string
}