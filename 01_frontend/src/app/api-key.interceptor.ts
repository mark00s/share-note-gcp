import type { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";

/**
 * HTTP interceptor that adds the API key to outgoing requests.
 * Uses AuthService to retrieve the API key in an SSR-safe manner.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);

	const apiKey = authService.getApiKey();
	if (!apiKey) {
		return next(req);
	}

	const clonedRequest = req.clone({
		setHeaders: {
			"X-API-Key": apiKey,
		},
	});

	return next(clonedRequest);
};
