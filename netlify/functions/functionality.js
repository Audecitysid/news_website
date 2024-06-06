// Import Axios for making HTTP requests
const axios = require('axios');
const cookie = require('cookie');
const { connectToDatabase } = require('./utils/db');

exports.handler = async function(event, context) {
    try {
        // Parse the incoming data
        const data = JSON.parse(event.body);
        const api_key = "5ff6da31ba214f1285962596a3670a8b";

        //blockingDelay(); // Blocks the execution for 20 seconds

        const cookies = cookie.parse(event.headers.cookie || '');
        const authToken = cookies.authToken;
        

        const { db } = await connectToDatabase(); // Use the connectToDatabase function from utils/db.js
        const MasterUser = await db.collection('users').findOne({ cookie: authToken });

        if(!MasterUser){
            return {
                statusCode: 404, // Not Found
                body: JSON.stringify({ msg: "Auth token is invalid" })
            };
        }


        // writing logs to server_logs
        const log_object = {
            ...data, // Copy all fields from data
            email: MasterUser.email, // Add the email field
            timestamp: new Date() // Add a timestamp if needed
        };

        await db.collection('server_logs').insertOne(log_object);


        switch (data.type) {
            case 'search':
                try {
                    
                    const q_term = data.q_term;
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
                    

        
                    const country = data.country;

                    // Constructing the URL with template literals
                    const API_URL = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&apiKey=${encodeURIComponent(api_key)}`;
                    

                    const response = await axios.get(API_URL)


                    

                    const responseData = {
                        ...response.data,
                        
                        userDetails: MasterUser.fullName , 
                        userEmail :  MasterUser.email 
                    };

                    return {
                        statusCode: 200,
                        body: JSON.stringify(responseData)
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
                    /*
                    const updateDbUrl = `${process.env.URL}/.netlify/functions/update_db`;
                    await axios.post(updateDbUrl);
                    */

                    const category = data.category;
                    const country = 'in';

                    
                    const API_URL = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}&apiKey=${encodeURIComponent(api_key)}`;
                    

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
                        
                        let adminflag = 'False';  
                        if(MasterUser.admin === 'True' ){
                            adminflag = 'True';

                        }
                        
                            return {
                                statusCode: 200,
                                body: JSON.stringify({ 
                                    msg: "Auth token is valid", 
                                    userDetails: MasterUser.fullName , 
                                    userEmail :  MasterUser.email ,
                                    admin_auth: adminflag
                                })
                                
                            };
                         



                }
                catch (error) {
                    console.error("API request error: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error fetching data from database ", details: error.message })
                    };
                }


            

            case 'logout' : 

                    try {            
                        
                        
                        await db.collection('users').updateOne({ cookie: authToken }, { $set: { cookie: "Logged Out" } });

                        const serializedCookie = cookie.serialize('authToken', '', {
                            httpOnly: false,
                            path: '/',
                            maxAge: -1 // Delete cookie
                          });

                          return {
                            statusCode: 200,
                            headers: {
                              'Set-Cookie': serializedCookie ,
                              'Content-Type': 'application/json'
        
        
                            },
                            body: JSON.stringify({ 
                              message: 'Logout successful' 
                            })
                          };
                                
                    }
                                      
                catch (error) {
                    console.error("API request error: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error logging out ", details: error.message })
                    };
                }

                
                

            case 'article_reactions' :

                try{
                    
                     
                    const ArticleReaction = {
                            
                        publishedAt : data.publishedAt,
                        uid : MasterUser.email,
                        action_type : data.action_type,
                        url : data.url,
                        urlToImage : data.urlToImage,
                        Title : data.title,
                        Description : data.description

                    }

                    await db.collection('Article_Reactions').insertOne(ArticleReaction);

                        return {
                            statusCode: 200,
                            body: JSON.stringify({ msg: "article reaction saved" })
                        };
                }catch(error) {
                    console.error("Error logging action: ", error);
                    return {
                        statusCode: error.response?.status || 500,
                        body: JSON.stringify({ msg: "Error saving reaction ", details: error.message })
                    };
                }

                

                

















            // admin actions

            case 'UserList':
                // add code to retrieve the data from table users and return all the data retrieved to the frontennd
                try {
                    
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


        

            

        

        function blockingDelay() {
            
        }





    } catch (error) {
        console.error("Error handling request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: "Server error", details: error.message })
        };

    }

    // log function can come here
};
