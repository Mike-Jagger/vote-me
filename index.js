document.addEventListener("DOMContentLoaded", function() {
    const candidatesMiss = [
        { id: 3, name: "Faridaa", votes: 0, img: "./img/Faridaa.jpg"},
        { id: 4, name: "Ifeoma", votes: 0, img: "./img/Ifeoma.jpg"},
        { id: 5, name: "Bimbo", votes: 0, img: "./img/Bimbo.jpg"},
        { id: 6, name: "Daniela", votes: 0, img: "./img/Daniela.jpg"},
        { id: 7, name: "Aniela", votes: 0, img: "./img/Aniela.jpg"},
        { id: 8, name: "Jennifer", votes: 0, img: "./img/Jennifer.jpg"},
        { id: 9, name: "Emma", votes: 0, img: "./img/Emma.jpg"},
        { id: 10, name: "Fatima", votes: 0, img: "./img/Fatima.jpg"},
        { id: 11, name: "Mercy", votes: 0, img: "./img/Mercy.jpg"},
        { id: 12, name: "Wisdom", votes: 0, img: "./img/Wisdom.jpg"},
        { id: 13, name: "Adaeze", votes: 0, img: "./img/Adaeze.jpg"},
        { id: 14, name: "Christabel", votes: 0, img: "./img/Christabel.jpg"},
        { id: 3, name: "Khadija", votes: 0, img: "./img/Khadija.jpg"}
    ];

    const candidatesMasters = [
        { id: 3, name: "Wisdom", votes: 0, img: "./img/Wisdom.jpg"},
        { id: 4, name: "IK", votes: 0, img: "./img/IK.jpg"},
        { id: 5, name: "Abdul", votes: 0, img: "./img/Abdul.jpg"},
        { id: 6, name: "Abraham", votes: 0, img: "./img/Abraham.jpg"},
        { id: 7, name: "Daniel", votes: 0, img: "./img/Daniel.jpg"},
        { id: 8, name: "Fareed", votes: 0, img: "./img/Fareed.jpg"},
        { id: 10, name: "David", votes: 0, img: "./img/David.jpg"},
        { id: 11, name: "Henry", votes: 0, img: "./img/Henry.jpg"},
        { id: 12, name: "Amir", votes: 0, img: "./img/Amir.jpg"},
        { id: 13, name: "Joshua", votes: 0, img: "./img/Joshua.jpg"},
        { id: 14, name: "Chibunna", votes: 0, img: "./img/Chibunna.jpg"},
        { id: 15, name: "Alvin", votes: 0, img: "./img/Alvin.jpg"},
        { id: 16, name: "James", votes: 0, img: "./img/James.jpg"},
        { id: 17, name: "Miracle", votes: 0, img: "./img/Miracle.jpg"}
    ];

    const missCandidatesContainer = document.getElementById("queen-candidates");
    const mastersCandidatesContainer = document.getElementById("king-candidates");

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
