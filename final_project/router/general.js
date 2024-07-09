// Import required modules
const express = require("express"); // Express framework for building web applications
let books = require("./booksdb.js"); // Import the books database
let isValid = require("./auth_users.js").isValid; // Import the isValid function for user validation
let users = require("./auth_users.js").users; // Import the users array
const public_users = express.Router(); // Create a new router object

// Route to register a new user
public_users.post("/register", (req, res) => {
  // Extract username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the username is valid (i.e., not already taken)
    if (isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      // Send a success response
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      // Send a response indicating that the user already exists
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Send a response indicating that the registration failed
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 10: Add the code for getting the list of books available in the shop (done in Task 1) using Promise callbacks or async-await with Axios.
// Function to retrieve all books, returning a promise
function retrieveBooks() {
  return new Promise((resolve, reject) => {
    resolve(books); // Resolve the promise with the books data
  });
}

// Route to get the list of books available in the shop
public_users.get("/", function (req, res) {
  // Call the retrieveBooks function and handle the promise
  retrieveBooks().then(
    (books) => res.status(200).send(JSON.stringify(books, null, 4)), // Send the books data as a response
    (error) => res.status(404).send("An error has occurred trying to retrieve all the books") // Handle errors
  );
});

// Task 11: Add the code for getting the book details based on ISBN (done in Task 2) using Promise callbacks or async-await with Axios.
// Function to retrieve a book based on ISBN, returning a promise
function retrieveBookFromISBN(isbn) {
  let book = books[isbn]; // Get the book from the database using the ISBN
  return new Promise((resolve, reject) => {
    if (book) {
      resolve(book); // Resolve the promise with the book data
    } else {
      reject(new Error("The provided book does not exist")); // Reject the promise if the book is not found
    }
  });
}

// Route to get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Extract the ISBN from the request parameters
  // Call the retrieveBookFromISBN function and handle the promise
  retrieveBookFromISBN(isbn).then(
    (book) => res.status(200).send(JSON.stringify(book, null, 4)), // Send the book data as a response
    (err) => res.status(404).send(err.message) // Handle errors
  );
});

// Task 12: Retrieve book details by author using Promise Callbacks or async-await using axios
// Function to retrieve books based on author, returning a promise
function retrieveBookFromAuthor(author) {
  let validBooks = [];
  return new Promise((resolve, reject) => {
    for (let bookISBN in books) {
      const bookAuthor = books[bookISBN].author; // Get the author of the book
      if (bookAuthor === author) {
        validBooks.push(books[bookISBN]); // Add the book to the validBooks array if the author matches
      }
    }
    if (validBooks.length > 0) {
      resolve(validBooks); // Resolve the promise with the validBooks data
    } else {
      reject(new Error("The provided author does not exist")); // Reject the promise if no books are found
    }
  });
}

// Route to get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author; // Extract the author from the request parameters
  // Call the retrieveBookFromAuthor function and handle the promise
  retrieveBookFromAuthor(author).then(
    (books) => res.status(200).send(JSON.stringify(books, null, 4)), // Send the books data as a response
    (err) => res.status(404).send(err.message) // Handle errors
  );
});

// Task 13: Retrieve book details from title using Promise callbacks or async-await using axios
// Function to retrieve books based on title, returning a promise
function retrieveBookFromTitle(title) {
  let validBooks = [];
  return new Promise((resolve, reject) => {
    for (let bookISBN in books) {
      const bookTitle = books[bookISBN].title; // Get the title of the book
      if (bookTitle === title) {
        validBooks.push(books[bookISBN]); // Add the book to the validBooks array if the title matches
      }
    }
    if (validBooks.length > 0) {
      resolve(validBooks); // Resolve the promise with the validBooks data
    } else {
      reject(new Error("The provided book title does not exist")); // Reject the promise if no books are found
    }
  });
}

// Route to get books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title; // Extract the title from the request parameters
  // Call the retrieveBookFromTitle function and handle the promise
  retrieveBookFromTitle(title).then(
    (books) => res.status(200).send(JSON.stringify(books, null, 4)), // Send the books data as a response
    (err) => res.status(404).send(err.message) // Handle errors
  );
});

// Route to get book reviews based on ISBN
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Extract the ISBN from the request parameters
  // Check if the book exists in the database
  if (books[isbn] !== null) {
    res.send(JSON.stringify(books[isbn].reviews, null, 4)); // Send the reviews data as a response
  } else {
    return res.status(404).json({ message: "Provided book does not exist" }); // Handle errors
  }
});

// Export the router to be used in other parts of the application
module.exports.general = public_users;
