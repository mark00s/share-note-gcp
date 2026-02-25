import {
	type ApplicationConfig,
	inject,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";

import { routes } from "./app.routes";
import { apiKeyInterceptor } from "./api-key.interceptor";
import { ConfigService } from "./config.service";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(withInterceptors([apiKeyInterceptor])),
		provideRouter(routes),
		provideAppInitializer(() => inject(ConfigService).loadConfig()),
	],
};
