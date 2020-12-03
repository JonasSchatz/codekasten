import * as path from "path";


export interface Link {
    source: string;
    target: string;
}


export class MarkdownLink implements Link {
    source: string;
    target: string;
    description: string;
    
    constructor(source: string, target: string) {
        this.source = source;
        this.target = target; 
    }

    createStringRepresentation(): string {
        const relativePath: string = path.relative(path.dirname(this.source), this.target);
        return `[${this.description}](${relativePath})`;
    }
}