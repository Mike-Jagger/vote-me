const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static('public'));

// Endpoint to get current male contestants
app.get('/api/male-contestants', (req, res) => {
    fs.readFile(path.join(__dirname, 'testMaleContestants.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.send(JSON.parse(data));
    });
});

// Endpoint to get current female contestants
app.get('/api/female-contestants', (req, res) => {
    fs.readFile(path.join(__dirname, 'testFemaleContestants.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.send(JSON.parse(data));
    });
});

// Endpoint to update votes
app.post('/api/update-vote', (req, res) => {
    const { filePath, candidates } = req.body;

    fs.writeFile(path.join(__dirname, filePath), JSON.stringify({ candidates }, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing file');
        }

        // Notify all clients about the update
        io.emit('update', { filePath, candidates });

        res.send('Votes updated successfully');
    });
});

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});