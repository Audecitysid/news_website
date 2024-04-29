// Asynchronous import for node-fetch
import('node-fetch').then(({ default: fetch }) => {
    exports.handler = async function(event, context) {
        const API_URL = "https://newsapi.org/v2/top-headlines?country=us&apiKey=5ff6da31ba214f1285962596a3670a8b";
        console.log("api request made");
  
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
  }).catch(error => console.error("Failed to load 'node-fetch':", error));
  