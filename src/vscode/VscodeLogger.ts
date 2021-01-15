import * as vscode from 'vscode';

import { BaseLogger, LogLevel } from "../core/Logger";


export class VscodeLogger extends BaseLogger {
    private channel = vscode.window.createOutputChannel("CodekastenLog");

    log(lvl: LogLevel, msg?: any, ...extra: any[]): void {
        if (msg) {
            this.channel.appendLine(`[${lvl} - ${new Date().toLocaleTimeString()}] ${msg}`);
        }
    }

    show() {
        this.channel.show();
    }
}