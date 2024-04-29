// Top-level asynchronous import of node-fetch
let fetch;

import('node-fetch')
  .then(({ default: importedFetch }) => {
    fetch = importedFetch;
  })
  .catch(error => console.error("Failed to load 'node-fetch':", error));

// Exporting handler function directly under exports
exports.handler = async function(event, context) {
  if (!fetch) {
    console.error("Fetch is not loaded");
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: "Fetch is not initialized" })
    };
  }

  const API_URL = "https://newsapi.org/v2/top-headlines?country=us&apiKey=5ff6da31ba214f1285962596a3670a8b";
  console.log("API request made");

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(data);
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Fetch error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: error.message })
    };
  }
};
