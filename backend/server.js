const express = require('express');
const fs = require('fs').promises;
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
const readJSONFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        throw err;
    }
};

// Helper function to write JSON file
const writeJSONFile = async (filePath, data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        throw err;
    }
};

// Endpoint to get current male contestants
app.get('/api/male-contestants', async (req, res) => {
    try {
        const data = await readJSONFile(path.join(__dirname, 'testMaleContestants.json'));
        res.json(data);
    } catch (err) {
        res.status(500).send('Error reading file');
    }
});

// Endpoint to get current female contestants
app.get('/api/female-contestants', async (req, res) => {
    try {
        const data = await readJSONFile(path.join(__dirname, 'testFemaleContestants.json'));
        res.json(data);
    } catch (err) {
        res.status(500).send('Error reading file');
    }
});

// Endpoint to handle votes
app.post('/api/update-vote', async (req, res) => {
    const { candidateId, voteType, containerId } = req.body;
    const filePath = containerId === 'king-candidates' ? 'testMaleContestants.json' : 'testFemaleContestants.json';

    try {
        const data = await readJSONFile(path.join(__dirname, filePath));
        const candidates = containerId === 'king-candidates' ? data.maleContestants : data.femaleContestants;
        const candidate = candidates.find(c => c.id === candidateId);

        if (candidate) {
            if (voteType === 'upvote') {
                candidate.votes += 1;
            } else if (voteType === 'downvote' && candidate.votes > 0) {
                candidate.votes -= 1;
            }
        }

        await writeJSONFile(path.join(__dirname, filePath), data);

        res.send('Votes updated successfully');

        setTimeout( () => {
            io.emit('update', { containerId, candidates });
        }, 3000)

    } catch (err) {
        res.status(500).send('Error processing vote');
    }
});

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
