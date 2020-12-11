import { Edge, Graph } from 'graphlib';
import { Uri } from 'vscode';
import { Note } from './Note';
import { Parser } from './Parser';
import * as md5 from 'md5';

import * as vscode from 'vscode'; //Todo: Remove
import { Link, MarkdownLink } from './Link';
import { Event, Emitter } from './common/event';

export class NoteGraph {
    

    onDidAddNote: Event<string>;
    onDidUpdateNote: Event<string>;
    onDidDeleteNote: Event<string>;

    graph: Graph;
    private onDidAddNoteEmitter = new Emitter<string>();
    private onDidUpdateNoteEmitter = new Emitter<string>();
    private onDidDeleteEmitter = new Emitter<string>();

    constructor() {
        this.graph = new Graph();
        this.onDidAddNote = this.onDidAddNoteEmitter.event;
        this.onDidUpdateNote = this.onDidUpdateNoteEmitter.event;
        this.onDidDeleteNote = this.onDidDeleteEmitter.event;
    }

    /**
     * Add a note and all outgoing links (forwardLink) to the graph
     * If the target of the forwardLink is not yet in the graph, add a stub
     */
    setNote(note: Note) {
        const id: string = md5(note.path);
        var nodeAlreadyExists: boolean = this.graph.hasNode(id);

        this.graph.setNode(id, note);

        for (const forwardLink of note.links) {
            if (!this.graph.hasNode(md5(forwardLink.target))) {
                const stub: Note = {
                    path: forwardLink.target, 
                    links: [], 
                    isStub: true, 
                    backlinks: [], 
                    title: ''
                };
                this.graph.setNode(md5(forwardLink.target), stub);
            }
            this.graph.setEdge(md5(forwardLink.source), md5(forwardLink.target));
        }

        if (nodeAlreadyExists) {
            this.onDidUpdateNoteEmitter.fire(id);
        } else {
            this.onDidAddNoteEmitter.fire(id);
        }
    }

    deleteNote(id: string) {
        this.graph.removeNode(id);
        this.onDidDeleteEmitter.fire(id);
    }

    async populateGraph(urisPromise: Thenable<Array<Uri>>, parser: Parser) {
        const uris = await urisPromise;
        
        for (const uri of uris) {
            var note: Note = await parser.parse(uri);
            this.setNote(note);
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

    getBacklinks(targetId: string): Note[] {
        const edges: void | Edge[] = this.graph.inEdges(targetId);

        if(!edges){
            return [];
        } else {
            return edges.map((edge) => this.graph.node(edge.v));
        } 
    }
}