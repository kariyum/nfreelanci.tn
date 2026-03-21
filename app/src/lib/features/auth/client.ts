import { fetchIntoResult } from '$lib/utils';

export type UserJson = {
	sub: string;
	email: string;
	role: string | null;
	name: string;
	last_name: string;
};

export type User = {
	sub: string;
	email: string;
	role: 'freelancer' | 'recruiter';
	name: string;
	last_name: string;
};

export const authClient = (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
) => {
	return {
		get: async () => {
			const claimsResponse = await fetchIntoResult<UserJson>(() => fetch('/api/auth/whoami'));
			return claimsResponse;
		}
	};
};
