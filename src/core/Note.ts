import { Uri } from "vscode";

export class Note {
    path: string;
    links: Array<any>;
    backlinks: Array<any>;
    title: string;
}