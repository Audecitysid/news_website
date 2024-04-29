const { connectToDatabase } = require('./utils/db'); // Ensure this path matches your file structure

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const data = JSON.parse(event.body);

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('users');

        switch (data.type) {
            case 'login':
                // Perform login logic, e.g., verify user
                // This would typically involve finding the user and comparing hashed passwords
                const user = await collection.findOne({ email: data.email });
                if (user && user.password === data.password) { // Simplified: ALWAYS hash passwords in production
                    return { statusCode: 200, body: JSON.stringify({ message: 'Login successful' }) };
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

            default:
                return { statusCode: 400, body: JSON.stringify({ message: 'Bad Request' }) };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Error accessing the database', error: error.message }) };
    }
};
