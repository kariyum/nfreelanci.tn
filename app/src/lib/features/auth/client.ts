import { fetchIntoResult } from '$lib/utils';

type UserJson = {
	sub: string;
	role: string;
};

export interface User {
	email: string;
	role: 'freelancer' | 'recruiter';
}

export const authClient = (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
) => {
	return {
		get: async () => {
			const claimsResponse = await fetchIntoResult<UserJson>(() => fetch('/api/auth/whoami'));
			const parsedResponse = claimsResponse.map((userJson) => {
				return {
					email: userJson.sub,
					role: userJson.role
				} as User;
			});
			return parsedResponse;
		}
	};
};
