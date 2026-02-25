import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

export interface AppConfig {
	production: boolean;
	backendUrl: string;
	useEmulators: boolean;
	firebase: {
		apiKey: string;
		authDomain: string;
		projectId: string;
		storageBucket: string;
		messagingSenderId: string;
		appId: string;
		measurementId?: string;
	};
}

@Injectable({
	providedIn: "root",
})
export class ConfigService {
	private config: AppConfig | null = null;
	private http = inject(HttpClient);

	async loadConfig(): Promise<void> {
		this.config = await firstValueFrom(
			this.http.get<AppConfig>("/assets/config/config.json"),
		);
	}

	get configuration(): AppConfig {
		if (!this.config) {
			throw new Error("Configuration not loaded. Ensure APP_INITIALIZER ran.");
		}
		return this.config;
	}

	get backendUrl(): string {
		return this.configuration.backendUrl;
	}

	get firebase(): AppConfig["firebase"] {
		return this.configuration.firebase;
	}
}
