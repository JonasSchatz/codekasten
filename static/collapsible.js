var neighborDistanceSlider = document.getElementById('neighbor-distance-slider');

noUiSlider.create(neighborDistanceSlider, {
    start: 20, 
    range: {
      min: 0, 
      max: 25
    }, 
    pips: {
      mode: 'values', 
      values: [1, 5], 
      density: 1
    }
});

var clusterSizeSlider = document.getElementById('cluster-size-slider');

noUiSlider.create(clusterSizeSlider, {
    start: [20, 80], 
    range: {
      min: 0, 
      max: 100
    },
});

var colorizeClustersCheckbox = document.getElementById('colorize-clusters-checkbox');