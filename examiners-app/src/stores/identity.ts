import { writable, Writable } from "svelte/store";

export const usernameStore: Writable<string> = writable("");
export const identityStore: Writable<string> = writable("");