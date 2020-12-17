const CONTAINER_ID = "graph";
const graph = ForceGraph();


function initDataviz(){
  const elem = document.getElementById(CONTAINER_ID);
  graph(elem)
    .graphData(graphData)
    .nodeId('id').nodeCanvasObject((node, ctx, globalScale) => {
      const label = node.label;
      const fontSize = 14;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize*0.2);

      ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(123, 57, 5, 1.0)';
      ctx.fillText(label, node.x, node.y);
    })
    .onNodeClick((node, event) => {
      console.log('onNodeClick');
      vscode.postMessage({ type: "click", payload: node });
    });
}



try {
  const vscode = acquireVsCodeApi();

  window.onload = () => {
    initDataviz();
    console.log("ready");
    vscode.postMessage({
      type: "webviewDidLoad"
    });
  };

  window.addEventListener("message", (event) => {
    const message = event.data;
  
    switch (message.type) {
      case "refresh":
        const newGraph = message.payload;
        graphData = newGraph;
        initDataviz();
        break;
      case "didSelectNote":
        const noteId = message.payload;
        console.log(`ToDo: Selected Node {noteId}, currently doint nothing`);
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

if (window.data) {
  var graphData = window.data;
  initDataviz();
  console.log(`Local testing. Found ${graphData.nodes.length} nodes and ${graphData.links.length} edges`);
}





