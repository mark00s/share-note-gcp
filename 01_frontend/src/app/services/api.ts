import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import type { Observable } from "rxjs";
import { environment } from "../../environments/environment";

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
	private apiUrl = environment.backendUrl;

	createNote(data: NoteCreateRequest): Observable<NoteResponse> {
		return this.http.post<NoteResponse>(`${this.apiUrl}/notes/`, data);
	}

	getNote(id: string): Observable<NoteResponse> {
		return this.http.get<NoteResponse>(`${this.apiUrl}/notes/${id}`);
	}
}
