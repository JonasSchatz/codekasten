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


var forceLink = d3.forceLink().id(function (d) {
  return d.id;
}).distance(function (d) {
  return 1;
}).strength(function (d) {
  if (d.source.tags.includes("#structure")) {
    return 0.01;
  }
  return 1;
});


function initDataviz(channel){
  const elem = document.getElementById(CONTAINER_ID);
  graph(elem)
    .graphData(graphData.enrichedData)
    .d3Force("x", d3.forceX())
    .d3Force("y", d3.forceY())
    .d3Force("link", forceLink)
    .nodeId('id').nodeCanvasObject((node, ctx, globalScale) => {

      if (node.clusterSize) {
        var clusterSize = node.clusterSize.toString();
      } else {
        var clusterSize = "?";
      }

      if (node.distance) {
        var distance = node.distance.toString();
      } else {
        var distance = "?";
      }
      
      const label = "Size: " + clusterSize + ", Dist: " + distance;
      
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
  if (node.id === graphData.selectedNodeId) {
    return style.node.selectedNote;
  } else if (node.isStub) {
    return style.node.nonExistingNote;
  } else {
    return style.node.note;
  }
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
    console.log(message.type);
    switch (message.type) {
      
      case "initial":
        graphData.originalData = message.payload;
        initDataviz(vscode);
        break;
      case "update":
        graphData.originalData = message.payload;
        graphData.enrichedData;
        break;
      case "refresh":    
        initDataviz(vscode);
        break;
      case "didSelectNote":
        graphData.selectedNodeId = message.payload;
        graph.graphData(graphData.enrichedData);
        break;
      case "updateSettings":
        vscodeSettings = message.payload;
        console.log(vscodeSettings);
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

neighborDistanceSlider.noUiSlider.on('change', function (values, handle) {
  console.log("Change in neighbor distance slider:");
  console.log(values[handle]);
});

clusterSizeSlider.noUiSlider.on('change', function (values, handle) {
  console.log("Change in cluster size slider:");
  console.log(values);
});

colorizeClustersCheckbox.addEventListener('change', (event) => {
  console.log(event.currentTarget.checked);
});

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
