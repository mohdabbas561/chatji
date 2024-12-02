const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Define your Cohere API key here
const COHERE_API_KEY = 't21F09ErMSue6EpA0Gvp1bIOEgowjQUdicyFEzuf'; // Replace with your actual API key

// Route to handle user message
app.post('/message', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    console.error('No message provided in the request body');
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('Received user message:', userMessage);

    // Try using a valid model like 'command-xlarge' or 'large'
    const model = 'command-r-plus-08-2024'; // Change this to a model you have access to

    // Make the request to Cohere API
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: model,
        prompt: userMessage,
        max_tokens: 100,  // Adjust token limit as needed
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
        },
      }
    );

    // Log the response from Cohere API
    console.log('Cohere API response:', response.data);

    // Access the AI response from the 'generations' array
    const aiResponse = response.data.generations[0]?.text.trim();  // Safely accessing the response

    if (!aiResponse) {
      return res.status(500).json({ error: 'AI response is empty' });
    }

    // Return AI response
    return res.json({ answer: aiResponse });

  } catch (err) {
    // Log the error and its details
    console.error('Error with Cohere API:', err.message);

    if (err.response) {
      console.error('Response Data from Cohere API:', err.response.data);
      console.error('Status Code:', err.response.status);
    } else {
      console.error('Error message:', err.message);
    }

    // Check for specific error codes and respond accordingly
    if (err.response && err.response.status === 403) {
      return res.status(403).json({ error: 'Forbidden: API key might be invalid or insufficient permissions.' });
    } else if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: 'Too many requests: Please try again later.' });
    } else {
      return res.status(500).json({ error: 'Internal server error occurred while fetching response from AI.' });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
