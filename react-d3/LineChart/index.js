import { useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import { select } from "d3-selection";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";

const data = [
  { year: 2020, value: 10 },
  { year: 2021, value: 8 },
  { year: 2022, value: 6 },
  { year: 2023, value: 14 },
]

const LineChart = (props) => {
  const { width, height, ref } = useResizeDetector();

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = (chartWidth * 0.5) - margin.top - margin.bottom;

  useEffect(() => {
    const svg = select(ref.current).select("svg").html("");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = scaleLinear()
      .domain(extent(data, d => d.year))
      .range([0, chartWidth])

    const y = scaleLinear()
      .domain(extent(data, d => d.value))
      .range([chartHeight, 0])

    const l = line()
      .x(d => x(d.year))
      .y(d => y(d.value))

    g.selectAll('path')
      .data([data])
      .join('path')
      .attr('d', l)
      .style('fill', 'none')
      .style('stroke', '#000')
      .style('stroke-width', 3)
    
  }, [margin]);

  return (
    <div ref={ref}>
      <svg
        style={{ width: "100%" }}
        width={chartWidth + margin.left + margin.right}
        height={chartHeight + margin.top + margin.bottom}
      />
    </div>
  );
};

export { LineChart as default };
