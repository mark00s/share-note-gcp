import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {
	type ApplicationConfig,
	inject,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { apiKeyInterceptor } from "./api-key.interceptor";
import { routes } from "./app.routes";
import { authErrorInterceptor } from "./auth-error.interceptor";
import { ConfigService } from "./config.service";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(
			withInterceptors([apiKeyInterceptor, authErrorInterceptor]),
		),
		provideRouter(routes),
		provideAppInitializer(() => inject(ConfigService).loadConfig()),
	],
};
