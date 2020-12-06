try {
    const vscode = acquireVsCodeApi();



    window.addEventListener("message", event => {
        const message = event.data;

        switch (message.type) {
            case "didUpdateData":
                const graphData = message.payload;
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

function initDataviz() {
    
    const nodes = window.data.nodes;
    const links = window.data.edges;

    var svg = d3.select("svg");
    var width = svg.attr("width");
    var height = svg.attr("height");

    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("center", d3.forceCenter(width/2, height/2));
    

    svg.style("font", "12px sans-serif");

    
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 10);
    
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", "#19D");
        //.call(drag(simulation));
    
    node.append("text")
        .attr("dx", 8)
        .attr("dy", "0.31em")
        .text(d => d.title)
        .attr("fill", "black");
    
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    invalidation.then(() => simulation.stop());
    

}

if (window.data) {
    console.log('Test mode');

    window.onload = () => {
        initDataviz();
    };
}