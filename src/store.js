import { writable } from 'svelte/store';

export const todos = writable([]);
export const token = writable('');
export const isAuthenticated = writable(false);
export const user = writable({});
export const popupOpen = writable(false);
export const error = writable();
export const errorArr = writable([]);
export const loader = writable(0);
