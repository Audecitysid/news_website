// Import axios directly
const axios = require('axios');

exports.handler = async function(event, context) {
  const API_URL = "https://newsapi.org/v2/top-headlines?country=us&apiKey=5ff6da31ba214f1285962596a3670a8b";
  console.log("API request made");

  try {
    const response = await axios.get(API_URL);
    
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error("API request error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: error.message })
    };
  }
};
