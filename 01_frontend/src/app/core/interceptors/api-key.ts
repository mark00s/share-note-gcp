import type { HttpInterceptorFn } from "@angular/common/http";

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
	// API Key is stored in localStorage
	const apiKey = localStorage.getItem("APP_API_KEY");

	if (!apiKey) return next(req);

	// Colone request, and add the API Key to the headers
	const clonedRequest = req.clone({
		setHeaders: {
			"X-API-Key": apiKey,
		},
	});

	return next(clonedRequest);
};
