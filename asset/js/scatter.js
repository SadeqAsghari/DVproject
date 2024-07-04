document.addEventListener("DOMContentLoaded", function () {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#scatter-plot svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3
    .select("#scatter-plot")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "scatter-tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

  function updateTooltip(event) {
    const svgRect = svg.node().getBoundingClientRect();
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .style("left", event.clientX - svgRect.left + "px")
      .style("top", event.clientY - svgRect.top + "px");
  }
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const color = d3
    .scaleOrdinal()
    .domain(["Developed", "Developing"])
    .range(["#1f77b4", "#ff7f0e"]);

  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "x-axis");

  const yAxis = svg.append("g").attr("class", "y-axis");

  const xAxisLabel = svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6);

  const yAxisLabel = svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -46)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Life Expectancy");

  function updateScatterPlot(year, disease) {
    d3.csv("asset/data/diseases_life_expectancy.csv").then((data) => {
      data = data.filter((d) => d.Year == year);

      const maxX =
        disease === "Measles" ? d3.max(data, (d) => +d[disease]) : 100;
      x.domain([0, maxX]);
      y.domain([40, 100]);

      const xTitle = disease.replace("_", " ");

      xAxis.call(d3.axisBottom(x).ticks(10));
      yAxis.call(d3.axisLeft(y).ticks(10));

      xAxisLabel.text(xTitle);

      const circles = svg.selectAll("circle").data(data, (d) => d.Country);

      circles.exit().remove();

      circles
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d[disease]))
        .attr("cy", (d) => y(d["Life Expectancy"]))
        .attr("r", 5)
        .attr("fill", (d) => color(d.Status))
        .merge(circles)
        .on("mouseover", function (event, d) {
          updateTooltip(event);
          // tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html(
            `Country: ${d.Country}<br/>Year: ${d.Year}<br/>Life Expectancy: ${d["Life Expectancy"]}<br/>${xTitle}: ${d[disease]}`
          );
          // .style("left", d3.pointer(event)[0] + "px")
          // .style("top", d3.pointer(event)[1] + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      circles
        .transition()
        .duration(1000)
        .attr("cx", (d) => x(d[disease]))
        .attr("cy", (d) => y(d["Life Expectancy"]))
        .attr("fill", (d) => color(d.Status));
    });
  }

  d3.select("#scatter-year-select").on("change", function () {
    const year = d3.select(this).property("value");
    const disease = d3.select("#scatter-disease-select").property("value");
    updateScatterPlot(year, disease);
  });

  d3.select("#scatter-disease-select").on("change", function () {
    const year = d3.select("#scatter-year-select").property("value");
    const disease = d3.select(this).property("value");
    updateScatterPlot(year, disease);
  });

  d3.csv("asset/data/diseases_life_expectancy.csv").then((data) => {
    const years = [...new Set(data.map((d) => d.Year))];
    const yearSelect = d3.select("#scatter-year-select");

    yearSelect
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

    yearSelect.property("value", years[0]);
    updateScatterPlot(years[0], "Hepatitis B");
  });

  const legend = svg
    .selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text((d) => d);
});
