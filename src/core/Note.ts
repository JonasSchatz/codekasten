export class Note {
    path: string;
    title: string;
    links: Array<string>;
    backlinks: Array<string>;
    images: Array<string>;
    tags: Array<string>;
    isStub: boolean;
}

export class WebviewNote {
    id: string;
    label: string;
    path: string;
    isStub: boolean;
}

export class GraphNote {
    path: string;
    title: string;
    tags: string[];
    images: string[];
    isStub: boolean;

    constructor(note: Note) {
        this.path = note.path;
        this.title = note.title;
        this.tags = note.tags;
        this.images = note.images;
        this.isStub = note.isStub;
    }
}
