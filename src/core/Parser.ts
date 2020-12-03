import { Uri } from "vscode";
import { Note } from "./Note";

export interface Parser {
    parse: (uri: Uri) => Promise<Note>;
}

