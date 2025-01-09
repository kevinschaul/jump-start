require("dotenv").config();
const axios = require("axios");
const fs = require("fs").promises;

if (process.argv.length < 5) {
  console.error(
    "Usage: node script.js <chart-id> <marker-to-replace> <path-to-geojson>",
  );
  console.error(
    "\nExample: node scripts/update_datatwrapper_map.js B92NI EVACWARNING data/build/evacuation-zones-order-latest.json",
  );
  process.exit(1);
}

const CHART_ID = process.argv[2];
const MARKER_TO_REPLACE = process.argv[3];
const GEOJSON_PATH = process.argv[4];

// Axios instance with authentication
const api = axios.create({
  baseURL: "https://api.datawrapper.de/v3",
  headers: {
    Authorization: `Bearer ${process.env.DATAWRAPPER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

async function getChartData() {
  try {
    const response = await api.get(`/charts/${CHART_ID}/data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chart data:", error.message);
    throw error;
  }
}

async function loadGeoJSON() {
  try {
    const data = await fs.readFile(GEOJSON_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading GeoJSON file:", error.message);
    throw error;
  }
}

async function updateChartData(newData) {
  try {
    await api.put(`/charts/${CHART_ID}/data`, newData);
    console.log("Chart data updated successfully");
  } catch (error) {
    console.error("Error updating chart data:", error.message);
    throw error;
  }
}

function replaceMarkerData(chartData, geoJSONData) {
  // Parse the chart data if it's a string
  const data =
    typeof chartData === "string" ? JSON.parse(chartData) : chartData;

  // Find and replace markers with matching title
  let found = false;
  if (Array.isArray(data.markers)) {
    data.markers = data.markers.map((marker) => {
      if (marker.title === MARKER_TO_REPLACE) {
        found = true;
        return {
          ...marker,
          feature: geoJSONData,
        };
      }
      return marker;
    });
  }
  if (!found) {
    throw Error(`Did not find a marker with name: ${MARKER_TO_REPLACE}`);
  }

  return data;
}

async function main() {
  try {
    // 1. Download chart data
    const chartData = await getChartData();
    console.log("Chart data downloaded successfully");
    // console.log(chartData);

    // 2. Load GeoJSON data
    const geoJSONData = await loadGeoJSON();
    console.log("GeoJSON data loaded successfully");

    // 3. Replace marker data
    const updatedData = replaceMarkerData(chartData, geoJSONData);
    console.log("Marker data replaced successfully");

    // 4. Upload updated data
    await updateChartData(updatedData);

    console.log("Process completed successfully");
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  }
}

// Run the script
main();
