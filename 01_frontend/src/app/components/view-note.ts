import {
	Component,
	type OnInit,
	inject,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	DestroyRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../services/api";
import { catchError, finalize, retry, timeout } from "rxjs/operators";
import * as CryptoJS from "crypto-js";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { of } from "rxjs";
import { HTTP_CONFIG } from "../constants";

@Component({
	selector: "app-view-note",
	standalone: true,
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="max-w-xl w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
        <h2 class="text-2xl font-bold mb-6 text-blue-400">Retrieve your secret message</h2>

        <div *ngIf="isLoading" class="text-gray-400 mb-4 animate-pulse">Fetching encrypted data...</div>

        <div *ngIf="errorMessage" class="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
          {{ errorMessage }}
        </div>

        <div *ngIf="encryptedContent && !decryptedContent">
          <p class="text-gray-400 mb-4">This message is end-to-end encrypted. Provide the password to decrypt it on your device.</p>
          <input #passwordInput type="password" placeholder="Message password..."
                 class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none">
          <button (click)="decryptNote(passwordInput.value)"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Decrypt on your device
          </button>
        </div>

        <div *ngIf="decryptedContent">
          <div class="p-4 bg-gray-900 border border-green-500/50 rounded-lg text-green-100 whitespace-pre-wrap wrap-break-word">
            {{ decryptedContent }}
          </div>
          <p class="text-xs text-gray-500 mt-4 text-center">Message decrypted successfully and securely on your device.</p>
        </div>
      </div>
    </div>
  `,
})
export class ViewNoteComponent implements OnInit {
	private apiService = inject(ApiService);
	private cdr = inject(ChangeDetectorRef);
	private destroyRef = inject(DestroyRef);
	private route = inject(ActivatedRoute);

	noteId: string | null = null;
	encryptedContent: string | null = null;
	decryptedContent: string | null = null;

	isLoading = false;
	errorMessage: string | null = null;

	ngOnInit(): void {
		this.noteId = this.route.snapshot.paramMap.get("id");

		if (this.noteId) this.fetchNote();
	}

	fetchNote(): void {
		if (!this.noteId) return;

		this.isLoading = true;
		this.apiService
			.getNote(this.noteId)
			.pipe(
				timeout(HTTP_CONFIG.TIMEOUT_MS),
				retry({
					count: HTTP_CONFIG.RETRY_COUNT,
					delay: HTTP_CONFIG.RETRY_DELAY_MS,
				}),
				takeUntilDestroyed(this.destroyRef),
				catchError((err) => {
					console.error("Failed to fetch note:", err);

					if (err.name === "TimeoutError") {
						this.errorMessage = "Request timed out. Please try again.";
					} else if (err.status === 404) {
						this.errorMessage = "Note not found or has expired.";
					} else if (err.status === 401 || err.status === 403) {
						this.errorMessage = "Access denied. Invalid or missing API key.";
					} else {
						this.errorMessage = "Failed to retrieve note. Please try again.";
					}

					// Return observable to complete the stream
					return of(null);
				}),
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (response) => {
					this.encryptedContent = response?.content ?? null;
				},
			});
	}

	decryptNote(password: string): void {
		const trimmedPassword = password?.trim();

		if (!trimmedPassword || !this.encryptedContent) {
			this.errorMessage = "Password is required.";
			this.safeMarkForCheck();
			return;
		}

		if (trimmedPassword.length < 4) {
			this.errorMessage = "Password must be at least 4 characters.";
			this.safeMarkForCheck();
			return;
		}

		try {
			const bytes = CryptoJS.AES.decrypt(
				this.encryptedContent,
				trimmedPassword,
			);
			const originalText = bytes.toString(CryptoJS.enc.Utf8);

			if (!originalText || originalText.includes("\ufffd")) {
				this.errorMessage =
					"Failed to decrypt. Incorrect password or corrupted data.";
				this.decryptedContent = null;
			} else {
				this.decryptedContent = originalText;
				this.errorMessage = null;
			}
			this.safeMarkForCheck();
		} catch (e) {
			console.error("Decryption error:", e);
			this.errorMessage =
				"An error occurred during decryption. Please try again.";
			this.decryptedContent = null;
			this.safeMarkForCheck();
		}
	}

	private safeMarkForCheck(): void {
		try {
			this.cdr.markForCheck();
		} catch (e) {
			// Component already destroyed, ignore
		}
	}
}
