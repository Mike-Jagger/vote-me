document.addEventListener("DOMContentLoaded", function() {
    const serverAddress = 'http://localhost:3000';
    const socket = io.connect(serverAddress);

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
        candidates.sort((a, b) => b.votes - a.votes);
        let rank = 1;
        candidates.forEach(candidate => {
            const voted = hasVoted(candidate.id, container.id);
            const card = document.createElement("div");
            card.className = "candidate-card";
            card.innerHTML = `
                <div class="ranking"><h2>${rank}</h2></div>
                <div class="profile-image" style="background-image: url(${candidate.img})"></div>
                <h2>${candidate.name}</h2>
                <p>Votes: <span class="vote-count">${candidate.votes}</span></p>
            `;
            container.appendChild(card);
            rank += 1;
        });

        container.removeEventListener("click", handleVote);
        container.addEventListener("click", handleVote);
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
    });
});
