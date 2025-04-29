import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

// Lire les données historiques depuis le fichier JSON
const getHistoricalLocations = () => {
    const data = fs.readFileSync('./backend/historical-locations.json', 'utf-8');
    return JSON.parse(data);
};

app.get('/', (req, res) => {
    res.send('BackEnd Server');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Envoyer les données historiques au client
    const historicalData = getHistoricalLocations();
    socket.emit('historical-locations', historicalData);

    socket.on('send-location', (data) => {
        socket.emit('receive-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on PORT:3000');
});
