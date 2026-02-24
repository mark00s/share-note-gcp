import {
	Component,
	type OnInit,
	inject,
	PLATFORM_ID,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	DestroyRef,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
	FormBuilder,
	type FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { ApiService, type NoteCreateRequest } from "../services/api";
import * as CryptoJS from "crypto-js";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { of } from "rxjs";
import { catchError, finalize, retry, timeout } from "rxjs/operators";
import { HTTP_CONFIG, VALIDATION } from "../constants";

@Component({
	selector: "app-create-note",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, ReactiveFormsModule],
	template: `
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-xl w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">

      <div *ngIf="!hasApiKey" class="text-center">
        <h2 class="text-2xl font-bold mb-4 text-white">Server authorization required</h2>
        <p class="text-gray-400 mb-6">Enter application API Key.</p>
        <input #apiKeyInput type="password" placeholder="Enter API password..."
               class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none">
        <button (click)="saveApiKey(apiKeyInput.value)"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
          Save and unlock
        </button>
      </div>

      <div *ngIf="hasApiKey && !generatedLink">
        <h2 class="text-2xl font-bold mb-6 text-blue-400">New secret note</h2>
        <form [formGroup]="noteForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-gray-400 text-sm font-bold mb-2">Content</label>
            <textarea formControlName="content" rows="5" placeholder="Write down your secret..."
                      class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-400 text-sm font-bold mb-2">Password (Encryption Key)</label>
              <input formControlName="password" type="password" placeholder="Password"
                     class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-gray-400 text-sm font-bold mb-2">Expiration time</label>
              <select formControlName="ttl_minutes"
                      class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option [value]="5">5 minutes</option>
                <option [value]="10">10 minutes</option>
                <option [value]="15">15 minutes</option>
              </select>
            </div>
          </div>
          <div *ngIf="errorMessage" class="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
            {{ errorMessage }}
          </div>
          <button type="submit" [disabled]="noteForm.invalid || isSubmitting"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4">
            {{ isSubmitting ? 'Encrypting and sending...' : 'Encrypt E2E and generate link' }}
          </button>
        </form>
      </div>

      <div *ngIf="generatedLink" class="text-center">
        <h2 class="text-2xl font-bold mb-2 text-green-400">Note Ready!</h2>
        <p class="text-gray-400 mb-6">Share the following URL with recipient. Remember to provide password using different channel than the URL</p>
        <div class="flex items-center space-x-2 bg-gray-900 p-2 rounded-lg border border-gray-600 mb-6">
          <input type="text" readonly [value]="generatedLink" class="flex-1 bg-transparent text-gray-300 outline-none px-2 text-sm">
          <button (click)="copyLink()" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-sm">Copy</button>
        </div>
        <button (click)="resetForm()" class="text-blue-400 hover:text-blue-300 font-bold">Create another one</button>
      </div>
    </div>
  </div>
  `,
})
export class CreateNoteComponent implements OnInit {
	private apiService = inject(ApiService);
	private cdr = inject(ChangeDetectorRef);
	private destroyRef = inject(DestroyRef);
	private fb = inject(FormBuilder);
	private platformId = inject(PLATFORM_ID);

	noteForm!: FormGroup;
	hasApiKey = false;
	isSubmitting = false;
	generatedLink: string | null = null;
	errorMessage: string | null = null;

	ngOnInit(): void {
		if (isPlatformBrowser(this.platformId)) {
			this.hasApiKey = !!localStorage.getItem("APP_API_KEY");
		}
		this.noteForm = this.fb.group({
			content: [
				"",
				[
					Validators.required,
					Validators.minLength(VALIDATION.MIN_CONTENT_LENGTH),
				],
			],
			password: [
				"",
				[
					Validators.required,
					Validators.minLength(VALIDATION.MIN_PASSWORD_LENGTH),
				],
			],
			ttl_minutes: [VALIDATION.MAX_TTL_MINUTES, Validators.required],
		});
	}

	saveApiKey(key: string): void {
		const trimmedKey = key.trim();
		if (trimmedKey && isPlatformBrowser(this.platformId)) {
			localStorage.setItem("APP_API_KEY", trimmedKey);
			this.hasApiKey = true;
		} else {
			this.errorMessage = "Not a browser or password is missing";
		}
		this.safeMarkForCheck();
	}

	onSubmit(): void {
		if (this.noteForm.invalid) return;

		this.isSubmitting = true;
		this.errorMessage = null;

		// Encrypting message
		const encryptedContent = CryptoJS.AES.encrypt(
			this.noteForm.value.content,
			this.noteForm.value.password,
		).toString();

		const payload: NoteCreateRequest = {
			content: encryptedContent,
			ttl_seconds: this.noteForm.value.ttl_minutes * 60,
		};

		this.apiService
			.createNote(payload)
			.pipe(
				timeout(HTTP_CONFIG.TIMEOUT_MS),
				retry({
					count: HTTP_CONFIG.RETRY_COUNT,
					delay: HTTP_CONFIG.RETRY_DELAY_MS,
				}),
				takeUntilDestroyed(this.destroyRef),
				catchError((err) => {
					console.error("Failed to send note:", err);

					if (err.name === "TimeoutError") {
						this.errorMessage = "Request timed out. Please try again.";
					} else if (err.status === 401) {
						this.errorMessage = "Bad API Key.";
						// Remove API Key
						if (isPlatformBrowser(this.platformId)) {
							localStorage.removeItem("APP_API_KEY");
						}
						// Ask user to re-enter API Key (after reload)
						this.hasApiKey = false;
					} else {
						// TODO: Handle other errors - might be unsafe due to backend endpoint being public
						this.errorMessage = "Error connecting to the server.";
					}

					this.safeMarkForCheck();

					return of(null);
				}),
				finalize(() => {
					this.isSubmitting = false;
					this.safeMarkForCheck();
				}),
			)
			.subscribe({
				next: (response) => {
					this.generatedLink = `${window.location.origin}/note/${response?.id}`;
					this.safeMarkForCheck();
				},
			});
	}

	async copyLink(): Promise<void> {
		if (this.generatedLink) {
			try {
				await navigator.clipboard.writeText(this.generatedLink);
				alert("Link copied!");
			} catch (err) {
				this.errorMessage =
					err instanceof Error
						? `Failed to copy: ${err.message}`
						: "Failed to copy link to clipboard";
				this.safeMarkForCheck();
			}
		}
	}

	resetForm(): void {
		this.generatedLink = null;
		this.noteForm.reset({ ttl_minutes: 15 });
		this.safeMarkForCheck();
	}

	private safeMarkForCheck(): void {
		try {
			this.cdr.markForCheck();
		} catch (e) {
			// Component already destroyed, ignore
		}
	}
}
