// ================================================
// MONITEUR DE RESSOURCES - CODE COMPLET FONCTIONNEL
// ================================================

// ---- CONFIGURATION ----
let INTERVALLE_MS = 2000;
let intervalleId = null;
let estEnPause = false;
const MAX_POINTS = 20;

// ---- HISTORIQUES ----
const historiqueRAM = [];
const historiqueCPU = [];
const historiqueLabels = [];

// ---- SIMULATION RAM ----
let valeurRAMSimulee = 35;
let tendanceRAM = 1;
let derniereValeurRAM = 0;
let compteurRAMFixe = 0;

// ---- SIMULATION CPU ----
let valeurCPUSimulee = 20;

// ---- SIMULATION MÉMOIRE RÉELLE ----
let valeurMemoireSimulee = 45;
let tendanceMemoire = 1;

// ---- SIMULATION DÉBIT ----
let valeurDebitSimulee = 15;
let tendanceDebit = 1;

// ---- GRAPHIQUES ----
let graphRAM = null;
let graphCPU = null;
let graphGlobal = null;
let graphDonutRAM = null;
let graphDonutCPU = null;


// ================================================
// INITIALISATION DES GRAPHIQUES
// ================================================
function initialiserGraphiques() {
    var optionsLigne = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        scales: {
            x: { ticks: { color: '#555', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { min: 0, max: 100, ticks: { color: '#555', callback: function(val) { return val + '%'; } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a2e', borderColor: '#00d4ff', borderWidth: 1 } }
    };

    graphRAM = new Chart(document.getElementById('graphique-ram'), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.08)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#00d4ff' }] },
        options: optionsLigne
    });

    graphCPU = new Chart(document.getElementById('graphique-cpu'), {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#ff6b35', backgroundColor: 'rgba(255,107,53,0.08)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#ff6b35' }] },
        options: JSON.parse(JSON.stringify(optionsLigne))
    });

    graphGlobal = new Chart(document.getElementById('graphique-global'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'RAM %', data: [], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.05)', fill: true, tension: 0.4 },
            { label: 'CPU %', data: [], borderColor: '#ff6b35', backgroundColor: 'rgba(255,107,53,0.05)', fill: true, tension: 0.4 }
        ]},
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#888' } } },
            scales: { x: { ticks: { color: '#555' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { min: 0, max: 100, ticks: { color: '#555', callback: function(v){return v+'%';} }, grid: { color: 'rgba(255,255,255,0.05)' } } }
        }
    });

    graphDonutRAM = new Chart(document.getElementById('graphique-donut-ram'), {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 100], backgroundColor: ['#00d4ff', 'rgba(255,255,255,0.05)'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });

    graphDonutCPU = new Chart(document.getElementById('graphique-donut-cpu'), {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 100], backgroundColor: ['#ff6b35', 'rgba(255,255,255,0.05)'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });

    ajouterJournal('fa-chart-pie', 'Graphiques initialisés', 'succes');
}


// ================================================
// HORLOGE
// ================================================
function mettreAJourHorloge() {
    var d = new Date();
    document.getElementById('texte-date').textContent = d.toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}


// ================================================
// RAM
// ================================================
function mettreAJourRAM() {
    var pourcentRAM = simulerRAM();

    var ramTotale = 8192;
    var utiliseMB = Math.round((pourcentRAM / 100) * ramTotale);

    document.getElementById('ram-valeur').textContent = pourcentRAM + '%';
    document.getElementById('ram-utilise').textContent = 'Utilisé: ' + utiliseMB + ' MB';
    document.getElementById('ram-total').textContent = 'Total: ' + ramTotale + ' MB';
    document.getElementById('mini-barre-ram').style.width = pourcentRAM + '%';

    var barre = document.getElementById('mini-barre-ram');
    if (pourcentRAM < 40) {
        barre.style.background = 'linear-gradient(90deg, #00ff88, #00d4ff)';
    } else if (pourcentRAM < 70) {
        barre.style.background = 'linear-gradient(90deg, #ffd700, #ff6b35)';
    } else {
        barre.style.background = 'linear-gradient(90deg, #ff0080, #ff0000)';
    }

    if (pourcentRAM > 80) {
        ajouterJournal('fa-triangle-exclamation', 'RAM critique : ' + pourcentRAM + '%', 'danger');
    }

    return pourcentRAM;
}

function simulerRAM() {
    var changement = (Math.random() * 6) - 3;
    valeurRAMSimulee = valeurRAMSimulee + changement + (tendanceRAM * Math.random() * 2);

    if (Math.random() < 0.1) tendanceRAM = tendanceRAM * -1;
    if (valeurRAMSimulee > 85) { valeurRAMSimulee = 85; tendanceRAM = -1; }
    if (valeurRAMSimulee < 20) { valeurRAMSimulee = 20; tendanceRAM = 1; }

    if (Math.random() < 0.05) {
        var pic = Math.random() * 15 + 5;
        valeurRAMSimulee = valeurRAMSimulee + pic;
        ajouterJournal('fa-arrow-trend-up', 'Pic RAM : +' + pic.toFixed(0) + '%', 'alerte');
    }

    if (Math.random() < 0.03) {
        var lib = Math.random() * 12 + 3;
        valeurRAMSimulee = valeurRAMSimulee - lib;
        ajouterJournal('fa-trash-can', 'Mémoire libérée : -' + lib.toFixed(0) + '%', 'succes');
    }

    return Math.round(Math.max(10, Math.min(95, valeurRAMSimulee)));
}


// ================================================
// CPU
// ================================================
function mettreAJourCPU() {
    var coeurs = navigator.hardwareConcurrency || 4;
    document.getElementById('cpu-coeurs').textContent = 'Coeurs: ' + coeurs;

    var tempsActif = Math.floor(performance.now() / 1000);
    var min = Math.floor(tempsActif / 60);
    var sec = tempsActif % 60;
    document.getElementById('cpu-temps').textContent = 'Actif: ' + min + 'm' + sec + 's';

    var usage = simulerCPU();
    document.getElementById('cpu-valeur').textContent = usage + '%';
    document.getElementById('mini-barre-cpu').style.width = usage + '%';

    if (usage > 70) {
        ajouterJournal('fa-triangle-exclamation', 'CPU élevé : ' + usage + '%', 'alerte');
    }

    return usage;
}

function simulerCPU() {
    var changement = (Math.random() * 10) - 5;
    valeurCPUSimulee = valeurCPUSimulee + changement;
    valeurCPUSimulee = Math.max(5, Math.min(80, valeurCPUSimulee));

    if (Math.random() < 0.08) {
        var pic = Math.random() * 30;
        valeurCPUSimulee = valeurCPUSimulee + pic;
        ajouterJournal('fa-bolt', 'Pic CPU : +' + pic.toFixed(0) + '%', 'alerte');
    }

    if (valeurCPUSimulee > 70) {
        valeurCPUSimulee = valeurCPUSimulee - Math.random() * 15;
    }

    return Math.round(Math.max(2, Math.min(95, valeurCPUSimulee)));
}


// ================================================
// MÉMOIRE TEMPS RÉEL
// ================================================
function mettreAJourMemoireReelle() {
    var changement = (Math.random() * 8) - 4;
    valeurMemoireSimulee = valeurMemoireSimulee + changement + (tendanceMemoire * Math.random() * 2);

    if (Math.random() < 0.12) tendanceMemoire = tendanceMemoire * -1;
    if (valeurMemoireSimulee > 90) { valeurMemoireSimulee = 90; tendanceMemoire = -1; }
    if (valeurMemoireSimulee < 25) { valeurMemoireSimulee = 25; tendanceMemoire = 1; }

    if (Math.random() < 0.06) {
        valeurMemoireSimulee = valeurMemoireSimulee + Math.random() * 12;
        ajouterJournal('fa-memory', 'Pic mémoire système détecté', 'alerte');
    }

    if (Math.random() < 0.04) {
        valeurMemoireSimulee = valeurMemoireSimulee - Math.random() * 10;
        ajouterJournal('fa-broom', 'Nettoyage mémoire système', 'succes');
    }

    var pourcentMemoire = Math.round(Math.max(15, Math.min(95, valeurMemoireSimulee)));

    var totalGB = 16;
    var utiliseGB = (pourcentMemoire / 100 * totalGB).toFixed(1);

    document.getElementById('memoire-valeur').textContent = pourcentMemoire + '%';
    document.getElementById('memoire-utilise').textContent = 'Utilisé: ' + utiliseGB + ' GB';
    document.getElementById('memoire-total').textContent = 'Total: ' + totalGB + ' GB';
    document.getElementById('mini-barre-memoire').style.width = pourcentMemoire + '%';

    var barre = document.getElementById('mini-barre-memoire');
    if (pourcentMemoire < 50) {
        barre.style.background = 'linear-gradient(90deg, #00ff88, #00d4ff)';
    } else if (pourcentMemoire < 80) {
        barre.style.background = 'linear-gradient(90deg, #ffd700, #ff6b35)';
    } else {
        barre.style.background = 'linear-gradient(90deg, #ff0080, #ff0000)';
    }

    if (pourcentMemoire > 85) {
        ajouterJournal('fa-triangle-exclamation', 'Mémoire critique : ' + pourcentMemoire + '%', 'danger');
    }

    return pourcentMemoire;
}


// ================================================
// DÉBIT CONNEXION TEMPS RÉEL
// ================================================
function mettreAJourDebitConnexion() {
    var typeConnexion = 'Wi-Fi';
    var debitMbps = 0;
    var latence = 0;
    var pourcentSignal = 0;

    // Essayer l'API Network Information
    if (navigator.connection) {
        var conn = navigator.connection;
        typeConnexion = (conn.effectiveType || 'wifi').toUpperCase();
        if (conn.downlink) {
            debitMbps = conn.downlink;
        }
        if (conn.rtt) {
            latence = conn.rtt;
        }
    }

    // Simuler des fluctuations réalistes du débit
    var changement = (Math.random() * 6) - 3;
    valeurDebitSimulee = valeurDebitSimulee + changement + (tendanceDebit * Math.random());

    if (Math.random() < 0.1) tendanceDebit = tendanceDebit * -1;
    if (valeurDebitSimulee > 50) { valeurDebitSimulee = 50; tendanceDebit = -1; }
    if (valeurDebitSimulee < 2) { valeurDebitSimulee = 2; tendanceDebit = 1; }

    // Utiliser la vraie valeur si disponible, sinon simuler
    if (debitMbps > 0) {
        // Ajouter des fluctuations autour de la vraie valeur
        debitMbps = debitMbps + (Math.random() * 4 - 2);
        debitMbps = Math.max(0.5, debitMbps);
    } else {
        debitMbps = valeurDebitSimulee;
    }

    // Simuler la latence si pas disponible
    if (latence <= 0) {
        latence = Math.round(10 + Math.random() * 80);
    }

    // Calculer la qualité du signal
    if (debitMbps > 20) { pourcentSignal = 90; }
    else if (debitMbps > 10) { pourcentSignal = 75; }
    else if (debitMbps > 5) { pourcentSignal = 55; }
    else if (debitMbps > 1) { pourcentSignal = 35; }
    else { pourcentSignal = 15; }

    // Fluctuation du signal
    pourcentSignal = Math.round(Math.max(10, Math.min(100, pourcentSignal + (Math.random() * 10 - 5))));

    // Déterminer le type si API non disponible
    if (!navigator.connection) {
        if (debitMbps > 15) typeConnexion = 'Wi-Fi 5GHz';
        else if (debitMbps > 8) typeConnexion = 'Wi-Fi 2.4GHz';
        else if (debitMbps > 3) typeConnexion = '4G';
        else typeConnexion = '3G';
    }

    // Pics de débit (téléchargement en cours simulé)
    if (Math.random() < 0.04) {
        debitMbps = debitMbps + Math.random() * 20;
        ajouterJournal('fa-download', 'Pic de téléchargement détecté', 'alerte');
    }

    // Chute de débit simulée
    if (Math.random() < 0.03) {
        debitMbps = debitMbps * 0.3;
        ajouterJournal('fa-signal', 'Chute du signal réseau', 'danger');
    }

    debitMbps = Math.max(0.1, debitMbps);

    // Mise à jour de l'interface
    document.getElementById('debit-valeur').textContent = debitMbps.toFixed(1) + ' Mbps';
    document.getElementById('debit-type').textContent = 'Type: ' + typeConnexion;
    document.getElementById('debit-latence').textContent = 'Latence: ' + latence + ' ms';
    document.getElementById('mini-barre-debit').style.width = pourcentSignal + '%';

    var barre = document.getElementById('mini-barre-debit');
    if (pourcentSignal > 70) {
        barre.style.background = 'linear-gradient(90deg, #00ff88, #00d4ff)';
    } else if (pourcentSignal > 40) {
        barre.style.background = 'linear-gradient(90deg, #ffd700, #ff6b35)';
    } else {
        barre.style.background = 'linear-gradient(90deg, #ff0080, #ff0000)';
    }

    return debitMbps;
}


// ================================================
// RÉSEAU
// ================================================
function mettreAJourReseau() {
    var enligne = navigator.onLine;
    document.getElementById('reseau-statut').textContent = 'Statut: ' + (enligne ? 'En ligne' : 'Hors ligne');

    if (navigator.connection) {
        var type = (navigator.connection.effectiveType || '?').toUpperCase();
        document.getElementById('reseau-valeur').textContent = type;
        document.getElementById('reseau-info').textContent = 'Débit: ' + (navigator.connection.downlink || '?') + ' Mbps';
        document.getElementById('mini-barre-reseau').style.width = enligne ? '80%' : '0%';
    } else {
        document.getElementById('reseau-valeur').textContent = enligne ? 'En ligne' : 'Hors ligne';
        document.getElementById('reseau-info').textContent = 'Type: Inconnu';
        document.getElementById('mini-barre-reseau').style.width = enligne ? '70%' : '0%';
    }
}


// ================================================
// PERFORMANCE
// ================================================
function mettreAJourPerformance() {
    var ressources = performance.getEntriesByType('resource');
    document.getElementById('perf-ressources').textContent = 'Fichiers: ' + ressources.length;

    var entries = performance.getEntriesByType('navigation');
    if (entries.length > 0) {
        var chargement = Math.round(entries[0].loadEventEnd);
        if (chargement > 0) {
            document.getElementById('perf-charge').textContent = 'Chargement: ' + chargement + 'ms';
            document.getElementById('perf-valeur').textContent = chargement + ' ms';
            document.getElementById('mini-barre-perf').style.width = Math.min(100, Math.round(chargement / 30)) + '%';
        }
    } else if (performance.timing) {
        var t = performance.timing;
        var chargement2 = t.loadEventEnd - t.navigationStart;
        if (chargement2 > 0) {
            document.getElementById('perf-charge').textContent = 'Chargement: ' + chargement2 + 'ms';
            document.getElementById('perf-valeur').textContent = chargement2 + ' ms';
            document.getElementById('mini-barre-perf').style.width = Math.min(100, Math.round(chargement2 / 30)) + '%';
        }
    }
}


// ================================================
// NAVIGATEUR
// ================================================
function mettreAJourNavigateur() {
    var ua = navigator.userAgent;
    var nom = 'Inconnu';
    if (ua.indexOf('Chrome') !== -1) nom = 'Chrome';
    else if (ua.indexOf('Firefox') !== -1) nom = 'Firefox';
    else if (ua.indexOf('Safari') !== -1) nom = 'Safari';
    else if (ua.indexOf('Edge') !== -1) nom = 'Edge';

    document.getElementById('info-navigateur').textContent = nom;
    document.getElementById('info-plateforme').textContent = navigator.platform || 'Inconnu';
    document.getElementById('info-enligne').textContent = navigator.onLine ? 'Connecté' : 'Déconnecté';
}


// ================================================
// MISE À JOUR DES GRAPHIQUES
// ================================================
function ajouterDonnees(ram, cpu) {
    var d = new Date();
    var label = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');

    historiqueRAM.push(ram);
    historiqueCPU.push(cpu);
    historiqueLabels.push(label);

    if (historiqueRAM.length > MAX_POINTS) {
        historiqueRAM.shift();
        historiqueCPU.shift();
        historiqueLabels.shift();
    }

    graphRAM.data.labels = historiqueLabels.slice();
    graphRAM.data.datasets[0].data = historiqueRAM.slice();
    graphRAM.update();

    graphCPU.data.labels = historiqueLabels.slice();
    graphCPU.data.datasets[0].data = historiqueCPU.slice();
    graphCPU.update();

    graphGlobal.data.labels = historiqueLabels.slice();
    graphGlobal.data.datasets[0].data = historiqueRAM.slice();
    graphGlobal.data.datasets[1].data = historiqueCPU.slice();
    graphGlobal.update();

    graphDonutRAM.data.datasets[0].data = [ram, 100 - ram];
    graphDonutRAM.update();
    graphDonutCPU.data.datasets[0].data = [cpu, 100 - cpu];
    graphDonutCPU.update();

    document.getElementById('donut-ram-label').textContent = 'RAM: ' + ram + '%';
    document.getElementById('donut-cpu-label').textContent = 'CPU: ' + cpu + '%';

    mettreAJourBadges();
}

function mettreAJourBadges() {
    if (historiqueRAM.length === 0) return;
    document.getElementById('badge-ram-max').textContent = 'Max: ' + Math.max.apply(null, historiqueRAM) + '%';
    document.getElementById('badge-ram-moy').textContent = 'Moy: ' + Math.round(historiqueRAM.reduce(function(a,b){return a+b;}, 0) / historiqueRAM.length) + '%';
    document.getElementById('badge-cpu-max').textContent = 'Max: ' + Math.max.apply(null, historiqueCPU) + '%';
    document.getElementById('badge-cpu-moy').textContent = 'Moy: ' + Math.round(historiqueCPU.reduce(function(a,b){return a+b;}, 0) / historiqueCPU.length) + '%';
}


// ================================================
// JOURNAL
// ================================================
function ajouterJournal(icone, message, type) {
    type = type || 'normal';
    var journal = document.getElementById('journal');
    var div = document.createElement('div');
    var heure = new Date().toLocaleTimeString('fr-FR');
    div.className = 'journal-entree ' + type;
    div.innerHTML = '<i class="fas ' + icone + '"></i><span>[' + heure + '] ' + message + '</span>';
    journal.insertBefore(div, journal.firstChild);
    while (journal.children.length > 25) {
        journal.removeChild(journal.lastChild);
    }
}


// ================================================
// BOUCLE PRINCIPALE
// ================================================
function mettreAJourTout() {
    mettreAJourHorloge();

    var ram = mettreAJourRAM();
    var cpu = mettreAJourCPU();

    mettreAJourMemoireReelle();
    mettreAJourDebitConnexion();
    mettreAJourReseau();
    mettreAJourPerformance();
    mettreAJourNavigateur();

    ajouterDonnees(ram, cpu);
}


// ================================================
// CONTRÔLES
// ================================================
function togglePause() {
    estEnPause = !estEnPause;
    var icone = document.getElementById('icone-pause');
    var texte = document.getElementById('texte-pause');
    if (estEnPause) {
        clearInterval(intervalleId);
        icone.className = 'fas fa-play';
        texte.textContent = 'Reprendre';
        ajouterJournal('fa-pause', 'Surveillance en pause', 'alerte');
    } else {
        demarrer();
        icone.className = 'fas fa-pause';
        texte.textContent = 'Pause';
        ajouterJournal('fa-play', 'Surveillance reprise', 'succes');
    }
}

function resetDonnees() {
    historiqueRAM.length = 0;
    historiqueCPU.length = 0;
    historiqueLabels.length = 0;
    graphRAM.data.labels = [];
    graphRAM.data.datasets[0].data = [];
    graphRAM.update();
    graphCPU.data.labels = [];
    graphCPU.data.datasets[0].data = [];
    graphCPU.update();
    graphGlobal.data.labels = [];
    graphGlobal.data.datasets[0].data = [];
    graphGlobal.data.datasets[1].data = [];
    graphGlobal.update();
    ajouterJournal('fa-rotate-right', 'Données réinitialisées', 'succes');
}

function changerVitesse() {
    INTERVALLE_MS = parseInt(document.getElementById('select-vitesse').value);
    if (!estEnPause) { clearInterval(intervalleId); demarrer(); }
    ajouterJournal('fa-clock-rotate-left', 'Intervalle : ' + (INTERVALLE_MS / 1000) + 's', 'succes');
}

function estConnecte() {
    return !!localStorage.getItem('moniteur_utilisateur_actuel');
}

function sauvegarderOuRediriger() {
    if (!estConnecte()) {
        if (confirm('Vous devez être connecté pour sauvegarder. Voulez-vous vous inscrire ?')) {
            window.location.href = 'inscription.html';
        }
        return;
    }
    var utilisateur = JSON.parse(localStorage.getItem('moniteur_utilisateur_actuel'));
    var sauvegarde = {
        id: Date.now(),
        date: new Date().toISOString(),
        titre: 'Sauvegarde du ' + new Date().toLocaleDateString('fr-FR'),
        systeme: { navigateur: navigator.userAgent, plateforme: navigator.platform, coeurs: navigator.hardwareConcurrency },
        moniteur: { ram: historiqueRAM.slice(), cpu: historiqueCPU.slice(), labels: historiqueLabels.slice() }
    };
    if (!utilisateur.sauvegardes) utilisateur.sauvegardes = [];
    utilisateur.sauvegardes.push(sauvegarde);
    var utilisateurs = JSON.parse(localStorage.getItem('moniteur_utilisateurs') || '[]');
    var index = -1;
    for (var i = 0; i < utilisateurs.length; i++) {
        if (utilisateurs[i].id === utilisateur.id) { index = i; break; }
    }
    if (index !== -1) {
        utilisateurs[index] = utilisateur;
        localStorage.setItem('moniteur_utilisateurs', JSON.stringify(utilisateurs));
        localStorage.setItem('moniteur_utilisateur_actuel', JSON.stringify(utilisateur));
    }
    ajouterJournal('fa-save', 'Données sauvegardées !', 'succes');
    alert('Données sauvegardées avec succès !');
}

function verifierMessageInscription() {
    var message = document.getElementById('message-inscription');
    if (!message) return;
    if (estConnecte()) {
        message.style.display = 'none';
    } else {
        message.style.display = 'flex';
    }
}

function fermerMessageInscription() {
    document.getElementById('message-inscription').style.display = 'none';
}


// ================================================
// DÉMARRAGE
// ================================================
function demarrer() {
    mettreAJourTout();
    intervalleId = setInterval(mettreAJourTout, INTERVALLE_MS);
}

window.addEventListener('load', function() {
    initialiserGraphiques();
    ajouterJournal('fa-rocket', 'Moniteur démarré !', 'succes');
    demarrer();
    verifierMessageInscription();
});