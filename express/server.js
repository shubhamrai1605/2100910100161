const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 9876;

app.use(cors());

const windowSize = 10;
let windowCurrState = [];

const apiUrls = {
  'p': 'http://20.244.56.144/test/primes',
  'f': 'http://20.244.56.144/test/fibo',
  'e': 'http://20.244.56.144/test/even',
  'r': 'http://20.244.56.144/test/rand'
};

const authHeader = {
  headers: {
    'Authorization': 'Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIxNDUyNjY5LCJpYXQiOjE3MjE0NTIzNjksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjM2NDU4MzQ0LTVjODMtNGRhYy05ZWI1LWVhMThjMjdlNWJiZSIsInN1YiI6InNodWJoYW1yYWljc0BnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJJbnNvbW5pYSIsImNsaWVudElEIjoiMzY0NTgzNDQtNWM4My00ZGFjLTllYjUtZWExOGMyN2U1YmJlIiwiY2xpZW50U2VjcmV0IjoibkxzWWNKQk5SV2x6a3NhciIsIm93bmVyTmFtZSI6IlNodWJoYW0gUmFpIiwib3duZXJFbWFpbCI6InNodWJoYW1yYWljc0BnbWFpbC5jb20iLCJyb2xsTm8iOiIyMTAwOTEwMTAwMTYxIn0.rrgHr6UdyLzHQ-qb0EyZeNY2G6OVTFvFtt13rL_-2MU"}'
  }
};

const fetchNumbers = async (apiType) => {
  try {
    const response = await axios.get(apiUrls[apiType], { ...authHeader, timeout: 500 });
    console.log('Fetched numbers:', response.data.numbers); // Debug statement
    return response.data.numbers || [];
  } catch (error) {
    console.error('Error fetching numbers:', error);
    return [];
  }
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((acc, num) => acc + num, 0) / numbers.length;
};

app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;
  if (!apiUrls[numberId]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const numbers = await fetchNumbers(numberId);
  console.log('Received numbers:', numbers); // Debug statement

  const windowPrevState = [...windowCurrState];
  for (const number of numbers) {
    if (!windowCurrState.includes(number)) {
      windowCurrState.push(number);
      if (windowCurrState.length > windowSize) {
        windowCurrState.shift();
      }
    }
  }

  console.log('Updated window state:', windowCurrState); // Debug statement

  const avg = calculateAverage(windowCurrState);
  console.log('Calculated average:', avg); // Debug statement

  res.json({
    windowPrevState,
    windowCurrState,
    numbers,
    avg
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});