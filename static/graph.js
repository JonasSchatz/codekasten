try {
    const vscode = acquireVsCodeApi();

    window.onload = () => {
        console.log("ready");
        document.getElementById("test").innerHTML = "whatever";
    };

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