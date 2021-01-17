import { Feature } from "./feature";
import createNote from "./create-note";
import graphviz from "./graphviz";
import searchNote from "./search-note";
import backlinkTreedataView from "./backlink-treedata-view";
import tagTreeTreedataView from "./tags-treedata-views";
import consistencyCheck from "./consitency-check";
import insertSnippets from "./insert-snippets";

export const features: Feature[] = [consistencyCheck, createNote, graphviz, searchNote, backlinkTreedataView, tagTreeTreedataView, insertSnippets];