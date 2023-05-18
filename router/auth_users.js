const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if the username is valid
  return username.trim().length > 0;
}

const authenticatedUser = (username, password) => {
  // Check if username and password match the one we have in records
  const user = users.find((u) => u.username === username && u.password === password);
  return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user is authenticated
  if (authenticatedUser(username, password)) {
    // Generate a JWT token for the user
    const token = jwt.sign({ username }, 'secret_key');

    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add a book review (requires authentication)
regd_users.post("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
  const { review } = req.body; // Retrieve the review from the request body

  // Check if the user is authenticated
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  try {
    const decodedToken = jwt.verify(token, 'secret_key');
    const { username } = decodedToken;

    // Check if the user exists and is authenticated
    if (!authenticatedUser(username)) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the book with matching ISBN in the books object
    const book = Object.values(books).find((b) => b.isbn === isbn);

    if (book) {
      // Update the book's review
      book.review = review;

      return res.status(200).json({ message: "Book review added successfully" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
