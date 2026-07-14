require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
model.generateContent('hello').then(res => console.log('SUCCESS:', res.response.text())).catch(err => console.error('ERROR:', err));
