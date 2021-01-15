import * as path from 'path';

import { MarkdownLink } from "../core/Link";
import { loadFileAsString } from "../vscode/NoteActions";

import { Note } from "./Note";


export interface Parser {
    parse: (filePath: string) => Promise<Note>;
}


export class CodekastenParser implements Parser {
    async parse(filePath: string) {
        var note: Note = new Note();
        var readStr: string = await loadFileAsString(filePath);

        note.path = filePath;
        note.isStub = false;

        const {links, backlinks}: {links: MarkdownLink[], backlinks: MarkdownLink[]} = this.parseLinks(readStr, note.path);
        note.links = links.map(link => link.target);
        note.backlinks = backlinks.map(link => link.source);

        const images: MarkdownLink[] = this.parseImages(readStr, note.path);
        note.images = images.map(link => link.target);
        
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
        const backlinkAreaRe = /(?<=# Backlinks\s)((?:.|\s)+?)(---|$|#)/g; //ToDo: Remove
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

    parseImages(text: string, sourcePath: string): MarkdownLink[] {
        const imageRe = /!\[(?<text>[^\]]*)\]\((?<target>[^\)\n]*)\)/gm;
        const imageMatches = text.matchAll(imageRe);
        var images: Array<MarkdownLink> = [];
        for (const imageMatch of imageMatches) {
            const link: MarkdownLink = new MarkdownLink(sourcePath, path.join(path.dirname(sourcePath), imageMatch.groups.target));
            link.description = imageMatch.groups.text;
            images.push(link);
        }
        return images;
    }
}