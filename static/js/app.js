// Read in Samples.json from the github repo.

/**
 * Takes in a single entry from the samples property of the top level object in samples.json
 * and returns an array of objects where each one has an otu id, value, and label.
 * Return array is sorted descending.
 * @param {Object} subjectData
 */
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
function makeBarChart(otus, id) {
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
    title: `Test Subject ${id}'s Most Common Bacterial Strains`
  };

  return Plotly.newPlot("bar", data, layout);
}

/**
 * Uses Plotly to plot the bubble chart in the dashboard area
 * @param {array} otus - Array of objects as getSortedOtus outputs
 */
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
    yaxis: {
      title: "Number of Occurences Found in Sample"
    },
    showlegend: false
  };

  Plotly.newPlot("bubble", data, layout);
}

function makeGaugeChart(wfreq) {
  var data = [
    {
      type: "indicator",
      mode: "gauge+number",
      value: wfreq,
      title: {
        text: "Bellybutton Washing Frequency per Week",
        font: { size: 24 }
      },
      gauge: {
        bar: {
          color: "lightgray",
          thickness: 0.2,
          line: {
            color: "black",
            width: 1
          }
        },
        bgcolor: "white",
        borderwidth: 2,
        bordercolor: "gray",
        axis: { range: [0, 9] },
        steps: [
          { range: [0, 1], color: "#aa8148" },
          { range: [1, 2], color: "#a88745" },
          { range: [2, 3], color: "#a58c43" },
          { range: [3, 4], color: "#a09343" },
          { range: [4, 5], color: "#9a9943" },
          { range: [5, 6], color: "#939f45" },
          { range: [6, 7], color: "#8ba549" },
          { range: [7, 8], color: "#81ab4f" },
          { range: [8, 9], color: "#75b157" }
        ]
      }
    }
  ];

  var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
  Plotly.newPlot("gauge", data, layout);
}

function populateDropdown(ids) {
  var select = d3.select("#selDataset");
  ids.forEach(id => {
    select
      .append("option")
      .attr("value", id)
      .text(id);
  });
}

function displayDemographicInfo(subjectMetadata) {
  metadata_div = d3.select("#sample-metadata");
  metadata_div.text("");
  Object.entries(subjectMetadata).forEach(([key, value], index) => {
    metadata_div.append("div").text(`${key} : ${value}`);
  });
}

function optionChanged(currentId) {
  d3.json(
    "https://raw.githubusercontent.com/CollectionOfAtoms/plotly-challenge/master/data/samples.json"
  ).then(samples => {
    currentIdIndex = samples.names.indexOf(currentId);

    // Testing on first subject, but should replace index with the value from the corresponding field
    // once proof of concept is established
    var subjectData = samples.samples[currentIdIndex];
    var subjectMetadata = samples.metadata[currentIdIndex];

    var otus = getSortedOtus(subjectData);

    makeBarChart(otus, currentId);
    makeBubbleChart(otus);
    makeGaugeChart(subjectMetadata.wfreq);
    displayDemographicInfo(subjectMetadata);
  });
}

// Load data directly from the hosted source on github.
d3.json(
  "https://raw.githubusercontent.com/CollectionOfAtoms/plotly-challenge/master/data/samples.json"
).then(samples => {
  populateDropdown(samples.names);

  currentId = d3.select("#selDataset").property("value");
  optionChanged(currentId);
});
