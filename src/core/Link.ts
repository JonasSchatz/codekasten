import * as path from "path";


export interface Link {
    source: string;
    target: string;
}


export class MarkdownLink implements Link {
    source: string;
    target: string;
    description: string;
    relativePath: string;
    
    constructor(source: string, target: string) {
        this.source = source;
        this.target = target;
        this.relativePath = path.relative(path.dirname(this.source), this.target).replace(/\\/g, '/');
    };

    getStringRepresentation(): string {
        return `[${this.description}](${this.relativePath})`;
    }
}