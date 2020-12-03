import { Feature } from "./feature";
import createNote from "./create-note";
import graphviz from "./graphviz";
import searchNote from "./search-note";

export const features: Feature[] = [createNote, graphviz, searchNote];