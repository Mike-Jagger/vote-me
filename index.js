document.addEventListener("DOMContentLoaded", function() {
    let candidatesMiss = [];
    let candidatesMasters = [];

    // Fetch female contestants on page load
    fetch('./testFemaleContestants.json')
        .then(response => response.json())
        .then(data => {
            candidatesMiss = data.femaleContestants;
            document.getElementById("queens-button").addEventListener("click", function() {
                renderCandidates(candidatesMiss, document.getElementById("queen-candidates"));
                document.getElementById("queen-candidates").style.display = 'block';
                document.getElementById("king-candidates").style.display = 'none';
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Fetch male contestants on page load
    fetch('./testMaleContestants.json')
        .then(response => response.json())
        .then(data => {
            candidatesMasters = data.maleContestants;
            document.getElementById("kings-button").addEventListener("click", function() {
                renderCandidates(candidatesMasters, document.getElementById("king-candidates"));
                document.getElementById("king-candidates").style.display = 'block';
                document.getElementById("queen-candidates").style.display = 'none';
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });

    function renderCandidates(candidates, container) {
        container.innerHTML = "";
        candidates.sort((a, b) => b.votes - a.votes);
        candidates.forEach(candidate => {
            const card = document.createElement("div");
            card.className = "candidate-card";
            card.innerHTML = `
                <div class="profile-image" style="background-image: url(${candidate.img})"></div>
                <h2>${candidate.name}</h2>
                <p>Votes: <span class="vote-count">${candidate.votes}</span></p>
                <button class="vote-button" data-id="${candidate.id}" ${hasVoted(candidate.id) ? 'disabled' : ''}>Vote</button>
            `;
            container.appendChild(card);
        });
        container.addEventListener("click", function(event) {
            handleVote(event, candidates, container, './testFemaleContestants.json');
        });
    }

    function handleVote(event, candidates, container, jsonFilePath) {
        if (event.target.classList.contains("vote-button")) {
            const candidateId = parseInt(event.target.getAttribute("data-id"));
            const candidate = candidates.find(c => c.id === candidateId);
            candidate.votes += 1;
            setVoted(candidateId);
            updateJSONFile(jsonFilePath, candidates)
                .then(() => renderCandidates(candidates, container))
                .catch(error => console.error('Error:', error));
        }
    }

    function hasVoted(candidateId) {
        return localStorage.getItem(`voted_${candidateId}`) === 'true';
    }

    function setVoted(candidateId) {
        localStorage.setItem(`voted_${candidateId}`, 'true');
    }

    async function updateJSONFile(filePath, candidates) {
        try {
            const response = await fetch(filePath, {
                method: 'PUT', // or 'POST', depending on your server's API
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ candidates })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
});
