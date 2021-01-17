import * as md5 from 'md5';
import * as vscode from 'vscode';

import { NoteGraph } from "../core";
import { Note } from '../core/note';
import { openNoteInWorkspace } from "../vscode/note-actions";

import { Feature } from "./feature";


const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        const tagTreedataProvider: TagTreedataProvider = new TagTreedataProvider(graph);
        vscode.window.registerTreeDataProvider('tagTree', tagTreedataProvider);

        vscode.window.onDidChangeActiveTextEditor((editor) => {
            tagTreedataProvider.refresh();
        });

        vscode.commands.registerCommand('tagTree.selectNode', (treeItem: TreeItem) => {
            openNoteInWorkspace(treeItem.resourceUri.fsPath, vscode.ViewColumn.One);
        });
    }
};


class TagTreedataProvider implements vscode.TreeDataProvider<TreeItem> {

    graph: NoteGraph;

    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    constructor(tagViewInputGraph: NoteGraph) {
        this.graph = tagViewInputGraph;    
    }

    getChildren(element?: TreeItem): TreeItem[] {
        const treeItems: TreeItem[] = [];

        const currentlyOpenNotePath: string = vscode.window.activeTextEditor?.document?.uri.fsPath;
        if(!currentlyOpenNotePath) {
            return treeItems;
        };
        const currentlyOpenNote: Note = this.graph.getNote(md5(currentlyOpenNotePath));
        
        if (!element) { // Top level: Tags of the currently open node
            for (const tag of currentlyOpenNote.tags) {
                const treeItem: TreeItem = {
                    label: tag, 
                    children: undefined, 
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
                };
                treeItems.push(treeItem);
            }
            return treeItems;
        } else { // Second level: Notes with the respective tags
            const notesWithTag: Note[] = this.graph.getNotesWithTag(element.label, true);
            for (const noteWithTag of notesWithTag) {
                if (noteWithTag.path !== currentlyOpenNotePath) {
                    const treeItem: TreeItem = {
                        label: noteWithTag.title, 
                        children: undefined, 
                        resourceUri: vscode.Uri.file(noteWithTag.path)
                    };
                    treeItem.command = {
                        command: "tagTree.selectNode", 
                        title: "Select Node", 
                        arguments: [treeItem]
                    };
                    treeItems.push(treeItem);
                }
            };
            return treeItems;
        }
    };

    
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