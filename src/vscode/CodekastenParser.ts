import { Parser } from "../core/Parser";
import { Uri, workspace } from "vscode";
import { Note } from "../core/Note";
import { MarkdownLink } from "../core/Link";
import * as path from 'path';


export class CodekastenParser implements Parser {
    async parse(uri: Uri) {
        var note: Note = new Note();

        note.path = uri.fsPath;

        var readData = await workspace.fs.readFile(uri);
        var readStr: string = Buffer.from(readData).toString('utf8');
        
        var links: Array<MarkdownLink> = [];
        const markdownLinkRe = /(?<!!)\[(?<text>[^\]]*)\]\((?<target>[^\)]*)\)/g;
        const linkMatches = readStr.matchAll(markdownLinkRe);
        for (const linkMatch of linkMatches) {
            var target: string = path.join(path.dirname(note.path), linkMatch.groups.target);
            var link: MarkdownLink = new MarkdownLink(note.path, target);
            link.description = linkMatch.groups.text;
            links.push(link);
        }
        note.links = links;
        
        const titleRe = /^# (.*)/;
        const match = readStr.match(titleRe);
        if (match !== null){
            note.title = match[1];
        } else {
            note.title = "";
        }

        return note;
    }
}