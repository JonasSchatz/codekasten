var graphData = {
    originalData: undefined,
    get enrichedData() {
        console.log("Enriching data:");
        if(!this.originalData) {
            return undefined;
        };
        
        enrichedData = bfsCluster(this.originalData);
        if (this.selectedNodeId) {
            enrichedData = bfsDistance(enrichedData, this.selectedNodeId);
        }
        return enrichedData;

    } ,
    prunedData: undefined,
    minClusterSize: 0,
    maxClusterSize: 100,
    neighborDistance: 4, 
    selectedNodeId: undefined
};

function enrichData() {
    
}

function updateGraphData(graphData, newGraphData) {
    const oldNodeIds = new Set(graphData.nodes.map(node => node.id));
    const newNodeIds = new Set(newGraphData.nodes.map(node => node.id));
  
    let nodesToDelete = new Set([...oldNodeIds].filter(x => !newNodeIds.has(x)));
    let nodesToAdd = new Set([...newNodeIds].filter(x => !oldNodeIds.has(x)));
    let nodesToUpdate = new Set([...oldNodeIds].filter(x => newNodeIds.has(x))); 
    
    for (const id of nodesToDelete) {
      const index = graphData.nodes.map(node => node.id).indexOf(id);
      graphData.nodes.splice(index, 1);
      console.log(`Deleted node ${id} from position ${index}`);
    }
  
    for (const id of nodesToAdd) {
      console.log(`Add node ${id}`);
      const index = newGraphData.nodes.map(node => node.id).indexOf(id);
      graphData.nodes.push(newGraphData.nodes[index]);
    }
  
    for (const id of nodesToUpdate) {
      console.log(`Update node ${id}`);
    }
    graphData.links = newGraphData.links;
    return graphData;
  }

function getNodeById(graphData, id) {
    return graphData.nodes.find(node => {
        return node.id === id;
    });
}

function getChildren(graphData, parent) {
    var links = graphData.links.filter(link => {
        return (link.source.id === parent.id || link.target.id === parent.id);
    });

    var childIDs = links.map(link => {
        if (link.source.id === parent.id) {
            return link.target.id;
        } else {
            return link.source.id;
        }
    });

    var children = graphData.nodes.filter(node => {
        return childIDs.includes(node.id);
    });

    return children;
}


function resetNodeProperties(graphData, properties) {
    for (const property of properties) {
        for (const node of graphData.nodes) {
            node[property] = undefined;
        }
    }
    return graphData;
}





function bfsCluster(graphData) {
    graphData = resetNodeProperties(graphData, ['seen', 'clusterID', 'clusterSize']);
    let clusterID = 0;

    for (const root of graphData.nodes) {
        if (!root.seen) {
            graphData = bfsClusterUtil(graphData, root, clusterID);
            clusterID++;
        }
    }

    graphData = resetNodeProperties(graphData, ['seen']);
    return graphData;
}

function bfsClusterUtil(graphData, root, clusterID) {
    var queue = [];
    var clusterSize = 0;

    queue.push(root);
    root.clusterID = clusterID;
    root.seen = true;

    while(queue.length !== 0) {
        var node = queue.shift();
        var children = getChildren(graphData, node);
        clusterSize++;

        for (const child of children) {
            if (!child.seen) {
                child.clusterID = clusterID;
                child.seen = true;
                queue.push(child);
            }
        }
    }

    graphData.nodes = graphData.nodes.map(node => {
        if (node.clusterID === clusterID) {
            node.clusterSize = clusterSize;
        }
        return node;
    });

    return graphData;
}



function bfsDistance(graphData, rootId) {
    
    graphData = resetNodeProperties(graphData, ['distance', 'seen']);

    var queue = [];
    root = graphData.nodes.filter(node => node.id === rootId)[0];
    queue.push(root);
    root.distance = 0;
    root.seen = true;


    var distance = 1;

    while(queue.length !== 0) {
        var levelSize = queue.length;

        while (levelSize--) {
        var node = queue.shift();
        var children = getChildren(graphData, node);
        console.log(distance);
        for (const child of children) {
            if (!child.seen) {
            child.distance = distance;
            child.seen = true;
            queue.push(child);
            }
        }
        }

        distance++;
        

    }

    console.log("Done");
    return graphData;
}

