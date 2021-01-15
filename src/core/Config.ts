export interface Config {
    folders: {
        imagesFolder: string, 
        notesFolder: string, 
        recycleFolder: string, 
        templatesFolder: string
    }, 
    tags: {
        failedConsistencyCheckTag: string,
        missingImageTag: string,
    }
}