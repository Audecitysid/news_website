// fetchNews.js
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
    const API_URL = "https://newsapi.org/v2/top-headlines?country=us&apiKey=5ff6da31ba214f1285962596a3670a8b";

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: error.message })
        };
    }
};
