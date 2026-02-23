import {
	type ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import {
	provideClientHydration,
	withEventReplay,
} from "@angular/platform-browser";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { apiKeyInterceptor } from "./api-key.interceptor";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
    	provideHttpClient(withInterceptors([apiKeyInterceptor])),
		provideRouter(routes),
		provideClientHydration(withEventReplay()),
	],
};
