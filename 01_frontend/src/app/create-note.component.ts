import {
	Component,
	type OnInit,
	inject,
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	DestroyRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	FormBuilder,
	type FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { ApiService, type NoteCreateRequest } from "./api.service";
import { AuthService } from "./auth.service";
import { ApiKeyInputComponent } from "./api-key-input.component";
import * as CryptoJS from "crypto-js";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { of } from "rxjs";
import { catchError, finalize, retry, timeout } from "rxjs/operators";
import { HTTP_CONFIG, VALIDATION } from "./constants";

@Component({
	selector: "app-create-note",
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, ReactiveFormsModule, ApiKeyInputComponent],
	template: `
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-xl w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">

      @if (!authService.hasApiKey()) {
        <app-api-key-input />
      }

      @if (authService.hasApiKey() && !generatedLink) {
        <div>
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
            @if (errorMessage) {
              <div class="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
                {{ errorMessage }}
              </div>
            }
            <button type="submit" [disabled]="noteForm.invalid || isSubmitting"
                    class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4">
              {{ isSubmitting ? 'Encrypting and sending...' : 'Encrypt E2E and generate link' }}
            </button>
          </form>
        </div>
      }

      @if (generatedLink) {
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2 text-green-400">Note Ready!</h2>
          <p class="text-gray-400 mb-6">Share the following URL with recipient. Remember to provide password using different channel than the URL</p>
          <div class="flex items-center space-x-2 bg-gray-900 p-2 rounded-lg border border-gray-600 mb-6">
            <input type="text" readonly [value]="generatedLink" class="flex-1 bg-transparent text-gray-300 outline-none px-2 text-sm">
            <button (click)="copyLink()" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-sm">Copy</button>
          </div>
          <button (click)="resetForm()" class="text-blue-400 hover:text-blue-300 font-bold">Create another one</button>
        </div>
      }
    </div>
  </div>
  `,
})
export class CreateNoteComponent implements OnInit {
	private apiService = inject(ApiService);
	protected authService = inject(AuthService);
	private cdr = inject(ChangeDetectorRef);
	private destroyRef = inject(DestroyRef);
	private fb = inject(FormBuilder);

	noteForm!: FormGroup;
	isSubmitting = false;
	generatedLink: string | null = null;
	errorMessage: string | null = null;

	ngOnInit(): void {
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
						// API key is automatically cleared by authErrorInterceptor
						this.errorMessage = "Bad API Key. Please re-enter your API key.";
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
					if (response?.id) {
						this.generatedLink = `${window.location.origin}/note/${response.id}`;
					} else {
						this.errorMessage = "Error connecting to the server.";
					}
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
