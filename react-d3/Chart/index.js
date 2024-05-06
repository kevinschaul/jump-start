import { useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import { select } from "d3-selection";

const Chart = (props) => {
  const { width, height, ref } = useResizeDetector();

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    const svg = select(ref.current).select("svg").html("");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
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

export { Chart as default };
