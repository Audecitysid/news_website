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
      _id: article.publishedAt  // Set the article time as the MongoDB document _id
    }));

    // Connect to the MongoDB database
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');

    // Insert fetched articles into the database
    // Using insertMany to insert all articles at once
    const insertResult = await collection.insertMany(articles , { ordered: false });

    // Return success response with details of the inserted documents
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Articles fetched and stored successfully', data: insertResult.ops })
    };
  } catch (error) {
    console.error("Error fetching or storing articles: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch or store articles', error: error.message })
    };
  }
};
