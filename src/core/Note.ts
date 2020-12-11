import { Uri } from "vscode";
import { Link } from "./Link";

export class Note {
    path: string;
    links: Array<string>;
    backlinks: Array<string>;
    title: string;
    isStub: boolean;
}