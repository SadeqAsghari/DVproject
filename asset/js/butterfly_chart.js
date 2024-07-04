document.addEventListener("DOMContentLoaded", function () {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 },
    width = 1600 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    chartMargin = 50;

  const svg = d3
    .select("#butterfly-chart svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("#butterfly-chart .tooltip");
  // const tooltip = d3
  //   .select("#butterfly-chart")
  //   .append("div")
  //   .attr("class", "tooltip")
  //   .attr("id", "butter")
  //   .style("opacity", 0)
  //   .style("z-index", "1000")
  //   .style("position", "absolute");
  function updateTooltip(event) {
    const svgRect = svg.node().getBoundingClientRect();
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .style("left", event.pageX + "px")
      .style("top", event.pageY - svgRect.top + "px");
  }
  const x = d3.scaleLinear().range([0, width / 2 - chartMargin]);
  const y = d3.scaleBand().range([height, 0]).padding(0.3);

  d3.csv("asset/data/avg_gdp_2000_2015.csv").then((data) => {
    data.forEach((d) => {
      d.Year = +d.Year;
      d["Average GDP"] = +d["Average GDP"];
    });

    const developedData = data.filter((d) => d.Status === "Developed");
    const developingData = data.filter((d) => d.Status === "Developing");

    y.domain(data.map((d) => d.Year));
    x.domain([0, d3.max(data, (d) => d["Average GDP"])]);

    svg
      .selectAll(".bar.developed")
      .data(developedData)
      .enter()
      .append("rect")
      .attr("class", "bar developed")
      .attr("x", (d) => width / 2 - chartMargin - x(d["Average GDP"]))
      .attr("y", (d) => y(d.Year))
      .attr("width", (d) => x(d["Average GDP"]))
      .attr("height", y.bandwidth())
      .attr("fill", "#1f77b4")
      .on("mouseover", function (event, d) {
        updateTooltip(event);
        // tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          `Year: ${d.Year}<br/>GDP: ${d["Average GDP"]}<br/>Status: Developed`
        );
        // .style("left", event.pageX + 10 + "px")
        // .style("top", event.pageY + 10 + "px");
        // .style("left", d3.pointer(event)[0] + 200 + "px")
        // .style("top", d3.pointer(event)[1] - 8 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg
      .selectAll(".text.developed")
      .data(developedData)
      .enter()
      .append("text")
      .attr("class", "text developed")
      .attr("x", (d) => width / 2 - chartMargin - x(d["Average GDP"]) + 5)
      .attr("y", (d) => y(d.Year) + y.bandwidth() / 2 + 5)
      .attr("dy", ".35em")
      .text((d) => d3.format(".2f")(d["Average GDP"]))
      .attr("fill", "white")
      .style("font-size", "12px"); // Adjusted text size

    svg
      .selectAll(".bar.developing")
      .data(developingData)
      .enter()
      .append("rect")
      .attr("class", "bar developing")
      .attr("x", width / 2 + chartMargin)
      .attr("y", (d) => y(d.Year))
      .attr("width", (d) => x(d["Average GDP"]))
      .attr("height", y.bandwidth())
      .attr("fill", "#ff7f0e")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Year: ${d.Year}<br/>GDP: ${d["Average GDP"]}<br/>Status: Developing`
          )
          .style("left", d3.pointer(event)[0] + 15 + "px")
          .style("top", d3.pointer(event)[1] - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg
      .selectAll(".text.developing")
      .data(developingData)
      .enter()
      .append("text")
      .attr("class", "text developing")
      .attr("x", (d) => width / 2 + chartMargin + x(d["Average GDP"]) - 5)
      .attr("y", (d) => y(d.Year) + y.bandwidth() / 2 + 5)
      .attr("dy", ".35em")
      .text((d) => d3.format(".2f")(d["Average GDP"]))
      .attr("text-anchor", "end")
      .attr("fill", "white")
      .style("font-size", "12px"); // Adjusted text size

    svg
      .append("g")
      .attr("class", "axis axis--y")
      .attr("transform", `translate(${width / 2},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format("d")));

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right},${margin.top})`);

    legend
      .append("rect")
      .attr("x", -20)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#1f77b4");

    legend
      .append("text")
      .attr("x", -24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("Developed");

    legend
      .append("rect")
      .attr("x", -20)
      .attr("y", 20)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#ff7f0e");

    legend
      .append("text")
      .attr("x", -24)
      .attr("y", 29)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("Developing");
  });
});
