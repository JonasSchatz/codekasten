# Codekasten: Advanced Zettelkasten for VS Code

Codekasten provides tools and shortcuts to manage a _Zettelkasten_ in VS Code. 
If you don't know what a Zettelkasten is, there are many resources on the web, but maybe start [here](http://evantravers.com/articles/2020/03/13/simple-markdown-zettelkasten/). 

> ⚠️ Warning: This extension is made to suite my personal workflow.      
> ⚠️ Use at your own risk and always make sure to backup your notes. 

## Recommended Extensions
To harness the full power of markdown documents in VS Code, [Markdown Preview Enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) is recommended. 
For easy insertion of images, use [Paste Image](https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image). Note that this is not maintained anymore, but forks do exists. 

## Features
Currently supported:
- Easily create new Notes:
    - Based on user-supplied templates
    - Selected text can be used to pre-fill these templates
    - Automatically create daily notes
- Search for notes and insert them as links
- See the notes that link to the currently open node in the left sidebar
- See the notes that share tags with the currently open node, also in the left sidebar
- Graph visualization


## Setup and Extension Settings
There are no changeable settings in VS Code. 
When creating a new note, the extension expects a folder `.codekasten/templates`, containing templates as `.md` files. 

## Roadmap

Short-term:
- Clean up duplicate/messy code, write more docstrings and tests
- Cleanup Scripts: Find Stubs and unlinked images. Maybe find unlinked notes and make it a challenge to connect them to the bulk of knowledge. 
- Add more information to the Graphviz

Mid-term:
- Make the extension more customizable, e.g. let the user provide glob-patterns for which files should be included in the graph visualization. 
- Include a Template with the neccessary folder structure and some smart initial values for the settings into the Repo.
- Handle images: Right-click to change to HTML image tags with size.

Long-term:
- Implement or find a more robust Markdown Parser. Do own syntax highlighting (e.g. detected links), which might be cool and also help with debugging.

## Release Notes

## 0.1.0
Date: 2020-12-18
New Features:
- Create new notes
- Search for notes and insert them as links
- See backlinks and notes with shared tags in the left sidebar
- Graph visualization