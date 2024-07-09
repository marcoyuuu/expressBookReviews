// Import required modules
const express = require("express"); // Express framework for building web applications
const jwt = require("jsonwebtoken"); // JSON Web Token for authentication
let books = require("./booksdb.js"); // Import the books database
const regd_users = express.Router(); // Create a new router object for registered users

let users = []; // Initialize an empty array to store user data

// Function to check if a username is valid (i.e., not already taken)
const isValid = (username) => {
  // Check if the username exists in the users array
  const matchingUsers = users.filter((user) => {
    return user.username === username;
  });

  // Return true if no matching users are found, false otherwise
  return matchingUsers.length === 0;
};

// Function to authenticate a user based on username and password
const authenticatedUser = (username, password) => {
  // Check if the username and password match any entry in the users array
  const authenticatedUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  // Return true if a matching user is found, false otherwise
  return authenticatedUsers.length !== 0;
};

// Route for registered users to log in
regd_users.post("/login", (req, res) => {
  // Extract username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate the user
  if (authenticatedUser(username, password)) {
    // Generate a JSON Web Token for the authenticated user
    let accessToken = jwt.sign(
      {
        data: password, // Include the password in the token payload
      },
      "access", // Secret key for signing the token
      { expiresIn: 60 * 60 } // Token expiration time in seconds
    );

    // Store the token and username in the session
    req.session.authorization = {
      accessToken,
      username,
    };

    // Send a success response
    return res.status(200).send("User successfully logged in");
  } else {
    // Send a response indicating invalid login credentials
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Route to add a book review (accessible only to authenticated users)
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Extract the ISBN and review from the request parameters and body
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  // Get the book from the database using the ISBN
  let validBook = books[isbn];

  // Check if the book exists
  if (validBook) {
    const reviews = validBook.reviews;
    const existingReview = reviews[username];
    reviews[username] = review;

    // Send a response indicating whether the review was added or updated
    if (existingReview) {
      return res.status(200).send("Review successfully updated");
    } else {
      return res.status(200).send("Review successfully added");
    }
  } else {
    // Send a response indicating that the book does not exist
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

// Route to remove a book review (accessible only to authenticated users)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Extract the ISBN from the request parameters
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Get the book from the database using the ISBN
  let validBook = books[isbn];

  // Check if the book exists
  if (validBook) {
    const existingReview = validBook.reviews[username];

    // Remove the review if it exists
    if (existingReview) {
      delete validBook.reviews[username];
    }

    // Send a success response
    return res
      .status(200)
      .send(
        `Review from User, ${username} removed successfully from Book (ISBN: ${isbn}).`
      );
  } else {
    // Send a response indicating that the book does not exist
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

// Export the router and utility functions to be used in other parts of the application
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
