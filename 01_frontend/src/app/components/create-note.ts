import { Component, type OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
	FormBuilder,
	type FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import { ApiService, type NoteCreateRequest } from "../services/api";
import * as CryptoJS from "crypto-js";

@Component({
	selector: "app-create-note",
	standalone: true,
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
              <select formControlName="ttl_seconds"
                      class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option [value]="0">minutes</option>
                <option [value]="24">hours</option>
                <option [value]="0">days</option>
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
	private fb = inject(FormBuilder);
	private apiService = inject(ApiService);

	noteForm!: FormGroup;
	hasApiKey = false;
	isSubmitting = false;
	generatedLink: string | null = null;
	errorMessage: string | null = null;

	ngOnInit() {
		this.hasApiKey = !!localStorage.getItem("APP_API_KEY");
		this.noteForm = this.fb.group({
			content: ["", [Validators.required, Validators.minLength(1)]],
			password: ["", [Validators.required, Validators.minLength(4)]],
			ttl_seconds: [86400, Validators.required],
		});
	}

	saveApiKey(key: string) {
		const trimmedKey = key.trim();
		if (trimmedKey) {
			localStorage.setItem("APP_API_KEY", trimmedKey);
			this.hasApiKey = true;
		}
	}

	onSubmit() {
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
			ttl_seconds: this.noteForm.value.ttl_seconds,
		};

		this.apiService.createNote(payload).subscribe({
			next: (response) => {
				this.generatedLink = `${window.location.origin}/note/${response.id}`;
				this.isSubmitting = false;
			},
			error: (err) => {
				this.isSubmitting = false;

				if (err.status === 401) {
					this.errorMessage = "Bad API Key.";
					localStorage.removeItem("APP_API_KEY");
					this.hasApiKey = false;
				} else {
					this.errorMessage = `Error connecting to the server. ${err}`;
				}
			},
		});
	}

	copyLink() {
		if (this.generatedLink) {
			navigator.clipboard.writeText(this.generatedLink);
			alert("Link copied!");
		}
	}

	resetForm() {
		this.generatedLink = null;
		this.noteForm.reset({ ttl_seconds: 86400 });
	}
}
