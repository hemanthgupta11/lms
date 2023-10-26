const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a connection to your MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gupta@123',
  database: 'lms',
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// Define the login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query the MySQL database to authenticate the user
  db.query(
    'SELECT * FROM User WHERE Username = ? AND Password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
        res.status(200).json({ message: 'Login successful', userType: results[0].UserType });
      } else {
        res.status(401).json({ message: 'Login failed' });
      }
    }
  );
});

// Define the signup route
app.post('/signup', (req, res) => {
  const {
    name,
    address,
    contactInfo,
    username,
    password,
    userType,
    registrationDate,
  } = req.body;

  // Insert a new user into the MySQL database
  db.query(
    'INSERT INTO User (Name, Address, Phone, Username, Password, UserType, RegistrationDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, address, contactInfo, username, password, userType, registrationDate],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.status(201).json({ message: 'Sign-up successful' });
    }
  );
});

// Handle POST request to add a new book
app.post('/books', (req, res) => {
  const { title, author, genre, isbn, year, publisher } = req.body;

  // Check if the author exists in the Author table
  const authorCheckQuery = 'SELECT AuthorID FROM Author WHERE AuthorName = ?';

  db.query(authorCheckQuery, [author], (authorCheckErr, authorCheckResults) => {
    if (authorCheckErr) {
      console.error(authorCheckErr);
      return res.status(500).json({ message: 'Error checking author' });
    }

    // If the author exists, use their AuthorID; otherwise, insert a new author record
    let authorID = authorCheckResults[0]?.AuthorID;

    if (!authorID) {
      // Author doesn't exist, insert a new record
      const insertAuthorQuery = 'INSERT INTO Author (AuthorName) VALUES (?)';

      db.query(insertAuthorQuery, [author], (insertAuthorErr, insertAuthorResults) => {
        if (insertAuthorErr) {
          console.error(insertAuthorErr);
          return res.status(500).json({ message: 'Error adding author' });
        }

        authorID = insertAuthorResults.insertId; // Get the newly inserted AuthorID
        // Now, you can proceed to check the genre
        checkGenre();
      });
    } else {
      // The author exists; you can proceed to check the genre
      checkGenre();
    }

    // Function to check the genre
    function checkGenre() {
      const genreQuery = 'SELECT GenreID FROM Genre WHERE GenreName = ?';

      db.query(genreQuery, [genre], (genreErr, genreResults) => {
        if (genreErr) {
          console.error(genreErr);
          return res.status(500).json({ message: 'Error checking genre' });
        }

        // If the genre doesn't exist, insert a new genre record
        let genreID = genreResults[0]?.GenreID;

        if (!genreID) {
          // Genre doesn't exist, insert a new record
          const insertGenreQuery = 'INSERT INTO Genre (GenreName) VALUES (?)';

          db.query(insertGenreQuery, [genre], (insertGenreErr, insertGenreResults) => {
            if (insertGenreErr) {
              console.error(insertGenreErr);
              return res.status(500).json({ message: 'Error adding genre' });
            }

            genreID = insertGenreResults.insertId; // Get the newly inserted GenreID
            // Now, you can proceed to insert the book with the correct AuthorID and GenreID
            insertBook(authorID, genreID);
          });
        } else {
          // The genre exists; you can proceed to insert the book with the found AuthorID and GenreID
          insertBook(authorID, genreID);
        }
      });
    }
  });

  // Function to insert the book with the correct AuthorID and GenreID
  function insertBook(authorID, genreID) {
    // Insert the book into the database with AuthorID and GenreID
    const insertBookQuery = `
      INSERT INTO Book (Title, ISBN, Year, Publisher, AuthorID, GenreID)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const bookValues = [title, isbn, year, publisher, authorID, genreID];

    db.query(insertBookQuery, bookValues, (bookInsertErr, bookInsertResults) => {
      if (bookInsertErr) {
        console.error(bookInsertErr);
        return res.status(500).json({ message: 'Error adding book' });
      }

      return res.status(201).json({ message: 'Book added successfully' });
    });
  }
});

// Handle GET request to retrieve the list of books
app.get('/books', (req, res) => {
  // Query to select all books
  const sql = 'SELECT * FROM Book';

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching book list' });
    }

    return res.status(200).json(results);
  });
});


// Handle DELETE request to delete a book by BookID
app.delete('/books/:bookId', (req, res) => {
  const bookId = req.params.bookId;

  // Delete the book from the database
  const sql = 'DELETE FROM Book WHERE BookID = ?';

  db.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting book' });
    }

    return res.status(200).json({ message: 'Book deleted successfully' });
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
