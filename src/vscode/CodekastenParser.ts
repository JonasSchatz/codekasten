import { Parser } from "../core/Parser";
import { Uri, workspace } from "vscode";
import { Note } from "../core/Note";
import { MarkdownLink } from "../core/Link";
import * as path from 'path';
import { loadFileAsString } from "./NoteActions";


export class CodekastenParser implements Parser {
    async parse(uri: Uri) {
        var note: Note = new Note();

        note.path = uri.fsPath;

        var readStr: string = await loadFileAsString(uri);
        
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

    parseLinks(text: string, sourcePath: string): {links: MarkdownLink[], backlinks: MarkdownLink[]} {
        const markdownLinkRe = /(?<!!)\[(?<text>[^\]\n]*)\]\((?!http|www)(?<target>[^\)\n]*)\)/gm;
        const backlinkAreaRe = /(?<=# Backlinks\s)((?:.|\s)+?)(---|$|#)/g;
        const backlinkArea = backlinkAreaRe.exec(text);
        const backlinkAreaStartIndex = backlinkArea.index;
        const backlinkAreaEndIndex = backlinkAreaStartIndex + backlinkArea[0].length;
        const linkMatches = text.matchAll(markdownLinkRe);

        var links: Array<MarkdownLink> = [];
        var backlinks: Array<MarkdownLink> = [];

        for (const linkMatch of linkMatches) {
            var link: MarkdownLink = new MarkdownLink(sourcePath, path.join(path.dirname(sourcePath), linkMatch.groups.target));
            link.description = linkMatch.groups.text;

            if(linkMatch.index >= backlinkAreaStartIndex && linkMatch.index <= backlinkAreaEndIndex) {
                backlinks.push(link);
            } else {
                links.push(link);
            }
        }

        return {links: links, backlinks: backlinks};
    }
}