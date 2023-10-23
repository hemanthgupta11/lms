const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the 'cors' package
const mysql = require('mysql2'); // Import the 'mysql2' package

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a connection to your MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gupta@123',
  database: 'dummy',
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
    'SELECT * FROM students WHERE email = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Login failed' });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// Create a route to handle sign-up requests
app.post('/signup', (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      address,
      phoneNumber,
    } = req.body;
  
    // Insert the new user into the 'students' table
    const insertUser = 'INSERT INTO students (first_name, last_name, email, password, date_of_birth, address, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(
      insertUser,
      [firstName, lastName, email, password, dateOfBirth, address, phoneNumber],
      (err, result) => {
        if (err) {
          console.error('Error inserting user: ' + err);
          res.status(500).send('Error signing up');
        } else {
          console.log('User signed up successfully');
          res.status(201).send('Sign-up successful');
        }
      }
    );
  });