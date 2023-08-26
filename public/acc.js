


/**
 * 
 * @param {string} jsonData string representation of a json object (map [int] array)
 * @returns nothing. Creates 48 graphs in the centerDiv div.
 */
// Ryan's code
async function loadJson(jsonData) {

    // Load
    console.log(typeof jsonData);
    console.log(jsonData);
    let data = JSON.parse(jsonData);
    let sampling_rate = 500;
    // Time vector
    var x = [];
    for (i = 0; i < 1000; i++) {
        x.push(i / sampling_rate);
    };
    // Graph divs
    var graphDivs = [];
    for (i = 0; i < 48; i++) {
        numkeys = Object.keys(data[i]).length;
        console.log(numkeys)
        y = [];
        for (j = 0; j < numkeys; j++) {
            y.push(data[i][j]);
        };
        console.log(typeof y);
        x = [];
        for (j = 0; j < numkeys; j++) {
            x.push(j / sampling_rate);
        };
        // console.log(y);
        console.log(x);
        // Create div for each simulation
        let graphDiv = document.createElement("div");
        graphDiv.id = "graphDiv" + i;
        // Append the div to a centered div
        centerDiv.appendChild(graphDiv);
        //js equivalent of np.linspace(0, 1, len(ys[i]))
        // Create plots
        Plotly.newPlot(graphDiv, [
            // Signal
            {
                mode: 'lines',
                x: x,
                y: y,
                xaxis: 'x',
                yaxis: 'y',
                name: 'Signal',
                line: {
                    color: 'black'
                }
            }, {
                // Burst
                mode: 'lines',
                x: [],
                y: [],
                xaxis: 'x',
                yaxis: 'y',
                name: 'Burst',
                line: {
                    color: 'red'
                }
            }], {
            // Layout
            dragmode: 'select',
            selectdirection: "h",
            xaxis: { zeroline: false },
            showlegend: true,
            width: 1000,
            height: 150,
            margin: {
                l: 25,
                r: 25,
                b: 25,
                t: 25,
                pad: 5
            }
        }
        );

        graphDivs.push(graphDiv);
    };
    // console.log(graphDivs);
    // console.log(graphDivs.length);
    // Selection callback
    let gi = 1;
    for (gi = 0; gi < 48; gi++) {
        console.log(graphDivs[gi].data);
        let gDiv = graphDivs[gi]
        gDiv.on('plotly_selected', function (eventData) {
            try {
                // Get lower and upper bounds of selected bursts
                let xselect = [eventData.range.x[0], eventData.range.x[1]];
                let xburst = [];
                let yburst = [];
                for (xi = 0; xi < x.length; xi++) {
                    if (gDiv.data[0]['x'][xi] >= xselect[0] && gDiv.data[0]['x'][xi] <= xselect[1]) {
                        xburst.push(gDiv.data[0]['x'][xi]);
                        yburst.push(gDiv.data[0]['y'][xi]);
                    }
                };
                // Update red burst signal
                gDiv.data[1]['x'] = xburst;
                gDiv.data[1]['y'] = yburst;
                // Replot updated bursts
                var replot = () => {
                    // Bug in plotly that sometimes leads to infinite
                    //   recursion. Timing out to fix.
                    setTimeout(() => {
                        Plotly.redraw(gDiv, [1]);
                    }, 500);
                }
                replot();
            } catch (error) {// Get lower and upper bounds of selected bursts
                console.log("catch branch")
                let xselect = [];
                let xburst = [];
                let yburst = [];
                for (xi = 0; xi < x.length; xi++) {
                    if (gDiv.data[0]['x'][xi] >= xselect[0] && gDiv.data[0]['x'][xi] <= xselect[1]) {
                        xburst.push(gDiv.data[0]['x'][xi]);
                        yburst.push(gDiv.data[0]['y'][xi]);
                    }
                };
                // Update red burst signal
                gDiv.data[1]['x'] = xburst;
                gDiv.data[1]['y'] = yburst;
                // Replot updated bursts
                var replot = () => {
                    // Bug in plotly that sometimes leads to infinite
                    //   recursion. Timing out to fix.
                    setTimeout(() => {
                        Plotly.redraw(gDiv, [1]);
                    }, 200);
                }
                replot();
            }
        });
    };
    console.log("Done");
};

/**
 * wrapper for SubmitSelections in index.js. Creates tuplist and sends it to the database via SubmitSelections
 */
function sendResponse() {
    // cloud function url
    const url = 'http://localhost:5001/voyteklabstudy/us-central1/SubmitSelections'; // Replace with the URL of your SubmitSelections function
    // get tuplist
    centerDiv = document.getElementById("centerDiv");
    let tuplist = [];
    for (i = 0; i < 48; i++) {
      let graphDiv = document.getElementById("graphDiv" + i);
      let xselect = [graphDiv.data[1]['x'][0], graphDiv.data[1]['x'][graphDiv.data[1]['x'].length - 1]];
      tuplist.push(xselect);
    }
    console.log(tuplist);
    // send tuplist to database as argument to SubmitSelections
    let data = { tuplist: tuplist };
    console.log(data);
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5001'
      }
    }).then(response => {
      console.log(response);
      return response.json();
    }).then(data => {
      console.log(data);
    }).catch(error => {
      console.log(error);
    });
  }