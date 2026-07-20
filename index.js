import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, ChannelType } from 'discord.js';
import { createServer } from 'http';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if (command.default.data && command.default.execute) {
    client.commands.set(command.default.data.name, command.default);
  }
}

// Load button handlers
const buttonsPath = path.join(__dirname, 'handlers', 'buttons');
if (fs.existsSync(buttonsPath)) {
  const buttonFiles = fs
    .readdirSync(buttonsPath)
    .filter((file) => file.endsWith('.js'));
  for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = await import(`file://${filePath}`);
    if (button.default.customId && button.default.execute) {
      client.buttons.set(button.default.customId, button.default);
    }
  }
}

// Load modal handlers
const modalsPath = path.join(__dirname, 'handlers', 'modals');
if (fs.existsSync(modalsPath)) {
  const modalFiles = fs
    .readdirSync(modalsPath)
    .filter((file) => file.endsWith('.js'));
  for (const file of modalFiles) {
    const filePath = path.join(modalsPath, file);
    const modal = await import(`file://${filePath}`);
    if (modal.default.customId && modal.default.execute) {
      client.modals.set(modal.default.customId, modal.default);
    }
  }
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketbot')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// Discord Events
client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  client.user.setActivity('/panel - Ticket System', { type: 'WATCHING' });
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, client);
    } else if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (!button) return;
      await button.execute(interaction, client);
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (!modal) return;
      await modal.execute(interaction, client);
    }
  } catch (error) {
    console.error('Interaction Error:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ Errore durante l\'esecuzione!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '❌ Errore durante l\'esecuzione!',
        ephemeral: true,
      });
    }
  }
});

// HTTP Server for Dashboard
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  if (req.url === '/' || req.url === '/index.html') {
    res.statusCode = 200;
    res.end(fs.readFileSync(path.join(__dirname, 'dashboard', 'index.html')));
  } else if (req.url === '/style.css') {
    res.setHeader('Content-Type', 'text/css');
    res.statusCode = 200;
    res.end(fs.readFileSync(path.join(__dirname, 'dashboard', 'style.css')));
  } else if (req.url === '/script.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.statusCode = 200;
    res.end(fs.readFileSync(path.join(__dirname, 'dashboard', 'script.js')));
  } else if (req.url.startsWith('/api/')) {
    handleAPIRequest(req, res, client);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// API Handler
function handleAPIRequest(req, res, client) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const endpoint = url.pathname.slice(5); // Remove '/api/'
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (endpoint === 'tickets' && req.method === 'GET') {
    // Future: fetch tickets from DB
    res.end(JSON.stringify({ tickets: [], totalActive: 0 }));
  } else if (endpoint === 'stats' && req.method === 'GET') {
    res.end(JSON.stringify({
      totalTickets: 0,
      activeTickets: 0,
      closedTickets: 0,
      avgResolutionTime: 0,
    }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}

// Bot Login
client.login(process.env.DISCORD_TOKEN);

// Dashboard Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Dashboard running on http://localhost:${PORT}`);
});

export default client;
