import { Injectable, signal, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HTTP_STORAGE } from "./constants";

/**
 * Centralized service for managing API key authentication state.
 * Provides signal-based reactive state management and SSR-safe localStorage access.
 */
@Injectable({ providedIn: "root" })
export class AuthService {
	private platformId = inject(PLATFORM_ID);
	// Just to make it shorter...
	private readonly apiKeyStorageKey = HTTP_STORAGE.API_KEY_STORAGE_KEY;

	/**
	 * Reactive signal indicating whether an API key is currently stored.
	 * Components can use this signal to reactively show/hide UI elements.
	 */
	readonly hasApiKey = signal<boolean>(this.isApiKeySet());

	/**
	 * Checks if an API key exists in localStorage in a SSR-safe wae.
	 */
	private isApiKeySet(): boolean {
		return this.isBrowser() && !!localStorage.getItem(this.apiKeyStorageKey);
	}

	/**
	 * Retrieves the current API key from localStorage (SSR-safe wae).
	 * @returns The API key string or null if not found or not in browser.
	 */
	getApiKey(): string | null {
		return !this.isBrowser()
			? null
			: localStorage.getItem(this.apiKeyStorageKey);
	}

	/**
	 * Saves an API key to localStorage and updates the hasApiKey signal.
	 * @param key The API key to save (will be trimmed).
	 * @returns true if saved successfully, false otherwise.
	 */
	setKey(key: string): boolean {
		if (!this.isBrowser()) return false;

		const trimmedKey = key.trim();

		if (!trimmedKey) return false;

		localStorage.setItem(this.apiKeyStorageKey, trimmedKey);
		this.hasApiKey.set(true);

		return true;
	}

	/**
	 * Removes the API key from localStorage and updates the hasApiKey signal.
	 * This should be called when receiving 401/403 errors or on explicit logout.
	 */
	clearKey(): void {
		if (!this.isBrowser()) return;

		localStorage.removeItem(this.apiKeyStorageKey);
		this.hasApiKey.set(false);
	}

	/**
	 * Return true if the platform is a browser.
	 */
	isBrowser(): boolean {
		return isPlatformBrowser(this.platformId);
	}
}
