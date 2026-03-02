import type { FetchErrors } from "./types";
import { writable, get } from 'svelte/store'

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
  const month = (createdAt.getMonth() + 1).toString().padStart(2, "0");
  const day = createdAt.getDate().toString().padStart(2, "0");
  return `${day}/${month}/${createdAt.getFullYear()}`
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
  return s.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).reduce((w1, w2) => w1 + " " + w2)
}

export function formatBudget(s: number): string {
  return s.toFixed(3)
}

export function isPathPublic(pathname: string): boolean {
  const pathInclusionEqualityCheck = ["/"]
  const pathStartsWithCheck = ["/register", "/login"]
  const isPathPublic = pathInclusionEqualityCheck.includes(pathname) ||
    pathStartsWithCheck.some((path) => pathname.startsWith(path))
  return isPathPublic;
}

export function getRedirectionUrl(pathname: string): string {
  const redirectionUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
  return redirectionUrl;
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFound';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ClientError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ClientError';
    this.status = status;
  }
}

export class ServerError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

export class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingError';
  }
}

// Result type implementation with generics and custom errors
export class Result<T, E> {
  constructor(public readonly value?: T, public readonly error?: E) { }

  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value);
  }

  static err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error);
  }

  isOk() {
    return this.error === undefined;
  }

  isErr() { //  this is Err<T, E>
    return this.error !== undefined;
  }

  map<U>(f: (value: T) => U): Result<U, E> {
    const t = this;
    if (t.isOk()) {
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
    const t = this;
    if (this.isOk()) {
      return this.value!;
    } else {
      throw t.error;
    }
  }
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

export async function fetchIntoResult<T>(fetch: () => Promise<Response>): Promise<Result<T, FetchErrors>> {
  return fetch()
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          return Result.err<T, FetchErrors>({ unauthorizedError: new UnauthorizedError('Unauthorized') });
        }
        else if (response.status === 404) {
          return Result.err<T, FetchErrors>({ notFound: new NotFound('Not found') })
        }
        else if (400 <= response.status && response.status < 500) {
          return Result.err<T, FetchErrors>({ clientError: new ClientError(response.status, 'Client error') });
        } else if (500 <= response.status) {
          return Result.err<T, FetchErrors>({ serverError: new ServerError(response.status, 'Server error') });
        }
        return Result.err<T, FetchErrors>({ networkError: new NetworkError(`Fetch error ${response.status}`) });
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json()
          .then(data => Result.ok<T, FetchErrors>(data))
          .catch(() => Result.err<T, FetchErrors>({ parsingError: new ParsingError('Parsing error') }));
      } else {
        return response.text()
          .then((text) => Result.ok<T, FetchErrors>(text as T));
      }
    })
    .catch(error => {
      return Result.err<T, FetchErrors>({ networkError: new NetworkError(error.message) });
    });
}

export function shouldRedirect(result: Result<any, FetchErrors>, pathname: string): boolean {
  if (result.error?.unauthorizedError !== undefined && !isPathPublic(pathname)) {
    return true;
  }
  return false;
}

export function snakeToCapital(value: string): string {
  return value.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(val))
    }
  })

  window.addEventListener('storage', () => {
    const storedValueStr = localStorage.getItem(key);
    if (storedValueStr == null) return;

    const localValue = JSON.parse(storedValueStr)
    if (localValue !== get(store)) store.set(localValue);
  });

  return store;
}



export const waitFor = async (duration: number) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(3), 2000);
});