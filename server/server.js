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
  password: '',
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

// Handle GET request to retrieve the combined list with Books,Author, Genre.
app.get('/books-list', (req, res) => {
  const { sortby, ascending } = req.query;

  // Validate the sorting column and sorting order
  const validSortColumns = ['BookID', 'Title', 'AuthorName', 'Year', 'Publisher', 'GenreID', 'ISBN', 'Status'];
  const validSortingOrders = ['asc', 'desc'];

  if (!validSortColumns.includes(sortby) || !validSortingOrders.includes(ascending)) {
    return res.status(400).json({ error: 'Invalid sorting column or order' });
  }

  // Build the SQL query with dynamic sorting and order
  const sql = `SELECT b.BookID, b.Title, a.AuthorName, b.Year, b.Publisher, b.GenreID, b.ISBN, b.Status
               FROM Book b
               INNER JOIN Author a ON b.AuthorID = a.AuthorID
               ORDER BY ${sortby} ${ascending}`; // Use the provided sorting column and order

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching book list' });
    }

    return res.status(200).json(results);
  });
});

// Handle GET request to retrieve the combined reserved book list with Books,Author, Genre.
app.get('/reserved-books', (req, res) => {
  const { sortby, ascending, search, userID } = req.query;

  // Validate the sorting column and sorting order
  const validSortColumns = ['BookID', 'Title', 'AuthorName', 'Year', 'Publisher', 'GenreID', 'ISBN', 'Status'];
  const validSortingOrders = ['asc', 'desc'];

  if (!validSortColumns.includes(sortby) || !validSortingOrders.includes(ascending)) {
    return res.status(400).json({ error: 'Invalid sorting column or order' });
  }

  // Build the SQL query with dynamic sorting, order, and search
  const sql = `SELECT b.BookID, b.Title, a.AuthorName, b.Year, b.Publisher, b.GenreID, b.ISBN, b.Status
               FROM ReservedBook rb
               INNER JOIN Book b ON rb.BookID = b.BookID
               INNER JOIN Author a ON b.AuthorID = a.AuthorID
               WHERE rb.UserID = ? 
               ORDER BY ${sortby} ${ascending}`; // Use the provided sorting column, order, and filter by UserID

  db.query(sql, [userID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching reserved books' });
    }

    return res.status(200).json(results);
  });
});





// Handle DELETE request to delete a book by BookID
app.delete('/books/:bookId', (req, res) => {
  const bookId = req.params.bookId;
  const { sortby, ascending } = req.query;

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


// Handle POST request to add a new transaction
app.post('/borrow', (req, res) => {
  const { bookId, userID, borrowDate, dueDate, fineAmount } = req.body;

  // Insert a new transaction into the Transaction table
  const insertTransactionQuery = `
    INSERT INTO Transaction (BookID, UserID, BorrowDate, DueDate, FineAmount, Status)
    VALUES (?, ?, ?, ?, ?, 'Borrowed')
  `;

  const transactionValues = [bookId, userID, borrowDate, dueDate, fineAmount];

  db.query(insertTransactionQuery, transactionValues, (transactionInsertErr) => {
    if (transactionInsertErr) {
      console.error(transactionInsertErr);
      return res.status(500).json({ message: 'Error adding transaction' });
    }

    // Update the status of the book to 'Checked Out' in the Book table
    const updateBookStatusQuery = 'UPDATE Book SET Status = ? WHERE BookID = ?';
    const updateBookStatusValues = ['Checked Out', bookId];

    db.query(updateBookStatusQuery, updateBookStatusValues, (updateBookStatusErr) => {
      if (updateBookStatusErr) {
        console.error(updateBookStatusErr);
        return res.status(500).json({ message: 'Error updating book status' });
      }

      return res.status(201).json({ message: 'Book borrowed successfully' });
    });
  });
});

// Handle GET request to retrieve all borrowed books for a specific user
app.get('/borrowed-books', (req, res) => {
  const userID = req.query.userID;
  const { sortby, ascending } = req.query;

  // Define the SQL query for sorting based on the provided parameters
  let sql = `
    SELECT b.BookID, b.Title, a.AuthorName, b.Year, b.Publisher, b.GenreID, b.ISBN, t.BorrowDate, t.DueDate, t.FineAmount
    FROM Transaction t
    INNER JOIN Book b ON t.BookID = b.BookID
    INNER JOIN Author a ON b.AuthorID = a.AuthorID
    WHERE t.UserID = ?
  `;

  // Check for sorting parameters and adjust the SQL query accordingly
  if (sortby && (sortby === 'BookID' || sortby === 'Title' || sortby === 'BorrowDate' || sortby === 'DueDate')) {
    sql += ` ORDER BY ${sortby} ${ascending === 'asc' ? 'ASC' : 'DESC'}`;
  } else {
    // Default sorting if invalid or no sorting parameter is provided
    sql += ' ORDER BY BorrowDate ASC';
  }

  db.query(sql, [userID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching borrowed books' });
    }

    return res.status(200).json(results);
  });
});

// Handle GET request to retrieve the list of users
app.get('/all-users', (req, res) => {
  // Query to select all users
  const sql = 'SELECT * FROM User';

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching user list' });
    }

    return res.status(200).json(results);
  });
});

// Handle DELETE request to delete a user
app.delete('/delete-user/:userId', (req, res) => {
  const userId = req.params.userId;

  // SQL query to delete the user
  const sql = 'DELETE FROM User WHERE UserID = ?';

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting user' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  });
});

// Handle GET request to retrieve the list of overdue books
app.get('/overdue-books', (req, res) => {
  // Extract query parameters for sorting, filtering, and user ID
  const { sortby, ascending } = req.query;

  // Define the columns you want to select
  const overdueBooksColumns = [
    'b.BookID',
    'b.Title',
    'a.AuthorName AS AuthorName',
    'b.ISBN',
    't.BorrowDate',
    't.DueDate',
    't.FineAmount',
    't.ReturnDate'
  ];

  // Create a SQL query based on the provided parameters
  const sql = `
    SELECT ${overdueBooksColumns.join(', ')}
    FROM Book AS b
    INNER JOIN Transaction AS t ON b.BookID = t.BookID
    INNER JOIN Author AS a ON b.AuthorID = a.AuthorID
    WHERE t.Status = 'Borrowed'
    AND t.DueDate < CURDATE()
    ORDER BY ${sortby} ${ascending === 'asc' ? 'ASC' : 'DESC'}
  `;

  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching overdue books' });
    }

    return res.status(200).json(results);
  });
});

// Handle GET request to retrieve the list of available books
app.get('/available-books', (req, res) => {
  // Extract query parameters for sorting and filtering
  const { sortby, ascending } = req.query;

  // Create a SQL query based on the provided parameters
  const sql = `
    SELECT *
    FROM Book
    WHERE Status = 'Available'
    ORDER BY ${sortby} ${ascending === 'asc' ? 'ASC' : 'DESC'}
  `;

  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching available books' });
    }

    return res.status(200).json(results);
  });
});

// Add a new route for the /borrowed-books-data API
app.get('/borrowed-books-data', (req, res) => {
  // Calculate the date 30 days ago from today
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Query the database to get the count of books borrowed for each day in the last 30 days
  const sql = `
    SELECT
      DATE(BorrowDate) AS BorrowDate,
      COUNT(*) AS BooksBorrowed
    FROM
      Transaction
    WHERE
      DATE(BorrowDate) >= DATE(?)
    GROUP BY
      DATE(BorrowDate)
    ORDER BY
      DATE(BorrowDate);
  `;

  db.query(sql, [thirtyDaysAgo], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching borrowed books data' });
    }

    // Send the retrieved data as JSON
    return res.status(200).json(results);
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
