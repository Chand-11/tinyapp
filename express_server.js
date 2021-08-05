const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
app.set("view engine", "ejs")
const { generateRandomString, getUserByEmail, urlsForUser, findURLInDatabase} = require('./helper.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

const pass =  "purple-monkey-dinosaur";
const hash = bcrypt.hashSync(pass, 10);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hash
    //password: "$2b$10$UaeB4I1Bhx/SmerQvwmDUuP5H7oZTEUXG7lWwpF3TMQmSPEDugzme"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
    //password: "$2b$10$aWEVAbbBMakMGMsn1xwq6eL6MF41Cuf/eHwV3a2Mp/N62whYHDkLC"
  }
 
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: 'aJ48lW' },
  "9sm5xK": { longURL: "http://www.google.com", userId: "aJ48lW" }
};

// load show new ejspage
app.get("/urls/new", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  const templateVars = { urls: urlDatabase, user: user };
  if (!templateVars.user) {
    res.render("login");
  }
  res.render('urls_new', templateVars);
});
//POST Login Route --urls
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email, users);
  let checkPass = bcrypt.compareSync(password, users[user].password);
  if(checkPass) {
    req.session.user_id = user;
    res.redirect(`/urls`);
  } else {
  // invalid password or email
  res.status(403).send("Invalid email or password");
  }
});
// GET LOGIN: 
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('login',templateVars);
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
    if (email=== '' || password === '') {
    res.status(400).send("email or password not valid.");
  }
  //email lookup
  let id = generateRandomString();
  for (const user in users) {
    if (users[user]['email'] === email) {
      res.status(400).send("This email is already registered in our system");
    }
  }
  users[id] = { id: id, email:email, password: hashedPassword};
  req.session.userId = id;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register", templateVars);
});
 

// GET request: redirection of the shortURL into the longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    return res.status(404).send("This short URL is not valid/exist.Check existing short URL");
  } 
  res.redirect(longURL.longURL);
  

});
//Update functionality
app.post('/urls/:shortURL', (req, res) => {

  //console.log("PARAMS", req.params);

  const shortURL = req.params.shortURL;
  const userid = req.session.userId;
  const user = users[userid];
  if (userid === shortURL.userId) {
    //extract new url value from the form => req.body
    const updatedURL = req.body.longURL;
    //update the quote content for that id
    shortURL.longURL = updatedURL;
    res.redirect('/urls');
  } else {
    return res.status(401).send('You can\'t do that! \n');
  }

});

app.get("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete functionality
app.post('/urls/:shortURL/delete', (req, res) => {
  let id = req.session.user_id;

  if (urlDatabase[req.params.shortURL]["userID"] === id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
  else {
    return res.status(401).send('You can not do that! \n');
  }
});


// GET request: redirection of the shortURL into the longURL
app.get("/urls/:shortURL", (req, res) => {
 const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  }; 
  res.render("urls_show", templateVars);
});


// GET request to render urls_index HTML path with data passed in tempVars
app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  console.log(userid);
  const user = users[userid];
  // if user is not logged in: redirect to login
  if (!req.session.user_id) {
    res.send('You must be logged in to see the URLs.');
    res.redirect('/login');
  }

  // if user is not logged in: redirect to login
    const templateVars = { user: user, urls: urlsForUser(userid, urlDatabase), shortURL: req.params.shortURL };

    res.render("urls_index", templateVars);
 
});


app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  // if user has not included http(://) in the longURL, add it to the longURL
  if (!(req.body.longURL).includes('http')) {
    req.body.longURL = 'http://' + req.body.longURL;
  }
  const userid = req.session.user_id;
  urlDatabase[shortUrl] = { longURL: req.body.longURL, userId: userid };
  res.redirect(`/urls/${shortUrl}`);
});


app.get('/404', (req, res) => {
  res.send("The page you are looking for cannot be found.");
});

//Listen on PORT defined in global variable 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 