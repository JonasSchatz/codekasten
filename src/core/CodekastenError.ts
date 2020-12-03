export class CodekastenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CodekastenError";
    }
}