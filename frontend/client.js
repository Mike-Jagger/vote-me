document.addEventListener("DOMContentLoaded", function() {
    const serverAddress = 'http://localhost:3000';
    const socket = io.connect(serverAddress);
    let numCalls = 0;

    let candidatesMiss = [];
    let candidatesMasters = [];

    // Fetch and render male contestants
    document.getElementById('kings-button').addEventListener('click', function() {
        fetch(`${serverAddress}/api/male-contestants`)
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
        fetch(`${serverAddress}/api/female-contestants`)
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
        candidates.sort((a, b) => b.id - a.id);
        candidates.forEach(candidate => {
            const voted = hasVoted(candidate.id, container.id);
            const card = document.createElement("div");
            card.className = "candidate-card";
            card.innerHTML = `
                <div class="profile-image" style="background-image: url(${candidate.img})"></div>
                <h2>${candidate.name}</h2>
                <button class="vote-button" data-id="${candidate.id}" ${voted ? 'data-voted="true"' : ''}>
                    ${voted ? 'Unvote' : 'Vote'}
                </button>
            `;
            container.appendChild(card);
        });

        container.removeEventListener("click", handleVote);
        container.addEventListener("click", handleVote);
    }

    async function handleVote(event) {
        numCalls += 1;
        if (event.target.classList.contains("vote-button")) {
            const candidateId = parseInt(event.target.getAttribute("data-id"));
            const voteType = event.target.hasAttribute('data-voted') ? 'downvote' : 'upvote';
            const container = event.target.closest('.candidates');
            const candidates = container.id === "king-candidates" ? candidatesMasters : candidatesMiss;

            const previousVote = getVoted(container.id);
            if (previousVote && previousVote !== candidateId && voteType === 'upvote') {
                if (!confirm("You have already voted for another candidate. Do you want to change your vote?")) {
                    return;
                }
                const previousCandidate = candidates.find(c => c.id === previousVote);
                if (previousCandidate) {
                    previousCandidate.votes -= 1;
                    removeVoted(previousVote, container.id);
                }
            }

            try {
                const response = await fetch(`${serverAddress}/api/update-vote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        candidateId: candidateId,
                        previousCandidateId: previousVote,
                        voteType: voteType,
                        containerId: container.id
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                if (voteType === 'upvote') {
                    setVoted(candidateId, container.id);
                    event.target.setAttribute('data-voted', 'true');
                    event.target.textContent = 'Unvote';
                } else {
                    removeVoted(candidateId, container.id);
                    event.target.removeAttribute('data-voted');
                    event.target.textContent = 'Vote';
                }

                console.log(`response calls ${numCalls}`);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
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

    // Listen for updates from the server
    socket.on('update', (data) => {
        if (data.containerId === 'king-candidates') {
            candidatesMasters = data.candidates;
            renderCandidates(candidatesMasters, document.getElementById("king-candidates"));
        } else {
            candidatesMiss = data.candidates;
            renderCandidates(candidatesMiss, document.getElementById("queen-candidates"));
        }
        console.log(`socket calls ${numCalls}`);
    });
});
