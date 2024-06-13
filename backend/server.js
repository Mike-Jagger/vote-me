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

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to read JSON file
const readJSONFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
};

// Helper function to write JSON file
const writeJSONFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

// Endpoint to get current male contestants
app.get('/api/male-contestants', (req, res) => {
    readJSONFile(path.join(__dirname, 'testMaleContestants.json'))
        .then(data => res.json(data))
        .catch(err => res.status(500).send('Error reading file'));
});

// Endpoint to get current female contestants
app.get('/api/female-contestants', (req, res) => {
    readJSONFile(path.join(__dirname, 'testFemaleContestants.json'))
        .then(data => res.json(data))
        .catch(err => res.status(500).send('Error reading file'));
});

// Endpoint to handle votes
app.post('/api/update-vote', (req, res) => {
    const { candidateId, voteType, containerId } = req.body;
    const filePath = containerId === 'king-candidates' ? 'testMaleContestants.json' : 'testFemaleContestants.json';

    readJSONFile(path.join(__dirname, filePath))
        .then(data => {
            const candidates = containerId === 'king-candidates' ? data.maleContestants : data.femaleContestants;
            const candidate = candidates.find(c => c.id === candidateId);

            if (candidate) {
                if (voteType === 'upvote') {
                    candidate.votes += 1;
                } else if (voteType === 'downvote' && candidate.votes > 0) {
                    candidate.votes -= 1;
                }
            }

            return writeJSONFile(path.join(__dirname, filePath), data)
                .then(() => {
                    io.emit('update', { containerId, candidates });
                    res.send('Votes updated successfully');
                });
        })
        .catch(err => res.status(500).send('Error processing vote'));
});

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
