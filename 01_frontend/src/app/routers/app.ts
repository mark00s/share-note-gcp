import type { Routes } from "@angular/router";
import { CreateNoteComponent } from "../components/create-note";
import { ViewNoteComponent } from "../components/view-note";

export const routes: Routes = [
	{ path: "", component: CreateNoteComponent },
	{ path: "note/:id", component: ViewNoteComponent },
	{ path: "**", redirectTo: "" },
];
