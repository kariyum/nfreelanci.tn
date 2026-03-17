import { writable, get } from 'svelte/store';

export const cyrb53 = (str: string, seed = 0) => {
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export function validateEmail(email: string): boolean {
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
}

export function formatDate(createdAt: Date): string {
	const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
	const day = createdAt.getDate().toString().padStart(2, '0');
	return `${day}/${month}/${createdAt.getFullYear()}`;
}

export function formatDateSentence(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	};
	return date.toLocaleDateString('en-GB', options);
}

export function capitalize(s: string): string {
	return s
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.reduce((w1, w2) => w1 + ' ' + w2);
}

export function formatBudget(s: number): string {
	return s.toFixed(3);
}

export function isPathPublic(pathname: string): boolean {
	const pathInclusionEqualityCheck = ['/'];
	const pathStartsWithCheck = ['/register', '/login'];
	const isPathPublic =
		pathInclusionEqualityCheck.includes(pathname) ||
		pathStartsWithCheck.some((path) => pathname.startsWith(path));
	return isPathPublic;
}

export function getRedirectionUrl(pathname: string): string {
	const redirectionUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
	return redirectionUrl;
}

const errorsPriority = [
	'NetworkError',
	'TimeoutError',
	'ParsingError',
	'ClientError',
	'ServerError',
	'NotFound',
	'UnauthorizedError'
];

export abstract class FetchError extends Error {
	public readonly priority: number;
	public readonly status: number;
	constructor(name: string, message: string, status: number) {
		super(message);
		this.priority = errorsPriority.findIndex((str) => str == name);
		this.status = status;
		if (this.priority == -1) {
			throw new Error('Fetch error priority setup error');
		}
	}
}

export class UnauthorizedError extends FetchError {
	constructor(message: string) {
		super('UnauthorizedError', message, 401);
	}
}

export class NotFound extends FetchError {
	constructor(message: string) {
		super('NotFound', message, 404);
	}
}

export class NetworkError extends FetchError {
	constructor(status: number, message: string) {
		super('NetworkError', message, status);
	}
}

export class TimeoutError extends FetchError {
	constructor(status: number, message: string) {
		super('TimeoutError', message, status);
	}
}

export class ClientError extends FetchError {
	constructor(status: number, message: string) {
		super('ClientError', message, status);
	}
}

export class ServerError extends FetchError {
	constructor(status: number, message: string) {
		super('ServerError', message, status);
	}
}

export class ParsingError extends FetchError {
	constructor(status: number, message: string) {
		super('ParsingError', message, status);
	}
}

// Result type implementation with generics and custom errors
export class Result<T, E> {
	constructor(
		public readonly value?: T,
		public readonly error?: E
	) {}

	static ok<T, E>(value: T): Result<T, E> {
		return new Result<T, E>(value);
	}

	static err<T, E>(error: E): Result<T, E> {
		return new Result<T, E>(undefined, error);
	}

	isOk() {
		return this.error === undefined;
	}

	isErr() {
		//  this is Err<T, E>
		return this.error !== undefined;
	}

	map<U>(f: (value: T) => U): Result<U, E> {
		if (this.isOk()) {
			return Result.ok<U, E>(f(this.value!));
		} else {
			return Result.err<U, E>(this.error!);
		}
	}

	flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E> {
		if (this.isOk()) {
			return f(this.value!);
		} else {
			return Result.err<U, E>(this.error!);
		}
	}

	getOrElse(defaultValue: T): T {
		return this.isOk() ? this.value! : defaultValue;
	}

	unwrap(): T {
		if (this.isOk()) {
			return this.value!;
		} else {
			throw this.error;
		}
	}

	// static combine<T extends Record<string, Result<any, E>>, E>(
	// 	obj: T
	// ): Result<{ [K in keyof T]: T[K] extends Result<infer V, E> ? V : never }, E> {
	// 	const result: any = {};

	// 	for (const key in obj) {
	// 		const item = obj[key];
	// 		if (item.isErr()) {
	// 			return Result.err<any, E>(item.error!);
	// 		}
	// 		result[key] = item.value;
	// 	}

	// 	return Result.ok(result);
	// }
}

export class Ok<T, E> extends Result<T, E> {
	constructor(value: T) {
		super(value, undefined);
	}
}

export class Err<T, E> extends Result<T, E> {
	constructor(error: E) {
		super(undefined, error);
	}
}

export class FetchResult<T> {
	constructor(
		public readonly value?: T,
		public readonly error?: FetchError
	) {}

	static ok<T>(value: T): FetchResult<T> {
		return new FetchOk<T>(value);
	}

	static err<T>(error: FetchError): FetchResult<T> {
		return new FetchErr(error);
	}

	toResult(): Result<T, FetchError> {
		return new Result(this.value, this.error);
	}

	static reduce(fetchResults: FetchResult<unknown>[]): FetchError | undefined {
		const failedResults = fetchResults
			.map((result) => result.error)
			.filter((result) => result !== undefined);
		return failedResults.toSorted((err1, err2) => err1.priority - err2.priority).at(0);
	}

	isOk(): this is FetchResult<T> & { error: undefined; value: T } {
		return this.error === undefined;
	}

	isErr(): this is FetchError & { error: FetchError; value: undefined } {
		return this.value === undefined;
	}

	map<U>(f: (value: T) => U): FetchResult<U> {
		if (this.isOk()) {
			return new FetchOk(f(this.value!));
		} else {
			return new FetchErr(this.error!);
		}
	}

	flatMap<U>(f: (value: T) => FetchResult<U>): FetchResult<U> {
		if (this.isOk()) {
			return f(this.value!);
		} else {
			return new FetchErr(this.error!);
		}
	}

	getOrElse(defaultValue: T): T {
		return this.isOk() ? this.value! : defaultValue;
	}

	unwrap(): T {
		if (this.isOk()) {
			return this.value!;
		} else {
			throw this.error;
		}
	}
}

export class FetchErr extends FetchResult<never> {
	constructor(error: FetchError) {
		super(undefined, error);
	}
}

export class FetchOk<T> extends FetchResult<T> {
	constructor(value: T) {
		super(value);
	}
}

async function responseToFetchResult<T>(response: Response): Promise<FetchOk<T> | FetchErr> {
	const responseData = await responseFetchData<T>(response);
	if (response.status === 401) {
		return new FetchErr(new UnauthorizedError('Unauthorized'));
	} else if (response.status === 404) {
		return new FetchErr(new NotFound('Not found'));
	} else if (400 <= response.status && response.status < 500) {
		return new FetchErr(new ClientError(response.status, 'Client error'));
	} else if (500 <= response.status) {
		return new FetchErr(new ServerError(response.status, 'Server error'));
	} else if (!response.ok) {
		return new FetchErr(new NetworkError(response.status, `Fetch error ${response.status}`));
	}
	return responseData.map((value) => value as T);
}

async function responseFetchData<T>(response: Response): Promise<FetchOk<T | string> | FetchErr> {
	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		return response
			.json()
			.then((data) => new FetchOk<T>(data))
			.catch(() => new FetchErr(new ParsingError(response.status, 'Parsing error')));
	} else {
		return response.text().then((text) => new FetchOk<T>(text as T));
	}
}

export async function fetchIntoResult<T>(
	fetch: () => Promise<Response>
): Promise<FetchOk<T> | FetchErr> {
	return fetch()
		.then((response) => responseToFetchResult<T>(response))
		.catch((error) => {
			return FetchResult.err(new NetworkError(408, error.message));
		});
}

export function shouldRedirect<T>(result: Result<T, FetchError>, pathname: string): boolean {
	if (result.error instanceof UnauthorizedError && !isPathPublic(pathname)) {
		return true;
	}
	return false;
}

export function snakeToCapital(value: string): string {
	return value
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function computeTimeAgo(date: Date): string {
	const now = new Date();

	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	if (seconds < 60) return `just now`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} min` + (minutes != 1 ? 's' : '') + ' ago';
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hours ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days} days ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months} months ago`;
	const years = Math.floor(months / 12);
	return `${years} years ago`;
}

export const storage = (key: string, initValue: any) => {
	const store = writable(initValue);

	const storedValueStr = localStorage.getItem(key);
	if (storedValueStr != null) store.set(JSON.parse(storedValueStr));

	store.subscribe((val) => {
		if ([null, undefined].includes(val)) {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, JSON.stringify(val));
		}
	});

	window.addEventListener('storage', () => {
		const storedValueStr = localStorage.getItem(key);
		if (storedValueStr == null) return;

		const localValue = JSON.parse(storedValueStr);
		if (localValue !== get(store)) store.set(localValue);
	});

	return store;
};

export const waitFor = async (duration: number) =>
	new Promise((resolve) => {
		setTimeout(() => resolve(3), duration);
	});

export function clickOutside(node: HTMLElement, callback: () => void) {
	const handleClick = (event: PointerEvent) => {
		if (node && !node.contains(event.target as Node)) {
			callback();
		}
	};

	document.addEventListener('click', handleClick);

	return {
		destroy() {
			document.removeEventListener('click', handleClick);
		}
	};
}
