document.addEventListener("DOMContentLoaded", function() {
    const socket = io.connect('http://localhost:3000');

    let candidatesMiss = [];
    let candidatesMasters = [];

    // Fetch and render male contestants
    document.getElementById('kings-button').addEventListener('click', function() {
        fetch('/api/male-contestants')
            .then(response => response.json())
            .then(data => {
                candidatesMasters = data.maleContestants;
                renderCandidates(candidatesMasters, document.getElementById("king-candidates"));
                document.getElementById("king-candidates").style.display = 'flex';
                document.getElementById("queen-candidates").style.display = 'none';
            })
            .catch(error => console.error('Error:', error));
    });

    // Fetch and render female contestants
    document.getElementById('queens-button').addEventListener('click', function() {
        fetch('/api/female-contestants')
            .then(response => response.json())
            .then(data => {
                candidatesMiss = data.femaleContestants;
                renderCandidates(candidatesMiss, document.getElementById("queen-candidates"));
                document.getElementById("queen-candidates").style.display = 'flex';
                document.getElementById("king-candidates").style.display = 'none';
            })
            .catch(error => console.error('Error:', error));
    });

    function renderCandidates(candidates, container) {
        container.innerHTML = "";
        candidates.sort((a, b) => b.votes - a.votes);
        candidates.forEach(candidate => {
            const voted = hasVoted(candidate.id, container.id);
            const card = document.createElement("div");
            card.className = "candidate-card";
            card.innerHTML = `
                <div class="profile-image" style="background-image: url(${candidate.img})"></div>
                <h2>${candidate.name}</h2>
                <p>Votes: <span class="vote-count">${candidate.votes}</span></p>
                <button class="vote-button" data-id="${candidate.id}" ${voted ? 'data-voted="true"' : ''}>
                    ${voted ? 'Unvote' : 'Vote'}
                </button>
            `;
            container.appendChild(card);
        });
        container.addEventListener("click", function(event) {
            handleVote(event, candidates, container, container.id === "queen-candidates" ? 'testFemaleContestants.json' : 'testMaleContestants.json');
        });
    }

    function handleVote(event, candidates, container, jsonFilePath) {
        if (event.target.classList.contains("vote-button")) {
            const candidateId = parseInt(event.target.getAttribute("data-id"));
            const candidate = candidates.find(c => c.id === candidateId);
            if (event.target.hasAttribute('data-voted')) {
                candidate.votes -= 1;
                removeVoted(candidate.id, container.id);
                event.target.removeAttribute('data-voted');
                event.target.textContent = 'Vote';
            } else {
                const previousVote = getVoted(container.id);
                if (previousVote) {
                    const previousCandidate = candidates.find(c => c.id === previousVote);
                    previousCandidate.votes -= 1;
                }
                candidate.votes += 1;
                setVoted(candidate.id, container.id);
                event.target.setAttribute('data-voted', 'true');
                event.target.textContent = 'Unvote';
            }
            updateJSONFile(jsonFilePath, candidates)
                .then(() => renderCandidates(candidates, container))
                .catch(error => console.error('Error:', error));
        }
    }

    function hasVoted(candidateId, category) {
        return localStorage.getItem(`voted_${category}`) === String(candidateId);
    }

    function getVoted(category) {
        return localStorage.getItem(`voted_${category}`);
    }

    function setVoted(candidateId, category) {
        localStorage.setItem(`voted_${category}`, candidateId);
    }

    function removeVoted(candidateId, category) {
        localStorage.removeItem(`voted_${category}`);
    }

    async function updateJSONFile(filePath, candidates) {
        try {
            const response = await fetch('/api/update-vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filePath: filePath,
                    candidates: candidates
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    // Listen for updates from the server
    socket.on('update', (data) => {
        if (data.filePath.includes('Male')) {
            candidatesMasters = data.candidates;
            renderCandidates(candidatesMasters, document.getElementById("king-candidates"));
        } else {
            candidatesMiss = data.candidates;
            renderCandidates(candidatesMiss, document.getElementById("queen-candidates"));
        }
    });
});
