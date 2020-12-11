import * as vscode from 'vscode';
import { Feature } from "./feature";
import { NoteGraph } from "../core";
import { openNoteInWorkspace } from "../vscode/NoteActions";
import * as md5 from 'md5';
import { Note } from '../core/Note';

const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        const backlinkTreedataProvider: BacklinkTreedataProvider = new BacklinkTreedataProvider(graph);
        vscode.window.registerTreeDataProvider('backlinks', backlinkTreedataProvider);

        vscode.window.onDidChangeActiveTextEditor((editor) => {
            backlinkTreedataProvider.refresh();
        });

        vscode.commands.registerCommand('backlinks.selectNode', (treeItem: TreeItem) => {
            openNoteInWorkspace(treeItem.resourceUri.fsPath, vscode.ViewColumn.One);
        });
    }
};


class BacklinkTreedataProvider implements vscode.TreeDataProvider<TreeItem> {

    graph: NoteGraph;

    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    constructor(treeviewInputGraph: NoteGraph) {
        this.graph = treeviewInputGraph;    
    }

    getChildren(element?: TreeItem): TreeItem[] {
        const treeItems: TreeItem[] = [];

        const currentlyOpen = vscode.window.activeTextEditor?.document?.uri.fsPath;
        if(!currentlyOpen) {return treeItems;};

        const notes: Note[]  = this.graph.getBacklinksAsNote(md5(currentlyOpen));
        for(const note of notes){
            const treeItem: TreeItem = {
                label: note.title, 
                children: undefined, 
                resourceUri: vscode.Uri.file(note.path)
            };
            treeItem.command = {
                command: "backlinks.selectNode", 
                title: "Select Node", 
                arguments: [treeItem]
            };
            treeItems.push(treeItem);
        }
        return treeItems;
      }
  
    getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
      return element;
    }
}

class TreeItem extends vscode.TreeItem {
    children: TreeItem[]|undefined;

    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
                                    vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }
}

export default feature;