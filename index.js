document.addEventListener("DOMContentLoaded", function() {
    const candidatesMiss = [
        { id: 1, name: "Candidate A", votes: 0, img: "path/to/image1.jpg" },
        { id: 2, name: "Candidate B", votes: 0, img: "path/to/image2.jpg" },
        // Add more candidates
    ];

    const candidatesMasters = [
        { id: 1, name: "Candidate X", votes: 0, img: "path/to/image3.jpg" },
        { id: 2, name: "Candidate Y", votes: 0, img: "path/to/image4.jpg" },
        // Add more candidates
    ];

    const missCandidatesContainer = document.getElementById("miss-candidates");
    const mastersCandidatesContainer = document.getElementById("masters-candidates");

    function renderCandidates(candidates, container) {
        container.innerHTML = "";
        candidates.sort((a, b) => b.votes - a.votes);
        candidates.forEach(candidate => {
            const card = document.createElement("div");
            card.className = "candidate-card";
            card.innerHTML = `
                <img src="${candidate.img}" alt="${candidate.name}">
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
