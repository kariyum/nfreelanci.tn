import type { Snippet } from 'svelte';

export type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type ClientMessage = {
	discussion_id: number;
	content: string;
	receivers: string[];
};

export interface Discussion {
	id: number;
	title: string;
	created_at: string;
	created_by: string;
	user_ids: Array<string>;
}

export interface Tab {
	snippet: Snippet;
	title: string;
	url: string;
	tab: string;
}
