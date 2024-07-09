// Import required modules
const express = require("express"); // Express framework for building web applications
const jwt = require("jsonwebtoken"); // JSON Web Token for authentication
const session = require("express-session"); // Express session middleware for managing sessions

// Import routes from external files
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

// Create an instance of the Express application
const app = express();

// Middleware to parse JSON bodies from HTTP requests
app.use(express.json());

// Middleware to set up session handling on the /customer path
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer", // Secret used to sign the session ID cookie
    resave: true, // Forces the session to be saved back to the store, even if it was never modified during the request
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
  })
);

// Middleware for authentication on paths matching /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the session contains an authorization object
  if (req.session.authorization) {
    // Retrieve the token from the session
    let token = req.session.authorization["accessToken"];
    // Verify the token
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        // If token is valid, attach the user information to the request object
        req.user = user;
        // Proceed to the next middleware or route handler
        next();
      } else {
        // If token verification fails, send a 403 Forbidden response
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    // If no authorization object is found in the session, send a 403 Forbidden response
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Define the port number for the server
const PORT = 5000;

// Use the customer routes for requests starting with /customer
app.use("/customer", customer_routes);
// Use the general routes for all other requests
app.use("/", genl_routes);

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
