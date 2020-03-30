// Read in Samples.json from the github repo.

function getSortedOtus(subjectData) {
  var otus = [];
  subjectData.sample_values.forEach((sample_value, index) => {
    let otu = {
      value: sample_value,
      id: subjectData.otu_ids[index],
      label: subjectData.otu_labels[index]
    };

    otus.push(otu);
  });

  //Sort otus in descending order
  otus.sort((a, b) => {
    return b.value - a.value;
  });

  return otus;
}

/**
 * Uses Plotly to plot to the corresponding dashboard area
 * @param {array} otus - Array of objects as getSortedOtus outputs
 */
function makeBarChart(otus) {
  //Break out the top 10 sorted OTUs
  var top10Otus = otus.slice(0, 10);
  xData = top10Otus
    .map(otu => {
      return otu.value;
    })
    .reverse();
  yData = top10Otus
    .map(otu => {
      return otu.id;
    })
    .reverse();
  labels = top10Otus
    .map(otu => {
      return otu.label;
    })
    .reverse();

  // Define Plotly bar chart
  var data = [
    {
      type: "bar",
      x: xData,
      y: yData.map(datum => {
        return `OTU ${datum}`;
      }),
      hovertext: labels,
      orientation: "h"
    }
  ];

  var layout = {
    autosize: true,
    title: "Most Common Bacterial Strains"
  };

  return Plotly.newPlot("bar", data, layout);
}

function makeBubbleChart(otus) {
  var trace1 = {
    x: otus.map(otu => {
      return otu.id;
    }),
    y: otus.map(otu => {
      return otu.value;
    }),
    text: otus.map(otu => {
      return otu.label;
    }),
    mode: "markers",
    marker: {
      color: otus.map(otu => {
        return otu.id;
      }),
      opacity: [1, 0.8, 0.6, 0.4],
      size: otus.map(otu => {
        return otu.value;
      })
    }
  };

  var data = [trace1];

  var layout = {
    xaxis: {
      title: "OTU Label"
    },
    showlegend: false
  };

  Plotly.newPlot("bubble", data, layout);
}

d3.json(
  "https://raw.githubusercontent.com/CollectionOfAtoms/plotly-challenge/master/data/samples.json"
).then(samples => {
  console.log(samples);

  // Testing on first subject, but should replace index with the value from the corresponding field
  // once proof of concept is established
  var subjectData = samples.samples[0];
  var subjectMetadata = samples.metadata[0];

  var otus = getSortedOtus(subjectData);

  makeBarChart(otus);
  makeBubbleChart(otus);
});
