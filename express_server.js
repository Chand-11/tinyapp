const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
//app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
}; 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// route to handle shortURL requests



//Delete functionality
app.post('/urls/:shortURL/delete', (req, res) => {

  console.log("DELETE HERE");
  // extract the id from the url
  // req.params
  const quoteId = req.params.shortURL;
  console.log(quoteId);
  // delete it from the db
  delete urlDatabase[quoteId];

  // redirect to /quotes
  res.redirect('/urls');

});

app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString()
  urlDatabase[shortUrl] = req.body.longURL
  res.redirect(`/urls/${shortUrl}`);


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase.b2xVn2;
  res.redirect(longURL);
});


  
  //console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});