import { workspace } from "vscode";

export interface Config {
    rootFolder: string;
    notesFolder: string;
}

export const createConfigFromVsCode = () => {
    const workspaceFolders = workspace.workspaceFolders?.map(
        dir => dir.uri.fsPath
      );
      const config: Config = {
          rootFolder: 'test',
          notesFolder: './notes'
      };
      return config;
};