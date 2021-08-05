const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs")
const bodyParser = require("body-parser"); //statis for(image/sourse)
//app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// load show new ejspage
app.get("/urls/new", (req, res) => {
  
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
  const templateVars = {
    users,
    user: users[req.cookies.user_id]
  };
  

  res.render('urls_new', templateVars);
});
 //post request -Register Functionality

app.post('/register', (req, res) => {
  // check for blank email/passwords entered by user
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("email or password not valid. Please try again");
  }
  const email = req.body.email;
  const password = req.body.password;
  
  //email lookup
  for (const user in users) {
    if (users[user]['email'] === email) {
      res.status(400).send("This email is already registered in our system");
    }
  }
  const id = generateRandomString();
  //console.log(req.body);

  res.cookie('user_id', id);
  users[id] = {id: id , email: req.body.email, password: req.body.password};

  //console.log(users);

  res.redirect('urls');

  
});


app.get('/register', (req, res) => {
const templateVars = {
  users,
  user: users[req.cookies.user_id]
};

res.render("register", templateVars);
});




//Logout route --urls
app.post('/logout', (req, res) => {
  
  res.clearCookie('user_id');
  res.redirect('/login');
});

function finduserid(email){

}

// GET LOGIN: 
app.get('/login', (req, res) => {
  
  const templateVars = {
    users,
    user: users[req.cookies.user_id]
  };

  res.render('login', templateVars);

});

//POST Login Route --urls
app.post('/login', (req, res) => {
  
  let userid;
  
  //check if the email and password exists in users
  for (const user in users) {
    if (users[user]['email'] === req.body.email) {
      if (users[user]['password'] === req.body.password) {
        userid = users[user]['id'];
        res.cookie('user_id', userid);
        res.redirect('/urls');
        return;
      }
    }
  }
  // invalid password or email
  res.status(403).send("Invalid email or password");
});



//Update functionality

app.post('/urls/:shortURL', (req, res) => {

  //console.log("PARAMS", req.params);

  const urlId = req.params.shortURL;

  //console.log(req.body);
  urlDatabase[urlId] = req.body.longURL;

  //console.log(urlDatabase);

  const templatevars = { urlObj: urlDatabase }

  res.redirect(`/urls/${urlId}`);

});



//Delete functionality
app.post('/urls/:shortURL/delete', (req, res) => {


  const urlId = req.params.shortURL;
  //console.log(urlId);

  // delete it from the db
  delete urlDatabase[urlId];

  // redirect to /urls
  res.redirect('/urls');

});


// GET request: redirection of the shortURL into the longURL
app.get('/u/:shortURL', (request, response) => {
  const longURL = urlDatabase[request.params['shortURL']];

  if (!longURL) {
    response.send("This short URL is not valid.");
  } else {
    response.redirect(longURL);
  }

});

// GET request: redirection of the shortURL into the longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});





// GET request to render urls_index HTML path with data passed in tempVars
app.get("/urls", (req, res) => {

  const userid = req.cookies['user_id'];

  //console.log(userid);

  const templateVars = { urls: urlDatabase, user: users[userid] };

  res.render("urls_index", templateVars);
});



app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  // if user has not included http(://) in the longURL, add it to the longURL
  if (!(request.body.longURL).includes('http')) {
    request.body.longURL = 'http://' + request.body.longURL;
  }
  // set the value of the new unique shortURL key to the longURL
  urlDatabase[shortUrl] = req.body.longURL
  // after longURL is entered in the input field, redirect to the respective shortURL page 
  res.redirect(`/urls/${shortUrl}`);
});


//Show homepage - http:localhost:8080
app.post('/', (req, res) => {
  res.render("index");

});



//Listen on PORT defined in global variable 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Sample intial Code to play with basic loading page with express 

//Simple loading Hello!
app.get("/", (req, res) => {
  res.send("Hello!");
});


// viewing urls in json format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Loading HTML code on page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

