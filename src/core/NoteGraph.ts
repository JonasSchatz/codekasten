import { Graph } from 'graphlib';
import { Uri } from 'vscode';
import { Note } from './Note';
import { Parser } from './Parser';

import * as vscode from 'vscode'; //Todo: Remove
import { MarkdownLink } from './Link';

export class NoteGraph {
    graph: Graph;

    constructor() {
        this.graph = new Graph();
    }

    addNote(note: Note) {
        const id: string = note.path;
        this.graph.setNode(id, note);
    }

    async populateGraph(urisPromise: Thenable<Array<Uri>>, parser: Parser) {
        const uris = await urisPromise;
        
        for (const uri of uris) {
            var note: Note = await parser.parse(uri);
            this.addNote(note);

            for (const link of note.links) {
                //if (!this.graph.hasNode(link.target)) {
                //    this.graph.setNode(link.target);
                //}
            }
        }

    }

    searchInTitle(searchTerm: string): Note[] {
        var positiveNotes: Note[] = [];
        for (const id of this.graph.nodes()) {
            const note: Note = this.graph.node(id);
            if (note.title.includes(searchTerm)) {
                positiveNotes.push(note);
            }
        }
        return positiveNotes;
    }
}