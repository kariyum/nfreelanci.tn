// See https://kit.svelte.dev/docs/types#app

import type { User } from '$lib/features/auth/client';
import type { FetchErr, FetchOk } from '$lib/utils';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
		}
		// interface Locals {}
		interface PageData {
			user: FetchOk<User> | FetchErr;
		}
		interface PageState {
			projectEditMode: boolean;
			showTaskPopup: boolean;
			profileEditMode: boolean;
		}
		// interface Platform {}
	}
}

export {};
