import type { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "./auth.service";

/**
 * HTTP interceptor that handles authentication errors globally.
 * Automatically clears the API key when receiving 401 or 403 responses.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);

	return next(req).pipe(
		catchError((error) => {
			// Handle authentication/authorization errors
			if (error.status === 401 || error.status === 403) {
				// Clear the invalid API key
				authService.clearKey();
			}

			// Re-throw the error so components can still handle it if needed
			return throwError(() => error);
		}),
	);
};
