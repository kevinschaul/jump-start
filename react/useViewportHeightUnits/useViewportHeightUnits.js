import { useEffect, useState } from "react";

/* Makes the newer CSS height units available in JS
 * https://css-tricks.com/the-large-small-and-dynamic-viewports/
 *
 * Implementation based on
 * https://github.com/joppuyo/large-small-dynamic-viewport-units-polyfill
 */
export default function useViewportHeightUnits() {
  const [heights, setHeights] = useState({
    svh: 0,
    lvh: 0,
  });

  useEffect(() => {
    let timeoutId;

    function calculateHeightUnits() {
      timeoutId = setTimeout(() => {
        if (document) {
          var fixed = document.createElement("div");
          fixed.style.width = "1px";
          fixed.style.position = "fixed";
          fixed.style.left = "0";
          fixed.style.top = "0";
          fixed.style.bottom = "0";
          fixed.style.visibility = "hidden";

          fixed.style.height = "100lvh";
          document.body.appendChild(fixed);
          const lvh = fixed.clientHeight * 0.01;

          fixed.style.height = "100svh";
          const svh = fixed.clientHeight * 0.01;

          setHeights({
            lvh,
            svh,
          });

          fixed.remove();
        }
      }, 500);
    }

    const handler = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      calculateHeightUnits();
    };

    calculateHeightUnits();

    window.addEventListener("resize", handler);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", handler);
    };
  }, []);

  return heights;
}
