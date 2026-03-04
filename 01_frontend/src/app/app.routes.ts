import type { Routes } from "@angular/router";
import { CreateNoteComponent } from "./create-note.component";
import { ViewNoteComponent } from "./components/view-note";

export const routes: Routes = [
	{ path: "", redirectTo: "note", pathMatch: "full" },
	{ path: "note", component: CreateNoteComponent },
	{ path: "note/:id", component: ViewNoteComponent },
	{ path: "**", redirectTo: "note" },
];
