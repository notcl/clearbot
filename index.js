require('dotenv').config();
const express = require('express');
const path = require('path');
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./bot/src/handlers/eventHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the terms of service page
app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tos.html'));
});

// Route for the privacy policy PDF
app.get('/assets/privacy.pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'privacy.pdf'));
});

// Route for the coming soon page
app.get('/coming', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'comingsoon.html'));
});

// Route for inviting the bot
app.get('/invite', (req, res) => {
  res.redirect('https://discord.com/oauth2/authorize?client_id=1238539288178593882&scope=bot&permissions=1099511627775');
});

// Route for redirecting to your Discord server
app.get('/discord', (req, res) => {
  res.redirect('https://discord.gg/uYc6xEtPrM');
});

// 404 Route (Page Not Found)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
