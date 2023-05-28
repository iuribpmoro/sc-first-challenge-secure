const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuid = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

function isAuthenticated(req, res, next) {
    const whitelist = ['/login', '/'];
    if (whitelist.includes(req.path)) {
        next();
    } else if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

app.use(isAuthenticated);

// Insecure global variable to store user data (for demonstration purposes only)
let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', password: 'password1' },
    { id: 2, name: 'Bob', email: 'bob@example.com', password: 'password2' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', password: 'password3' },
];

for (const user of users) {
    user.id = uuid.v4();
}

let comments = [
    'This is a comment',
];

app.post('/comments', (req, res) => {
    const comment = req.body.comment;
    if (!/^[a-zA-Z0-9 ]+$/.test(comment)) {
        res.status(400).send('Invalid comment');
        return;
    } else if (comment.length > 100) {
        res.status(400).send('Comment too long');
        return;
    } else if (comment.length < 1) {
        res.status(400).send('Comment too short');
        return;
    } else {
        comments.push(comment);
        res.redirect('/user/' + req.session.user.id);
    }
});


app.get('/', (req, res) => {
    const name = req.query.name || '';
    res.send(`
    <h1>Welcome to the Store</h1>
    <form action="/login" method="post">
      <label for="email">Email:</label>
      <input type="email" name="email" id="email" required>
      <label for="password">Password:</label>
      <input type="password" name="password" id="password" required>
      <button type="submit">Login</button>
    </form>
  `);
});

// User login route
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = users.find((user) => user.email === email && user.password === password);
    if (user) {
        req.session.user = user;
        res.redirect(`/user/${user.id}`);
    } else {
        res.send('Invalid credentials. Please try again.');
    }
});


function htmlEncode(str) {
    return str.replace(/[\u00A0-\u9999<>&]/gim, function (i) {
        return '&#' + i.charCodeAt(0) + ';';
    });
}

// User profile route
app.get('/user/:id', (req, res) => {
    const id = req.params.id;
    const user = req.session.user;
    // console.log(users);
    if (user && user.id === id) {
        res.send(`
        <h1>User Profile</h1>
        <p>Name: ${user.name}</p>
        <p>Email: ${user.email}</p>
        <h2>Write a comment:</h2>
        <input type="text" name="comment" id="comment">
        <button type="button" onclick="writeComment()">Send</button>
        <h2>Comments:</h2>
        <ul>
            ${comments.map((comment) => `<li>${htmlEncode(comment)}</li>`).join('')}
        </ul>
        <script>
            function writeComment() {
                const comment = document.getElementById('comment').value;
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/comments');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send('comment=' + comment);

                // If doesnt return 200, show error
                xhr.onload = function() {
                    if (xhr.status !== 200) {
                        alert('Error: ' + xhr.responseText);
                    }
                };

                // After submit, reloads page to show the new comment
                window.location.reload();
            }
        </script>
    `);
    } else {
        res.status(404).send('User not found');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
