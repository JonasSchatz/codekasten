import * as vscode from 'vscode';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';


abstract class BaseLogger {
    constructor(private level: LogLevel = 'info') {}

    private static severity = {
        debug: 1,
        info: 2,
        warn: 3,
        error: 4,
    };

    abstract log(lvl: LogLevel, msg?: any, ...extra: any[]): void;

    doLog(msgLevel: LogLevel, message?: any, ...params: any[]): void {
        if (BaseLogger.severity[msgLevel] >= BaseLogger.severity[this.level]) {
          this.log(msgLevel, message, ...params);
        }
      }

    debug(message?: any, ...params: any[]): void {
        this.doLog('debug', message, ...params);
    }
    info(message?: any, ...params: any[]): void {
        this.doLog('info', message, ...params);
    }
    warn(message?: any, ...params: any[]): void {
        this.doLog('warn', message, ...params);
    }
    error(message?: any, ...params: any[]): void {
        this.doLog('error', message, ...params);
    }

    getLevel(): LogLevel {
        return this.level;
    }
    setLevel(level: LogLevel): void {
        this.level = level;
    }

}

export class ConsoleLogger extends BaseLogger {
    log(level: LogLevel, msg?: string, ...params: any[]): void {
        console[level](`[${level}] ${msg}`, ...params);
    }
  }



export class CodekastenLogger extends BaseLogger {
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


export class Logger {
    static debug(message?: any, ...params: any[]): void {
      Logger.defaultLogger.debug(message, ...params);
    }
    static info(message?: any, ...params: any[]): void {
      Logger.defaultLogger.info(message, ...params);
    }
    static warn(message?: any, ...params: any[]): void {
      Logger.defaultLogger.warn(message, ...params);
    }
    static error(message?: any, ...params: any[]): void {
      Logger.defaultLogger.error(message, ...params);
    }
    static getLevel(): LogLevel {
      return Logger.defaultLogger.getLevel();
    }
    static setLevel(level: LogLevel): void {
      Logger.defaultLogger.setLevel(level);
    }
  
    private static defaultLogger: BaseLogger = new CodekastenLogger();
  
    static setDefaultLogger(logger: BaseLogger) {
      Logger.defaultLogger = logger;
    }
  }
  