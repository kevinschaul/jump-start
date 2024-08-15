import { useEffect, useState } from "react";

/* Makes CSS media queries available in JS. Use like:
 *
 * const isSkinny = useMediaQuery('(max-width: 600px)')
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const matchQueryList = window.matchMedia(query);

    function handleChange(e) {
      setMatches(e.matches);
    }

    matchQueryList.addEventListener("change", handleChange);

    return () => {
      matchQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
