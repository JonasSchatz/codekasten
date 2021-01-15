import { Edge, Graph } from 'graphlib';
import * as md5 from 'md5';
import { Uri } from 'vscode';

import { Event, Emitter } from './common/event';
import { Note, GraphNote } from './Note';
import { Parser } from './Parser';

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
        
        // If it exists, remove the node and all outgoing edges. 
        // They will be re-added after parsing the new content
        if(nodeAlreadyExists){
            const outEdges: void | Edge[] = this.graph.outEdges(id);
            if(outEdges){
                for(const outEdge of outEdges){
                    this.graph.removeEdge(outEdge);
                    if(this.graph.node(outEdge.w).isStub){
                        this.graph.removeNode(outEdge.w);
                    }
                }
            }
        }

        // Add the node and all outgoing edges
        this.graph.setNode(id, new GraphNote(note));
        for (const forwardLink of note.links) {
            if (!this.graph.hasNode(md5(forwardLink))) {
                const stub: GraphNote = {
                    title: '',
                    path: forwardLink, 
                    tags: [],
                    images: [],
                    isStub: true 
                };
                this.graph.setNode(md5(forwardLink), stub);
            }
            this.graph.setEdge(id, md5(forwardLink));
        }

        if (nodeAlreadyExists) {
            this.onDidUpdateNoteEmitter.fire(id);
        } else {
            this.onDidAddNoteEmitter.fire(id);
        }
    }

    getNote(id: string): Note {
        const graphNote: GraphNote = this.graph.node(id);
        const note: Note = {
            path: graphNote.path,
            title: graphNote.title,
            links: this.getForwardLinksAsString(id),
            backlinks: this.getBacklinksAsString(id),
            images: graphNote.images,
            tags: graphNote.tags,
            isStub: graphNote.isStub
        };
        return note;
    }

    /**
     * Return all notes with the specified tag
     */
    getNotesWithTag(tag: string, ignoreCase: boolean): Note[] {
        const notes: Note[] = [];
        for (const id of this.graph.nodes()){
            var tags: string[] = this.graph.node(id).tags;
            
            if (ignoreCase) {
                tags = tags.map(tag => tag.toLocaleLowerCase());
                tag = tag.toLowerCase();
            }
            if (tags.includes(tag)) {
                notes.push(this.getNote(id));
            }
        }
        return notes;
    }



    deleteNote(id: string) {
        this.graph.removeNode(id);
        this.onDidDeleteEmitter.fire(id);
    }

    async populateGraph(filePaths: string[], parser: Parser) {
        
        for (const filePath of filePaths) {
            var note: Note = await parser.parse(filePath);
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

    getBacklinksAsString(targetId: string): string[] {
        return this.getBacklinksAsNote(targetId).map(note => note.path);
    }

    getBacklinksAsNote(targetId: string): Note[] {
        const edges: void | Edge[] = this.graph.inEdges(targetId);

        if(!edges){
            return [];
        } else {
            return edges.map((edge) => this.graph.node(edge.v));
        }  
    }


    getForwardLinksAsString(sourceId: string): string[] {
        const edges: void | Edge[] = this.graph.outEdges(sourceId);

        if(!edges){
            return [];
        } else {
            const forwardLinks: string[] = edges.map((edge) => this.graph.node(edge.w).path);
            return forwardLinks;
        } 
    }

    updateId(oldId: string, newId: string) {
        const oldNode: GraphNote = this.graph.node(oldId);
        const inEdges: void | Edge[] = this.graph.inEdges(oldId);
        const outEdges: void | Edge[] = this.graph.outEdges(oldId);

        this.graph.setNode(newId, oldNode);
        
        if(inEdges){
            for(const inEdge of inEdges){
                this.graph.setEdge(inEdge.v, newId);
            }
        }

        if(outEdges){
            for(const outEdge of outEdges){
                this.graph.setEdge(newId, outEdge.w);
            }
        }

        this.graph.removeNode(oldId);
    }
}