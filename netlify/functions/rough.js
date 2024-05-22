
const cookie = require('cookie');
const { connectToDatabase } = require('./utils/db'); 


exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    console.log("got in handler");

    const data = JSON.parse(event.body);

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('users');

        switch (data.type) {
            case 'login':
                
                // This would typically involve finding the user and comparing hashed passwords
                const user = await collection.findOne({ email: data.email });
                if (user && user.password === data.password) { // Simplified: ALWAYS hash passwords in production
                  // here we use email temporarily but will switch to hashed email or maybe 

                  //will add logic to store auth token of each and every user

                  const serializedCookie = cookie.serialize('authToken', data.email , {
                    httpOnly: false,
                    path: '/',
                    maxAge: 60 * 60 * 24 // 24 hours
                  });

                  return {
                    statusCode: 200,
                    headers: {
                      'Set-Cookie': serializedCookie ,
                      'Content-Type': 'application/json'


                    },
                    body: JSON.stringify({ message: 'Login successful' })
                  };
                }
                return { statusCode: 403, body: JSON.stringify({ message: 'user id or password is wrong' }) };
                

            case 'signup':
                // Insert new user data
                const insertResult = await collection.insertOne({
                    fullName: data.fullName,
                    email: data.email,
                    password: data.password // Hash this in production!
                });
                return { statusCode: 200, body: JSON.stringify({ message: 'Signup successful', data: insertResult.ops }) };
              

            case 'logout':

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
                    body: JSON.stringify({ message: 'Logout successful' })
                  };

                
            default:
                return { statusCode: 400, body: JSON.stringify({ message: 'Bad Request' }) };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error accessing the database', error: error.message }) };
    }
};




/*

exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters } = event;
  
  switch (queryStringParameters.action) {
    case 'login':
      return loginHandler(event);
    case 'verify':
      return verifyHandler(event);
    case 'logout':
      return logoutHandler(event);
    default:
      return {
        statusCode: 400,
        body: 'Invalid action'
      };
  }
};

function loginHandler(event) {
  const { username, password } = JSON.parse(event.body);
  
  // Here you should add your authentication logic
  if (username === 'user' && password === 'password') {
    const serializedCookie = cookie.serialize('authToken', 'your_secure_token', {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': serializedCookie
      },
      body: JSON.stringify({ message: 'Logged in successfully' })
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: 'Authentication failed' })
  };
}

function verifyHandler(event) {
  const cookies = cookie.parse(event.headers.cookie || '');
  const authToken = cookies.authToken;

  if (authToken === 'your_secure_token') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Verified successfully' })
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: 'Verification failed' })
  };
}

function logoutHandler(event) {
  const serializedCookie = cookie.serialize('authToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: -1 // Delete cookie
  });

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': serializedCookie
    },
    body: JSON.stringify({ message: 'Logged out successfully' })
  };
}
*/