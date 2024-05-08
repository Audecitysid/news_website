// Import Axios for making HTTP requests
const axios = require('axios');
const cookie = require('cookie');
const { connectToDatabase } = require('./utils/db');

exports.handler = async function(event, context) {
    try {
        // Parse the incoming data
        const data = JSON.parse(event.body);
        const api_key = "5ff6da31ba214f1285962596a3670a8b";

        
        
        

        const cookies = cookie.parse(event.headers.cookie || '');
        const authToken = cookies.authToken;
        console.log("cookie data : " + authToken );

        /* log the user data to database */




        

        switch (data.type) {
            case 'search':
                try {
                    
                    const q_term = data.q_term;
                    console.log("API request made for term:", q_term);
                    const API_URL = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q_term)}&apikey=${api_key}`;

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

            case 'country':

                    try{    
                    const updateDbUrl = `${process.env.URL}/.netlify/functions/update_db`;
                    await axios.post(updateDbUrl);

        
                    const country = data.country;

                    // Constructing the URL with template literals
                    const API_URL = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&apiKey=${encodeURIComponent(api_key)}`;
                    console.log("API request made for country : " + country);

                    const response = await axios.get(API_URL)

                    return {
                        statusCode: 200,
                        body: JSON.stringify(response.data)
                      };



                    }
                    catch (error) {
                        console.error("API request error: ", error);
                        return {
                            statusCode: error.response?.status || 500,
                            body: JSON.stringify({ msg: "Error fetching data from News API", details: error.message })
                        };
                    }

            case 'category':
                
                try {
                    // update the article collection
                    const updateDbUrl = `${process.env.URL}/.netlify/functions/update_db`;
                    await axios.post(updateDbUrl);

                    const category = data.category;
                    const country = 'in';

                    
                    const API_URL = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}&apiKey=${encodeURIComponent(api_key)}`;
                    console.log("API request made : " + country + ' ' + category );

                    const response = await axios.get(API_URL)

                    
                    return {
                        statusCode: 200,
                        body: JSON.stringify(response.data)
                    };


                }
                catch (error) {
                    console.error("API request error: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error fetching data from News API", details: error.message })
                    };
                }

            case 'auth':
                
                try {            
                        const cookies = cookie.parse(event.headers.cookie || '');
                        const authToken = cookies.authToken;
                        console.log("cookie data : " + authToken );

                        const { db } = await connectToDatabase(); // Use the connectToDatabase function from utils/db.js
                        const user = await db.collection('users').findOne({ email: authToken });


                        if (user) {
                            console.log("auth is valid : " + user.fullName + ' ' + user.email);
                            return {
                                statusCode: 200,
                                body: JSON.stringify({ msg: "Auth token is valid", userDetails: user.fullName })
                                
                            };
                        } else {
                            return {
                                statusCode: 404, // Not Found
                                body: JSON.stringify({ msg: "Auth token is invalid" })
                            };
                        }



                }
                catch (error) {
                    console.error("API request error: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error fetching data from database ", details: error.message })
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
