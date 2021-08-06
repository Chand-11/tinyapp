const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

//Helper Functions
const urlsForUser = function(id, urlDatabase) {
  const urls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (email === database[key]["email"]) {
      return key;
    }
  }
};

const findURLInDatabase = function(id, database) {
  for (let url in database) {
    if (url === id) {
      return url;
    }
  }
  return false;
};




module.exports = { generateRandomString, getUserByEmail, urlsForUser,findURLInDatabase};