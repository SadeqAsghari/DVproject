document.addEventListener("DOMContentLoaded", function () {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select("#dual-line-chart svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //const tooltip = d3.select("#dual-line-chart .tooltip");

  const tooltip = d3
    .select("#dual-line-chart")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "dual-tooltip")
    .style("position", "absolute")
    .style("opacity", 0);
  function updateTooltip(event) {
    const svgRect = svg.node().getBoundingClientRect();
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .style("left", event.clientX - svgRect.left + "px")
      .style("top", event.clientY - svgRect.top + "px");
  }
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const line = d3
    .line()
    .x((d) => x(d.Year))
    .y((d) => y(d["Average Infant Deaths"]));

  const color = d3
    .scaleOrdinal()
    .domain(["Developed", "Developing"])
    .range(["#1f77b4", "#ff7f0e"]);

  d3.csv("asset/data/avg_infant_deaths_2000_2015.csv").then((data) => {
    data.forEach((d) => {
      d.Year = d3.timeParse("%Y")(d.Year);
      d["Average Infant Deaths"] = +d["Average Infant Deaths"];
    });

    const categories = d3.groups(data, (d) => d.Status);

    x.domain(d3.extent(data, (d) => d.Year));
    y.domain([0, d3.max(data, (d) => d["Average Infant Deaths"])]);

    svg
      .selectAll(".line")
      .data(categories)
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("d", (d) => line(d[1]))
      .style("fill", "none")
      .style("stroke", (d) => color(d[0]))
      .style("stroke-width", "2px");

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.Year))
      .attr("cy", (d) => y(d["Average Infant Deaths"]))
      .attr("r", 5)
      .style("fill", (d) => color(d.Status))
      .on("mouseover", function (event, d) {
        updateTooltip(event);
        // tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          `Year: ${d3.timeFormat("%Y")(d.Year)}<br/>Average Infant Deaths: ${
            d["Average Infant Deaths"]
          }<br/>Status: ${d.Status}`
        );
        // .style("left", d3.pointer(event)[0] + 15 + "px")
        // .style("top", d3.pointer(event)[1] - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    svg.append("g").attr("class", "axis axis--y").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("transform", `translate(${width / 2},${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .text("Year");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Average Infant Deaths");

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
});
