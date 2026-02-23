import { Component, type OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../services/api";
import * as CryptoJS from "crypto-js";

@Component({
	selector: "app-view-note",
	standalone: true,
	imports: [CommonModule],
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
	private route = inject(ActivatedRoute);
	private apiService = inject(ApiService);

	noteId: string | null = null;
	encryptedContent: string | null = null;
	decryptedContent: string | null = null;

	isLoading = false;
	errorMessage: string | null = null;

	ngOnInit() {
		this.noteId = this.route.snapshot.paramMap.get("id");
		if (this.noteId) {
			this.fetchNote();
		}
	}

	fetchNote() {
		if (!this.noteId) {
			return;
		}
		this.isLoading = true;
		this.apiService.getNote(this.noteId).subscribe({
			next: (response) => {
				this.encryptedContent = response.content ?? null;
				this.isLoading = false;
			},
			error: (err) => {
				this.errorMessage =
					"Note does not exist, has expired, or you have been blocked by the server (missing API key).";
				this.isLoading = false;
			},
		});
	}

	decryptNote(password: string) {
		if (!password || !this.encryptedContent) return;

		try {
			const bytes = CryptoJS.AES.decrypt(this.encryptedContent, password);
			const originalText = bytes.toString(CryptoJS.enc.Utf8);

			if (!originalText) {
				this.errorMessage = "Wrong password! Failed to decrypt the note.";
			} else {
				this.decryptedContent = originalText;
				this.errorMessage = null;
			}
		} catch (e) {
			this.errorMessage =
				"An error occurred during decryption. The password is incorrect or the file is corrupted.";
		}
	}
}
