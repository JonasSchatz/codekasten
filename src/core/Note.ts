export class Note {
    path: string;
    title: string;
    links: Array<string>;
    backlinks: Array<string>;
    tags: Array<string>;
    isStub: boolean;
}

export class WebviewNote {
    id: string;
    label: string;
    path: string;
    isStub: boolean;
    isCurrentlyActive: boolean;
}