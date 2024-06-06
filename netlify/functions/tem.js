// Import required modules
const { connectToDatabase } = require('./utils/db');

// Netlify handler function
exports.handler = async function(event, context) {
    try {
        // Connect to the database
        const { db } = await connectToDatabase();

        // Get all users from the users collection
        const usersCollection = db.collection('users');
        const users = await usersCollection.find().toArray();

        // Iterate over each user and update the cookie field with the email
        for (const user of users) {
            const email = user.email;
            if (email) {
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { cookie: email } }
                );
                console.log(`Updated user ${email} with cookie ${email}`);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ msg: "Users updated successfully" })
        };

    } catch (error) {
        console.error("Error updating users: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: "Error updating users", details: error.message })
        };
    }
};
