const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Validate the username
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  // Add the user to the list
  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const bookList = JSON.stringify(books, null, 2);
  return res.status(200).send(bookList);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
  const book = Object.values(books).find((b) => b.isbn === isbn); // Find the book with matching ISBN in the books object

  if (book) {
    return res.status(200).json(book); // Return the book details as the response
  } else {
    return res.status(404).json({ message: "Book not found" }); // Return an error if book is not found
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; // Retrieve the author from the request parameters
  const matchedBooks = Object.values(books).filter((book) => book.author === author); // Filter the books by the matching author

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks); // Return the matched books as the response
  } else {
    return res.status(404).json({ message: "Books not found for the given author" }); // Return an error if no books are found
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title; // Retrieve the title from the request parameters
  const matchedBooks = Object.values(books).filter((book) => book.title.toLowerCase().includes(title.toLowerCase())); // Filter the books by the matching title

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks); // Return the matched books as the response
  } else {
    return res.status(404).json({ message: "Books not found for the given title" }); // Return an error if no books are found
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
  const book = books[isbn]; // Find the book with matching ISBN in the books object

  if (book) {
    const reviews = book.reviews; // Get the reviews for the book
    return res.status(200).json(reviews); // Return the reviews as the response
  } else {
    return res.status(404).json({ message: "Book not found" }); // Return an error if book is not found
  }
});

module.exports.general = public_users;
