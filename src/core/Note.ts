import { Uri } from "vscode";
import { Link } from "./Link";

export class Note {
    path: string;
    links: Array<Link>;
    backlinks: Array<Link>;
    title: string;
    isStub: boolean;
}