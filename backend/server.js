const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({ origin : true }));
app.use(express.json());

const API_HOST = 'https://instagram-scraper-api2.p.rapidapi.com/v1';
const API_KEY = process.env.RAPID_API_KEY;

const getFollowers = async (usernameOrUrl) => {
  const followers = [];
  
  let pagination_token = "test string";
  let baseUrl = `${API_HOST}/followers?username_or_id_or_url=${usernameOrUrl}` ; 
  let nextPageUrl = baseUrl;

  while (pagination_token) {
    
    try {
      const response = await axios.get(nextPageUrl, {
        headers: {
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        },
      }); 

      if (Array.isArray(response.data.data.items)) {
        followers.push(...response.data.data.items);
      } else {
        followers.push(response.data.data.items);
      }

      //console.log("count : " , count, " : " , response.data.pagination_token );
      pagination_token = response.data.pagination_token ; 
      nextPageUrl = baseUrl.concat("&pagination_token=",pagination_token);
      

    } catch (error) {
      console.error(`Error fetching followers: ${error.message}`);
      break;
    }
  }
  
  return followers;
};


const getFollowing = async (usernameOrUrl) => {
  const following = [];
  let pagination_token = "test string";
  let baseUrl = `${API_HOST}/following?username_or_id_or_url=${usernameOrUrl}` ; 
  let nextPageUrl = baseUrl;

  while (pagination_token) {
    
    try {
      const response = await axios.get(nextPageUrl, {
        headers: {
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
          'x-rapidapi-key': API_KEY,
        },
      }); 

      if (Array.isArray(response.data.data.items)) {
        following.push(...response.data.data.items);
      } else {
        following.push(response.data.data.items);
      }

      //console.log("count : " , count, " : " , response.data.pagination_token );
      pagination_token = response.data.pagination_token ; 
      nextPageUrl = baseUrl.concat("&pagination_token=",pagination_token);
      

    } catch (error) {
      console.error(`Error fetching following: ${error.message}`);
      break;
    }
  }
  return following;
};

const findNonFollowers = (followers, following) => {
  const followerIds = new Set(followers.map((follower) => follower.id));
  const nonFollowers = following.filter((followingUser) => !followerIds.has(followingUser.id));
  return nonFollowers;
};

app.post('/api/non-followers', async (req, res) => {
  const { usernameOrUrl } = req.body;

  try {
    const [followers, following] = await Promise.all([getFollowers(usernameOrUrl), getFollowing(usernameOrUrl)]);
    const nonFollowers = findNonFollowers(followers, following);
    res.json(nonFollowers);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});