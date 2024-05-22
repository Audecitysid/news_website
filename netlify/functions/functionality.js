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
                                body: JSON.stringify({ msg: "Auth token is valid", userDetails: user.fullName , userEmail :  user.email })
                                
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

            case 'log' :
                try{

                    console.log('entered log');

                    // Validate auth token
                    const { db } = await connectToDatabase();
                    const user = await db.collection('users').findOne({ email: authToken });

                    if (!user) {
                        return {
                            statusCode: 401, // Unauthorized
                            body: JSON.stringify({ msg: "Auth token is invalid" })
                        };
                    }

                    const action_type = data.action_type;
                    const acticle_title = data.article_title;
                    const uid = authToken;
                    const publishedAt = data.article_time;
                    

                    const logEntry = {

                        email : uid,
                        action_type,
                        acticle_title,
                        publishedAt,
                        timestamp: new Date()

                    }
                    await db.collection('user_logs').insertOne(logEntry);

                    return {
                        statusCode: 200,
                        body: JSON.stringify({ msg: "Action logged successfully" })
                    };


                }catch (error) {
                    console.error("Error logging action: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error logging action", details: error.message })
                    };
                }

            case 'UserList':
                // add code to retrieve the data from table users and return all the data retrieved to the frontennd
                try {
                    const { db } = await connectToDatabase();
                    const users = await db.collection('users').find({}).toArray();
                    return {
                        statusCode: 200,
                        body: JSON.stringify(users)
                    };
                } catch (error) {
                    console.error("Error fetching user list: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error fetching user list", details: error.message })
                    };
                }


                case 'deleteUser':
                // New delete user functionality
                try {
                    const { db } = await connectToDatabase();
                    const userId = data.userId;
                    await db.collection('users').deleteOne({ email: userId });
                    //await db.collection('user_logs').deleteMany({ email: userId });

                    return {
                        statusCode: 200,
                        body: JSON.stringify({ msg: "User deleted successfully" })
                    };
                } catch (error) {
                    console.error("Error deleting user: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error deleting user", details: error.message })
                    };
                }

            case 'viewActivity':
                // New view activity functionality
                try {
                    const { db } = await connectToDatabase();
                    const userId = data.userId;
                    
                    let logs

                    if(userId === 'all'){
                        logs = await db.collection('user_logs').find().toArray();
                    }
                    else{
                        logs = await db.collection('user_logs').find({ email: userId }).toArray();
                    }

                    return {
                        statusCode: 200,
                        body: JSON.stringify(logs)
                    };
                } catch (error) {
                    console.error("Error fetching user activity: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error fetching user activity", details: error.message })
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
