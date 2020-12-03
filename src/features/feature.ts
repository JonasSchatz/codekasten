import { ExtensionContext } from "vscode";
import { NoteGraph } from "../core";

export interface Feature {
    activate: (context: ExtensionContext, graph: NoteGraph) => void
}