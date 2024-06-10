document.addEventListener("DOMContentLoaded", function() {
    var candidatesMiss;
    var candidatesMasters;

    // Fetch female contestants on page load
    fetch('./testFemaleContestants.json')
        .then(response => response.json())
        .then(data => {
            candidatesMiss = data.femaleContestants;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Fetch Male contestants on page load
    fetch('./testMaleContestants.json')
        .then(response => response.json())
        .then(data => {
          candidatesMasters = data.maleContestants;
        })
        .catch(error => {
          console.error('Error:', error);
        });

    var missCandidatesContainer = document.getElementById("queen-candidates");
    var mastersCandidatesContainer = document.getElementById("king-candidates");

    function renderCandidates(candidates, container) {
        console.log(candidates)
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
    }

    function handleVote(event, candidates, container) {
        if (event.target.classList.contains("vote-button")) {
            const candidateId = parseInt(event.target.getAttribute("data-id"));
            const candidate = candidates.find(c => c.id === candidateId);
            candidate.votes += 1;
            setVoted(candidateId);
            renderCandidates(candidates, container);
        }
    }

    function hasVoted(candidateId) {
        return localStorage.getItem(`voted_${candidateId}`) === 'true';
    }

    function setVoted(candidateId) {
        localStorage.setItem(`voted_${candidateId}`, 'true');
    }

    if (missCandidatesContainer) {
        console.log(candidatesMiss);
        renderCandidates(candidatesMiss, missCandidatesContainer);
        missCandidatesContainer.addEventListener("click", function(event) {
            handleVote(event, candidatesMiss, missCandidatesContainer);
        });
    }

    if (mastersCandidatesContainer) {
        renderCandidates(candidatesMasters, mastersCandidatesContainer);
        mastersCandidatesContainer.addEventListener("click", function(event) {
            handleVote(event, candidatesMasters, mastersCandidatesContainer);
        });
    }
});
