// Import necessary libraries
const axios = require('axios');
const { connectToDatabase } = require('./utils/db');

exports.handler = async function(event, context) {
    const API_URL = "https://newsapi.org/v2/top-headlines?country=us&apiKey=5ff6da31ba214f1285962596a3670a8b";
    console.log("Fetching news articles...");

    try {
        // Fetch news articles from the API
        const response = await axios.get(API_URL);
        const articles = response.data.articles.map(article => ({
            ...article,
            _id: article.publishedAt // Using publishedAt as _id since it's unique
        }));

        // Connect to the MongoDB database
        const { db } = await connectToDatabase();
        const collection = db.collection('articles');

        // Attempt to insert fetched articles into the database
        try {
            const insertResult = await collection.insertMany(articles, { ordered: false });
            console.log('Insert successful:', insertResult);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Articles fetched and stored successfully', data: insertResult })
            };
        } catch (insertError) {
            // Handle duplicate key errors gracefully
            if (insertError.code === 11000) {
                console.log('Some duplicates were ignored');
                return {
                    statusCode: 207, // HTTP 207 Multi-Status might be appropriate here
                    body: JSON.stringify({ message: 'Some articles were duplicates and ignored', error: insertError.message })
                };
            }
            throw insertError; // Re-throw other errors which we did not expect to handle
        }
    } catch (error) {
        console.error("Error fetching or storing articles: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to fetch or store articles', error: error.message })
        };
    }
};
