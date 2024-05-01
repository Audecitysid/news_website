// Import Axios for making HTTP requests
const axios = require('axios');

exports.handler = async function(event, context) {
    try {
        // Parse the incoming data
        const data = JSON.parse(event.body);
        const q_term = data.q_term;
        const request_uid = data.uid; // functionality to be added later
        const api_key = "5ff6da31ba214f1285962596a3670a8b";
        const API_URL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q_term)}&apikey=${api_key}`;

        console.log("API request made for term:", q_term);

        switch (data.type) {
            case 'search':
                try {
                    const response = await axios.get(API_URL);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(response.data)
                    };
                } catch (error) {
                    console.error("API request error: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error fetching data from News API", details: error.message })
                    };
                }
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ msg: "Invalid request type" })
                };
        }
    } catch (error) {
        console.error("Error handling request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: "Server error", details: error.message })
        };
    }
};
