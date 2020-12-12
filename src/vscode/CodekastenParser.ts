import * as path from 'path';
import * as vscode from "vscode";

import { MarkdownLink } from "../core/Link";
import { Note } from "../core/Note";
import { Parser } from "../core/Parser";
import { loadFileAsString } from "./NoteActions";


export class CodekastenParser implements Parser {
    async parse(uri: vscode.Uri) {
        var note: Note = new Note();
        var readStr: string = await loadFileAsString(uri);

        note.path = uri.fsPath;
        note.isStub = false;

        const {links, backlinks}: {links: MarkdownLink[], backlinks: MarkdownLink[]} = this.parseLinks(readStr, note.path);
        note.links = links.map(link => link.target);
        note.backlinks = backlinks.map(link => link.source);
        
        note.title = this.parseTitle(readStr);
        note.tags = this.parseTags(readStr);

        return note;
    }

    parseTitle(content: string): string {
        const titleRe = /^# (.*)/;
        const match = content.match(titleRe);

        if (match !== null){
            return match[1];
        } else {
            return "";
        }
    }

    parseTags(content: string): string[] {
        const tagRe = /#[a-zA-Z]+/g;
        const tagMatches = content.matchAll(tagRe);

        const tags: string[] = [];
        for (const tagMatch of tagMatches) {
            tags.push(tagMatch[0]);
        }
        return tags;
    }

    parseLinks(text: string, sourcePath: string): {links: MarkdownLink[], backlinks: MarkdownLink[]} {
        const markdownLinkRe = /(?<!!)\[(?<text>[^\]\n]*)\]\((?!http|www|#)(?<target>[^\)\n]*)\)/gm;
        const backlinkAreaRe = /(?<=# Backlinks\s)((?:.|\s)+?)(---|$|#)/g;
        const backlinkArea = backlinkAreaRe.exec(text);
        if(backlinkArea) {
            var backlinkAreaStartIndex = backlinkArea.index;
            var backlinkAreaEndIndex = (backlinkAreaStartIndex + backlinkArea[0].length);
        } else {
            var backlinkAreaStartIndex = -1;
            var backlinkAreaEndIndex = -1;
        };
        
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