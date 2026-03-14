import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

/**
 * Reusable component for API key input.
 * Displays when the user needs to provide an API key to access the application.
 */
@Component({
  selector: 'app-api-key-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-4 text-white">Server authorization required</h2>
      <p class="text-gray-400 mb-6">Enter application API Key.</p>
      <input
        #apiKeyInput
        type="password"
        placeholder="Enter API password..."
        class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        (keyup.enter)="onSaveApiKey(apiKeyInput.value)"
      />
      @if (errorMessage) {
        <div class="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
          {{ errorMessage }}
        </div>
      }
      <button
        (click)="onSaveApiKey(apiKeyInput.value)"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
      >
        Save and unlock
      </button>
    </div>
  `,
})
export class ApiKeyInputComponent {
  private authService = inject(AuthService);

  errorMessage: string | null = null;

  onSaveApiKey(key: string): void {
    this.errorMessage = null;

    if (!key || !key.trim()) {
      this.errorMessage = 'API key cannot be empty.';
      return;
    }

    const success = this.authService.setKey(key);

    if (!success) {
      this.errorMessage = 'Failed to save API key. Please try again.';
    }
  }
}
