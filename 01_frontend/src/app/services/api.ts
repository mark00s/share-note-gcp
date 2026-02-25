import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import type { Observable } from "rxjs";
import { ConfigService } from "../config.service";
export interface NoteCreateRequest {
	content: string;
	ttl_seconds: number;
}

export interface NoteResponse {
	id?: string;
	content?: string;
	expires_at?: string;
}

@Injectable({
	providedIn: "root",
})
export class ApiService {
	private http = inject(HttpClient);
	private configService = inject(ConfigService);

	private get apiUrl(): string {
		return this.configService.backendUrl;
	}

	createNote(data: NoteCreateRequest): Observable<NoteResponse> {
		return this.http.post<NoteResponse>(`${this.apiUrl}/note`, data);
	}

	getNote(id: string): Observable<NoteResponse> {
		return this.http.get<NoteResponse>(`${this.apiUrl}/note/${id}`);
	}
}
