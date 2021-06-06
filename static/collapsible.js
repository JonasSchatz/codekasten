var neighborDistanceSlider = document.getElementById('neighbor-distance-slider');

noUiSlider.create(neighborDistanceSlider, {
    start: 25, 
    range: {
      min: 0, 
      max: 25
    }, 
    pips: {
      mode: 'values', 
      values: [0, 5, 10, 15, 20, 25], 
      density: 5
    }
});

var clusterSizeSlider = document.getElementById('cluster-size-slider');

noUiSlider.create(clusterSizeSlider, {
    start: [0, 100], 
    range: {
      min: 0, 
      max: 100
    },
    pips: {
      mode: 'values', 
      values: [0, 20, 40, 60, 80, 100],
      density: 5
    }
});

var colorizeClustersCheckbox = document.getElementById('colorize-clusters-checkbox');