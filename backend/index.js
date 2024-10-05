import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import cors from 'cors';

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

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('send-location', (data) => {
        socket.emit('receive-location', {id: socket.id, ...data});
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

server.listen(3000, () => {
    console.log('listening on PORT:3000');
});
