// ================================================
// GESTION INSCRIPTION / CONNEXION / SAUVEGARDE
// ================================================

// ---- 1. BASCULER ENTRE LES FORMULAIRES ----
function basculerFormulaire(cible) {
    const formInscription = document.getElementById('form-inscription');
    const formConnexion   = document.getElementById('form-connexion');
    const panneauProfil   = document.getElementById('panneau-profil');

    formInscription.classList.add('cache');
    formConnexion.classList.add('cache');
    panneauProfil.classList.add('cache');

    if (cible === 'inscription') {
        formInscription.classList.remove('cache');
    } else if (cible === 'connexion') {
        formConnexion.classList.remove('cache');
    } else if (cible === 'profil') {
        panneauProfil.classList.remove('cache');
    }
}

// ---- 2. AFFICHER / MASQUER MOT DE PASSE ----
function toggleMotDePasse(idInput, bouton) {
    const input = document.getElementById(idInput);
    const icone = bouton.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icone.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icone.className = 'fas fa-eye';
    }
}

// ---- 3. ÉVALUER LA FORCE DU MOT DE PASSE ----
document.addEventListener('DOMContentLoaded', () => {
    const champMdp = document.getElementById('insc-mdp');
    if (champMdp) {
        champMdp.addEventListener('input', function() {
            evaluerForceMotDePasse(this.value);
        });
    }
    verifierConnexion();
});

function evaluerForceMotDePasse(mdp) {
    const barre = document.getElementById('mdp-barre');
    const texte = document.getElementById('mdp-texte');

    let force = 0;
    if (mdp.length >= 6) force++;
    if (mdp.length >= 10) force++;
    if (/[A-Z]/.test(mdp)) force++;
    if (/[0-9]/.test(mdp)) force++;
    if (/[^A-Za-z0-9]/.test(mdp)) force++;

    let couleur = '#ff0055';
    let label = 'Faible';
    if (force >= 2) { couleur = '#ff6b35'; label = 'Moyen'; }
    if (force >= 3) { couleur = '#ffd700'; label = 'Correct'; }
    if (force >= 4) { couleur = '#00d4ff'; label = 'Fort'; }
    if (force >= 5) { couleur = '#00ff88'; label = 'Très fort'; }

    barre.style.width = `${(force / 5) * 100}%`;
    barre.style.background = couleur;
    texte.textContent = mdp.length > 0 ? label : '';
    texte.style.color = couleur;
}

// ---- 4. INSCRIPTION ----
function inscrire() {
    const nom     = document.getElementById('insc-nom').value.trim();
    const email   = document.getElementById('insc-email').value.trim();
    const mdp     = document.getElementById('insc-mdp').value;
    const mdp2    = document.getElementById('insc-mdp2').value;
    const machine = document.getElementById('insc-machine').value.trim();

    if (!nom || !email || !mdp || !mdp2) {
        afficherMessage('msg-inscription', 'Veuillez remplir tous les champs obligatoires', 'erreur');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        afficherMessage('msg-inscription', 'Adresse email invalide', 'erreur');
        return;
    }
    if (mdp.length < 6) {
        afficherMessage('msg-inscription', 'Le mot de passe doit contenir au moins 6 caractères', 'erreur');
        return;
    }
    if (mdp !== mdp2) {
        afficherMessage('msg-inscription', 'Les mots de passe ne correspondent pas', 'erreur');
        return;
    }

    const utilisateurs = JSON.parse(localStorage.getItem('moniteur_utilisateurs') || '[]');
    const existe = utilisateurs.find(u => u.email === email);
    if (existe) {
        afficherMessage('msg-inscription', 'Un compte avec cet email existe déjà', 'erreur');
        return;
    }

    const nouvelUtilisateur = {
        id: Date.now(),
        nom: nom,
        email: email,
        motDePasse: mdp,
        machine: machine || 'Non spécifié',
        dateInscription: new Date().toISOString(),
        systeme: collecterInfosSysteme(),
        sauvegardes: []
    };

    utilisateurs.push(nouvelUtilisateur);
    localStorage.setItem('moniteur_utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('moniteur_utilisateur_actuel', JSON.stringify(nouvelUtilisateur));

    afficherMessage('msg-inscription', 'Compte créé avec succès ! Redirection...', 'succes');
    setTimeout(() => {
        afficherProfil(nouvelUtilisateur);
    }, 1500);
}

// ---- 5. CONNEXION ----
function connecter() {
    const email = document.getElementById('conn-email').value.trim();
    const mdp   = document.getElementById('conn-mdp').value;

    if (!email || !mdp) {
        afficherMessage('msg-connexion', 'Veuillez remplir tous les champs', 'erreur');
        return;
    }

    const utilisateurs = JSON.parse(localStorage.getItem('moniteur_utilisateurs') || '[]');
    const utilisateur = utilisateurs.find(u => u.email === email && u.motDePasse === mdp);

    if (!utilisateur) {
        afficherMessage('msg-connexion', 'Email ou mot de passe incorrect', 'erreur');
        return;
    }

    utilisateur.systeme = collecterInfosSysteme();
    const index = utilisateurs.findIndex(u => u.id === utilisateur.id);
    utilisateurs[index] = utilisateur;
    localStorage.setItem('moniteur_utilisateurs', JSON.stringify(utilisateurs));
    localStorage.setItem('moniteur_utilisateur_actuel', JSON.stringify(utilisateur));

    afficherMessage('msg-connexion', 'Connexion réussie !', 'succes');
    setTimeout(() => {
        afficherProfil(utilisateur);
    }, 1000);
}

// ---- 6. DÉCONNEXION ----
function deconnecter() {
    localStorage.removeItem('moniteur_utilisateur_actuel');
    basculerFormulaire('connexion');
}

// ---- 7. VÉRIFIER SI DÉJÀ CONNECTÉ ----
function verifierConnexion() {
    const session = localStorage.getItem('moniteur_utilisateur_actuel');
    if (session) {
        const utilisateur = JSON.parse(session);
        afficherProfil(utilisateur);
    }
}

// ---- 8. COLLECTER LES INFOS SYSTÈME ----
function collecterInfosSysteme() {
    const ua = navigator.userAgent;
    let navigateur = 'Inconnu';
    if (ua.includes('Chrome'))       navigateur = 'Google Chrome';
    else if (ua.includes('Firefox')) navigateur = 'Mozilla Firefox';
    else if (ua.includes('Safari'))  navigateur = 'Apple Safari';
    else if (ua.includes('Edge'))    navigateur = 'Microsoft Edge';

    let ram = 'Non disponible';
    if (navigator.deviceMemory) {
        ram = navigator.deviceMemory + ' GB';
    } else if (performance.memory) {
        ram = (performance.memory.jsHeapSizeLimit / 1024 / 1024 / 1024).toFixed(1) + ' GB';
    }

    let connexion = 'Non disponible';
    if (navigator.connection) {
        const type = navigator.connection.effectiveType || 'Inconnu';
        const vitesse = navigator.connection.downlink || '?';
        connexion = `${type.toUpperCase()} (${vitesse} Mbps)`;
    }

    return {
        navigateur:    navigateur,
        plateforme:    navigator.platform || 'Inconnu',
        coeursCPU:     navigator.hardwareConcurrency || 'Inconnu',
        ram:           ram,
        ecran:         `${screen.width} x ${screen.height}`,
        langue:        navigator.language || 'Inconnu',
        connexion:     connexion,
        fuseauHoraire: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enLigne:       navigator.onLine,
        dateCollecte:  new Date().toISOString()
    };
}

// ---- 9. AFFICHER LE PROFIL ----
function afficherProfil(utilisateur) {
    basculerFormulaire('profil');

    document.getElementById('profil-nom').textContent    = utilisateur.nom;
    document.getElementById('profil-email').textContent   = utilisateur.email;
    document.getElementById('profil-machine').textContent = `Machine : ${utilisateur.machine}`;

    const dateInsc = new Date(utilisateur.dateInscription);
    document.getElementById('profil-date').textContent =
        `Inscrit le : ${dateInsc.toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        })}`;

    if (utilisateur.systeme) {
        const sys = utilisateur.systeme;
        document.getElementById('profil-navigateur').textContent = sys.navigateur;
        document.getElementById('profil-plateforme').textContent = sys.plateforme;
        document.getElementById('profil-coeurs').textContent     = sys.coeursCPU;
        document.getElementById('profil-ram').textContent         = sys.ram;
        document.getElementById('profil-ecran').textContent       = sys.ecran;
        document.getElementById('profil-langue').textContent      = sys.langue;
        document.getElementById('profil-connexion').textContent   = sys.connexion;
        document.getElementById('profil-fuseau').textContent      = sys.fuseauHoraire;
    }

    afficherHistoriqueSauvegardes(utilisateur);
}

// ---- 10. SAUVEGARDER LES DONNÉES ----
function sauvegarderDonnees() {
    const session = localStorage.getItem('moniteur_utilisateur_actuel');
    if (!session) return;

    const utilisateur = JSON.parse(session);
    const infosActuelles = collecterInfosSysteme();

    const sauvegarde = {
        id:   Date.now(),
        date: new Date().toISOString(),
        systeme: infosActuelles,
        note: `Sauvegarde du ${new Date().toLocaleDateString('fr-FR')}`
    };

    if (!utilisateur.sauvegardes) {
        utilisateur.sauvegardes = [];
    }
    utilisateur.sauvegardes.push(sauvegarde);

    const utilisateurs = JSON.parse(localStorage.getItem('moniteur_utilisateurs') || '[]');
    const index = utilisateurs.findIndex(u => u.id === utilisateur.id);

    if (index !== -1) {
        utilisateurs[index] = utilisateur;
        localStorage.setItem('moniteur_utilisateurs', JSON.stringify(utilisateurs));
    }

    localStorage.setItem('moniteur_utilisateur_actuel', JSON.stringify(utilisateur));
    afficherProfil(utilisateur);
    alert('Données système sauvegardées avec succès !');
}

// ---- 11. AFFICHER L'HISTORIQUE DES SAUVEGARDES ----
function afficherHistoriqueSauvegardes(utilisateur) {
    const conteneur = document.getElementById('historique-sauvegardes');
    conteneur.innerHTML = '';

    if (!utilisateur.sauvegardes || utilisateur.sauvegardes.length === 0) {
        conteneur.innerHTML = `
            <p style="color: #666; font-size: 0.85rem; text-align: center; padding: 15px;">
                <i class="fas fa-inbox"></i>
                Aucune sauvegarde pour le moment
            </p>
        `;
        return;
    }

    const sauvegardes = [...utilisateur.sauvegardes].reverse();

    sauvegardes.forEach(sauv => {
        const date = new Date(sauv.date);
        const dateFormatee = date.toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const div = document.createElement('div');
        div.className = 'sauvegarde-item';
        div.innerHTML = `
            <span class="sauvegarde-date">
                <i class="fas fa-floppy-disk"></i>
                ${dateFormatee}
            </span>
            <div class="sauvegarde-actions">
                <button title="Voir les détails" onclick="voirSauvegarde(${sauv.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button title="Télécharger" onclick="telechargerSauvegarde(${sauv.id})">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-supprimer" title="Supprimer" onclick="supprimerSauvegarde(${sauv.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        conteneur.appendChild(div);
    });
}

// ---- 12. VOIR DÉTAILS SAUVEGARDE ----
function voirSauvegarde(idSauvegarde) {
    const session = JSON.parse(localStorage.getItem('moniteur_utilisateur_actuel'));
    const sauv = session.sauvegardes.find(s => s.id === idSauvegarde);

    if (sauv) {
        const details = `
            Date : ${new Date(sauv.date).toLocaleString('fr-FR')}
            ${sauv.note ? 'Note : ' + sauv.note : ''}
        `;
        alert(details);
    }
}

// ---- 13. TÉLÉCHARGER UNE SAUVEGARDE ----
function telechargerSauvegarde(idSauvegarde) {
    const session = JSON.parse(localStorage.getItem('moniteur_utilisateur_actuel'));
    const sauv = session.sauvegardes.find(s => s.id === idSauvegarde);

    if (sauv) {
        const blob = new Blob(
            [JSON.stringify(sauv, null, 2)],
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sauvegarde-${idSauvegarde}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ---- 14. SUPPRIMER UNE SAUVEGARDE ----
function supprimerSauvegarde(idSauvegarde) {
    if (!confirm('Supprimer cette sauvegarde ?')) return;

    const session = JSON.parse(localStorage.getItem('moniteur_utilisateur_actuel'));
    session.sauvegardes = session.sauvegardes.filter(s => s.id !== idSauvegarde);

    localStorage.setItem('moniteur_utilisateur_actuel', JSON.stringify(session));

    const utilisateurs = JSON.parse(localStorage.getItem('moniteur_utilisateurs') || '[]');
    const index = utilisateurs.findIndex(u => u.id === session.id);
    if (index !== -1) {
        utilisateurs[index] = session;
        localStorage.setItem('moniteur_utilisateurs', JSON.stringify(utilisateurs));
    }

    afficherProfil(session);
}

// ---- 15. ALLER AU MONITEUR ----
function allerAuMoniteur() {
    window.location.href = 'index.html';
}

// ---- 16. EXPORTER TOUTES LES SAUVEGARDES ----
function exporterToutesSauvegardes() {
    console.log('=== DÉBUT EXPORT ===');
    
    const session = localStorage.getItem('moniteur_utilisateur_actuel');
    console.log('Session trouvée :', !!session);
    
    if (!session) {
        console.error('❌ Aucune session active');
        alert('Vous devez être connecté pour exporter vos données.');
        return;
    }

    const utilisateur = JSON.parse(session);
    console.log('Utilisateur :', utilisateur.nom);
    console.log('Sauvegardes :', utilisateur.sauvegardes);

    if (!utilisateur.sauvegardes || utilisateur.sauvegardes.length === 0) {
        console.error('❌ Aucune sauvegarde');
        alert('Aucune sauvegarde à exporter.');
        return;
    }

    // Préparer les données
    const donneesExport = {
        utilisateur: {
            nom: utilisateur.nom,
            email: utilisateur.email,
            machine: utilisateur.machine,
            dateInscription: utilisateur.dateInscription
        },
        systeme: utilisateur.systeme,
        sauvegardes: utilisateur.sauvegardes,
        metadata: {
            exportDate: new Date().toISOString(),
            navigateur: navigator.userAgent,
            url: window.location.href,
            nombreSauvegardes: utilisateur.sauvegardes.length
        }
    };

    console.log('Données préparées :', donneesExport);

    // Créer et télécharger le fichier
    try {
        const blob = new Blob(
            [JSON.stringify(donneesExport, null, 2)],
            { type: 'application/json' }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moniteur-sauvegardes-${utilisateur.nom.replace(/\s+/g, '_')}-${Date.now()}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(' Fichier téléchargé avec succès');
        alert(' Sauvegardes exportées avec succès !');
    } catch (error) {
        console.error('❌ Erreur :', error);
        alert('❌ Erreur lors de l\'export');
    }
}

// ---- 17. AFFICHER UN MESSAGE ----
function afficherMessage(idElement, texte, type) {
    const element = document.getElementById(idElement);
    if (!element) return;

    let icone = 'fa-circle-info';
    if (type === 'erreur') icone = 'fa-circle-xmark';
    if (type === 'succes') icone = 'fa-circle-check';

    element.innerHTML = `<i class="fas ${icone}"></i> ${texte}`;
    element.className = `auth-message ${type}`;

    setTimeout(() => {
        element.className = 'auth-message';
        element.innerHTML = '';
    }, 5000);
}