const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 5000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Middleware
app.use(express.json());

// Endpoint to fetch news
app.get('/news', async (req, res) => {
    try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?apiKey=${NEWS_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching news');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});