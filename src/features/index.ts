import { Feature } from "./feature";
import createNote from "./create-note";
import graphviz from "./graphviz";
import searchNote from "./search-note";
import backlinkTreedataView from "./backlinkTreedataView";
import tagTreeTreedataView from "./tagsTreedataView";

export const features: Feature[] = [createNote, graphviz, searchNote, backlinkTreedataView, tagTreeTreedataView];