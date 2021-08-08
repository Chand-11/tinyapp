const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.set("view engine", "ejs")
const { generateRandomString, getUserByEmail, urlsForUser, findURLInDatabase } = require('./helper.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

const pass = "purple-monkey-dinosaur";
const hash = bcrypt.hashSync(pass, 10);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hash
    //password: "$2b$10$UaeB4I1Bhx/SmerQvwmDUuP5H7oZTEUXG7lWwpF3TMQmSPEDugzme"
  },
  "aJ48lW": {
    id: "userRandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
    //password: "$2b$10$aWEVAbbBMakMGMsn1xwq6eL6MF41Cuf/eHwV3a2Mp/N62whYHDkLC"
  }

};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: 'aJ48lW' },
  "9sm5xK": { longURL: "http://www.google.com", userId: "aJ48lW" }
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

// load show new ejspage
app.get("/urls/new", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  const templateVars = { urls: urlDatabase, user: user };
  if (!templateVars.user) {
    return res.status(400).redirect('/login');
  }

  res.render("urls_new", templateVars);
});

//POST Login Route --urls
app.post('/login', (req, res) => {
  if ((req.body.email) === '' || (req.body.password) === '') {
    return res.status(403).send("<html><title>Login Error</title><body>Please enter valid value in username and password field <a href='/login'> Try again </a></body></html>")
  }
  let email = req.body.email;
  let password = req.body.password;
  let userid = getUserByEmail(email, users);
  if (!userid) { return res.status(403).send("<html><title>Login Error</title><body><h3> Register your account first!!<a href='/login'> Try again </a></body></html>") }
  //console.log("userid:" + userid);
  let checkPass = bcrypt.compareSync(password, users[userid].password);
  if (!userid) {
    return res.status(403).send("<html><title>Login Error</title><body><h3>Sorry, Email does not exist. Please try again.<a href='/login'> Try again </a></body></html>");
  } else if (!checkPass) {
    return res.status(403).send("<html><title>Login Error</title><body><h3>Sorry, Password is invalid. Please check your password<a href='/login'> Try again </a></body></html>");
  }
  else {
    req.session.user_id = userid;
    if (!req.session.user_id) {
      return res.send('You must be logged in to see the URLs.');
    }
    res.redirect(`/urls`);
  }

});


// GET LOGIN: 
app.get('/login', (req, res) => {
 // console.log(req.session.user_id + "&&" + users[req.session.user_id]);
  if ((req.session.user_id !== undefined) && (!users[req.session.user_id]!==users[req.session.user_id]) && (req.session.user_id === users[req.session.user_id])) {
    res.redirect('/urls');
  }
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render('login', templateVars);
});


//Logout route --urls
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

//post request -Register Functionality
app.post('/register', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.status(400).send("email or password not valid.");
  }
  //email lookup
  let id = generateRandomString();
  for (const user in users) {
    if (users[user]['email'] === email) {
      res.status(400).send("This email is already registered in our system");
    }
  }
  //console.log("/register- Id:" + id);
  users[id] = { id: id, email: email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { urls: urlDatabase, user: null };
  res.render("register", templateVars);
});


// GET request to render urls_index HTML path with data passed in tempVars
app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
 // if user is not logged in: redirect to login
  if (!user) {
    return res.send('You must be logged in to see the URLs.');
  }
    // console.log("/urls userid:" + userid);
  
    // console.log("URL database:" + urlDatabase);
  // console.log("our urls database:" + Object.keys(urlsForUser(userid, urlDatabase)));

  const templateVars = { user: user, urls: urlsForUser(userid, urlDatabase), shortURL: req.params.shortURL};

  res.render("urls_index", templateVars);

});


// GET request: redirection of the shortURL into the longURL
app.get('/u/:shortURL', (req, res) => {
  let id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if(id !== shortURL)
  {
    return res.send("<html><title> Error </title><body ><h3>This url does belong to you so you can not access it.</h3></body></html>"
    );
  }
  if (!urlDatabase[shortURL]) {
    return res.send("<html><title> Error </title><body ><h3>This url does not exist.</h3></body></html>"
    );
  }
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.status(404).send("<html><title>Invalid URL</title><body><h3>Short URL code does not exist. Check existing short URLs.<a href='/urls'> Try again </a></body></html>");
  }
  res.redirect(longURL);


});

//Delete functionality
app.post('/urls/:shortURL/delete', (req, res) => {
  let id = req.session.user_id;
  if (urlDatabase[req.params.shortURL]["userId"] === id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
  else {
    return res.status(401).send('You can not do that! \n');
  }
});

//Update functionality
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  const userid = req.session.user_id;
  const user = users[userid];
  urlDatabase[shortURL] = { longURL: longURL, userId: userid };
  res.redirect("/urls");
});


// GET request: redirection of the shortURL into the longURL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("<html><title> Error </title><body><h3>This url does not exist.</h3></body></html>");
  }
  console.log("urls/:shortURL:" + shortURL + urlDatabase[req.params.shortURL].longURL);
  const longURL = urlDatabase[shortURL].longURL;

  const userId = req.session.userId;
  user = users[req.session.user_id];

  const templateVars = {
    shortURL,
    longURL,
    user
  };
  if (users[req.session.user_id]) {
    if (urlDatabase[shortURL] && userId === urlDatabase[shortURL].user_id) {
      return res.render("urls_show", templateVars);
    }
    return res.send("<html><title>Access Error</title><body><h3>This url does not belong to you.<a href='/login'> Login </a></body></html>")
  }
  res.send("<html><title>Access Error</title><body><h3>Please login first.<a href='/login'> Login </a></body></html>");
});




app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  // if user has not included http(://) in the longURL, add it to the longURL
  if (!req.session.user_id) {
    return res.redirect('/login');

  }
  if (!(req.body.longURL).includes('http')) {
    req.body.longURL = 'http://' + req.body.longURL;
  }
  const userid = req.session.user_id;
  urlDatabase[shortUrl] = { longURL: req.body.longURL, userId: userid };
  if (shortUrl === userid) {
    return res.redirect(`/urls/${userid}`);
  }
  res.redirect(`/urls`);
});


app.get('/404', (req, res) => {
  res.send("The page you are looking for cannot be found.");
});

//Listen on PORT defined in global variable 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});