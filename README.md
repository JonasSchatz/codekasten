# Codekasten: Advanced Zettelkasten for VS Code

Codekasten provides tools and shortcuts to manage a _Zettelkasten_ in VS Code. 
If you don't know what a Zettelkasten is, there are many resources on the web, but maybe start [here](http://evantravers.com/articles/2020/03/13/simple-markdown-zettelkasten/). 

> ⚠️ Warning: This extension is made to suite my personal workflow.      
> ⚠️ Use at your own risk and always make sure to backup your notes. 

## Recommended Extensions
To harness the full power of markdown documents in VS Code, [Markdown Preview Enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) is recommended. 
For visualizing the relationships between nodes, [Markdown Links](https://marketplace.visualstudio.com/items?itemName=tchayen.markdown-links) is also recommended. It uses D3's Force Graph under the hood, so it is likely to not be a scaleable solution. Codekasten has its own graph visualization view, heavily based on Markdown Links. In future versions I plan to move this implementation to use [force-graph](https://github.com/vasturiano/force-graph) instead. However, this needs to wait until either [this issue](https://github.com/foambubble/foam/issues/378) or [this issue](https://github.com/microsoft/vscode/issues/112396) get solved. 

## Features
Currently supported:
- Create a new Note, based on a user-provided template, and the currently selected text
- Search for notes and insert them as links
- See the notes that link to the currently open node in the left sidebar
- See the notes that share tags with the currently open node, also in the left sidebar
- Graph visualization using D3 (for issues see above)


## Setup and Extension Settings
There are no changeable settings in VS Code. 
When creating a new note, the extension expects a folder `.codekasten/templates`, containing templates as `.md` files. 

## Roadmap
Short-term:
- Solve the bug with the graph-visualization
- Support Daily Notes

Mid-term:
- Make the extension more customizable, e.g. let the user provide glob-patterns for which files should be included in the graph visualization. 

Long-term:
- Implement or find a more robust Markdown Parser. Do own syntax highlighting (e.g. detected links), which might be cool and also help with debugging.

## Release Notes

### 0.0.2
Current working version. 
I have not made a release yet, because last time it broke my debugging pipeline. 
Also I have no idea what changed between this and 0.0.1. I'm bad at this.

### 0.0.1
Initial release. 
