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

app.get('/', (req, res) => {
    res.send('Hello World');
}
);

const dataFilePath = './data.json';

io.on('connection', (socket) => {
    console.log('a user connected');

    // Emit data from JSON file
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return;
        }
        const jsonData = JSON.parse(data);
        socket.emit('target-data', jsonData);
    });

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
