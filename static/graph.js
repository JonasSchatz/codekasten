const CONTAINER_ID = "graph";

function getStyle(name, fallback) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name) ||
    fallback
  );
}

const style = {
  background: getStyle(`--vscode-panel-background`, "#202020"),
  fontSize: parseInt(getStyle(`--vscode-font-size`, 12)) - 2,
  highlightedForeground: getStyle("--vscode-list-highlightForeground", "#f9c74f"),
  node: {
    note: getStyle("--vscode-editor-foreground", "#277da1"),
    nonExistingNote: getStyle("--vscode-list-deemphasizedForeground", "#545454"),
    unknown: getStyle("--vscode-editor-foreground", "#f94144"), 
    selectedNote: getStyle("--vscode-statusBarItem-remoteBackground", "#16825D"), 
    size: 1
  }
};


const graph = ForceGraph();
let selectedNode = undefined;




function initDataviz(channel){
  const elem = document.getElementById(CONTAINER_ID);
  graph(elem)
    .graphData(graphData)
    .d3Force("x", d3.forceX())
    .d3Force("y", d3.forceY())
    .nodeId('id').nodeCanvasObject((node, ctx, globalScale) => {
      const label = node.label;
      
      Draw(ctx)
        .circle(node.x, node.y, style.node.size+0.2, style.highlightedForeground)
        .circle(node.x, node.y, style.node.size, getNodeColor(node))
        .text(label, node.x, node.y + style.node.size + 1, style.fontSize/globalScale, getNodeColor(node));
    })
    .linkColor(d3.hsl(style.node.note).darker(2))
    .onNodeClick((node, event) => {
      console.log('onNodeClick');
      channel.postMessage({ type: "click", payload: node });
    });
}

const Draw = ctx => ({
  circle: function(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    return this;
  },
  text: function(text, x, y, size, color) {
    ctx.font = `${size}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    return this;
  }
});

function getNodeColor(node) {
  if (node.id === selectedNode) {
    return style.node.selectedNote;
  } else if (node.isStub) {
    return style.node.nonExistingNote;
  } else {
    return style.node.note;
  }
}

function updateGraphData(newGraphData) {
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
  graph.graphData(graphData);
}

try {
  const vscode = acquireVsCodeApi();

  window.onload = () => {
    initDataviz(vscode);
    console.log("ready");
    vscode.postMessage({
      type: "webviewDidLoad"
    });
  };

  window.addEventListener("message", (event) => {
    const message = event.data;
  
    switch (message.type) {
      case "initial":
        graphData = message.payload;
        initDataviz(vscode);
        break;
      case "update":
        updateGraphData(message.payload);
        break;
      case "refresh":    
        graphData = message.payload;
        break;
      case "didSelectNote":
        selectedNode = message.payload;
        graph.graphData(graphData);
        break;
    }
  });

  window.addEventListener("error", error => {
    vscode.postMessage({
      type: "error",
      payload: {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        error: error.error
      }
    });
  });
} catch(err) {
  console.log("VsCode not detected");
}

window.addEventListener("resize", () => {
  graph.width(window.innerWidth).height(window.innerHeight);
});

if (window.data) {
  var graphData = window.data;
  initDataviz({
    postMessage: message => console.log("message", message)
  });
  console.log(`Local testing. Found ${graphData.nodes.length} nodes and ${graphData.links.length} edges`);
}





