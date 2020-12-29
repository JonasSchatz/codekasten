import { Feature } from "./feature";
import createNote from "./create-note";
import graphviz from "./graphviz";
import searchNote from "./search-note";
import backlinkTreedataView from "./backlinkTreedataView";
import tagTreeTreedataView from "./tagsTreedataView";
import consistencyCheck from "./consitencycheck";

export const features: Feature[] = [consistencyCheck, createNote, graphviz, searchNote, backlinkTreedataView, tagTreeTreedataView];