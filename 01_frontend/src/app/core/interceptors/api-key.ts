import type { HttpInterceptorFn } from "@angular/common/http";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
	const platformId = inject(PLATFORM_ID);

	if (!isPlatformBrowser(platformId)) {
		return next(req);
	}

	const apiKey = localStorage.getItem("APP_API_KEY");
	if (!apiKey) return next(req);

	const clonedRequest = req.clone({
		setHeaders: {
			"X-API-Key": apiKey,
		},
	});

	return next(clonedRequest);
};
