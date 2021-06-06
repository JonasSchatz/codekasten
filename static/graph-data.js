var graphData = {
    data: undefined,
    prunedData: undefined,
    minClusterSize: undefined,
    maxClusterSize: undefined,
    neighborDistance: undefined, 
    selectedNodeId: undefined,

    setOriginalData: function(newData) {     
        this.data = newData;
        this.fixLinkReferences();
        this.updateClusterInformation();
        this.updateDistance();
        this.pruneData();
    }, 

    fixLinkReferences: function() {
        if (!this.data.links[0].source.id) {
            this.data.links.map(link => {
                sourceId = link.source;
                link.source = getNodeById(this.data, sourceId);
                targetId = link.target;
                link.target = getNodeById(this.data, targetId);
            })
        };
    },

    setSelectedNodeId: function(selectedNodeId) {
        this.selectedNodeId = selectedNodeId;
        this.updateDistance();
        this.pruneData();
    },

    setNeighborDistance: function(newDistance) {
        this.data = resetNodeProperties(this.data, ['isFringe']);
        this.neighborDistance = newDistance;
        this.pruneData();
    },

    updateDistance: function() {
        if (this.selectedNodeId) {
            this.data = bfsDistance(this.data, this.selectedNodeId);
        } else {
            this.data.nodes = this.data.nodes.map(node => {
                node.distance = 0;
                return node;
            })
        }
    }, 

    setClusterSizes: function(minClusterSize, maxClusterSize) {
        this.minClusterSize = minClusterSize;
        this.maxClusterSize = maxClusterSize;
        this.pruneData();
    },

    updateClusterInformation: function() {
        this.data = bfsCluster(this.data);
    },

    pruneData: function() {        
        let prunedNodes = this.data.nodes;

        if (this.minClusterSize) {
            prunedNodes = prunedNodes.filter(
                node => (
                    node.clusterSize >= this.minClusterSize
                )
            )
        }

        if (this.maxClusterSize) {
            prunedNodes = prunedNodes.filter(
                node => (
                    node.clusterSize <= this.maxClusterSize
                )
            )
        }

        if (this.neighborDistance) {
            prunedNodes = prunedNodes.filter(
                node => (
                    node.distance <= this.neighborDistance
                )
            ).map(
                node => {
                    node.isFringe = (node.distance === this.neighborDistance);
                    return node;
                }
            )
        };
        
        let prunedNodeIds = prunedNodes.map(node => {
            return node.id;
        });
        let prunedLinks = this.data.links.filter(
            link => (
                prunedNodeIds.includes(link.target.id) && prunedNodeIds.includes(link.source.id)
            )
        );

        this.prunedData = {'nodes': prunedNodes, 'links': prunedLinks};
    },    
};


function replaceIDsWithReferences(graphData) {
    if (graphData.links[0].source.id) {
        return 
    }
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
    return graphData;
}
