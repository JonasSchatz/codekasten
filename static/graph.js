try {
    const vscode = acquireVsCodeApi();

    window.onload = () => {
        initDataviz;
        console.log('Initialized DataViz');
        vscode.postMessage({
            type: "webviewDidLoad"
        });
    };


    window.addEventListener("message", event => {
        const message = event.data;

        switch (message.type) {
            case "didUpdateData":
                const graphData = message.payload;
                console.log(graphData);
                
                initDataviz(graphData);
                console.log("didUpdateData");
                vscode.postMessage({
                    type: "debug", 
                    payload: "test"
                });
                break;
        }
    });
} catch {
    console.log("VsCode not detected");
}

function initDataviz(data) {
    
    const nodes = data.nodes;
    const links = data.edges;

    var svg = d3.select("svg").style("font", "12px sans-serif");
    var width = svg.attr("width");
    var height = svg.attr("height");

    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("center", d3.forceCenter(width/2, height/2));
        
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1);
    
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g");

    node.append("circle")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("r", 4);

    node.append("text")
        .attr("x", 8)
        .attr("y", "0.31em")
        .text(d => d.id)
      .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);

    
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
            node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    invalidation.then(() => simulation.stop());

}

if (window.data) {
    console.log('Test mode');

    window.onload = () => {
        initDataviz(window.data);
    };
}