// === Gestion du changement d'arrière-plan (background images) ===

const images = [
  '../images/taxi-preview.jpg',
  '../images/vito-1.jpg',
  '../images/vito-2.jpg',
  '../images/vito-3.jpg'
];

// Sélection des deux calques d'arrière-plan pour le crossfade
const bg1 = document.querySelector('.bg1');
const bg2 = document.querySelector('.bg2');

let index = 0;          // Index de l'image courante
let currentLayer = 1;   // Calque visible actuellement (1 ou 2)

// Initialisation des backgrounds avec les deux premières images
if (bg1 && bg2) {
  bg1.style.backgroundImage = `url(${images[0]})`;
  bg2.style.backgroundImage = `url(${images[1]})`;
  bg1.style.opacity = '1';
  bg2.style.opacity = '0';
} else {
  console.warn('Les éléments .bg1 et/ou .bg2 sont introuvables.');
}

// Fonction pour alterner les backgrounds avec effet fondu
function switchBackground() {
  if (!bg1 || !bg2) return; // Sécurité si éléments absents

  index = (index + 1) % images.length; // Passage à l’image suivante (boucle)

  if (currentLayer === 1) {
    bg2.style.backgroundImage = `url(${images[index]})`;
    bg2.style.opacity = '1';
    bg1.style.opacity = '0';
    currentLayer = 2;
  } else {
    bg1.style.backgroundImage = `url(${images[index]})`;
    bg1.style.opacity = '1';
    bg2.style.opacity = '0';
    currentLayer = 1;
  }
}

// Changer le background toutes les 15 secondes
setInterval(switchBackground, 15000);



// === Code à exécuter après que le DOM soit complètement chargé ===

document.addEventListener('DOMContentLoaded', () => {
  console.log("JS chargé sur :", window.location.pathname);



  // --- Injection dynamique du footer ---
  const footer = document.getElementById('footer');
  if (footer) {
    fetch('/pages/footer.html')
      .then(response => {
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        return response.text();
      })
      .then(data => {
        footer.innerHTML = data;
        console.log("✅ Footer injecté avec succès.");
      })
      .catch(error => {
        console.error("❌ Erreur chargement footer :", error);
      });
  }



 // --- Injection dynamique du header ---

  const header = document.getElementById('header');
  if (header) {
    fetch('/pages/header.html')
      .then(response => {
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        return response.text();
      })
      .then(data => {
        header.innerHTML = data;
        console.log("✅ header injecté avec succès.");
      })
      .catch(error => {
        console.error("❌ Erreur chargement header :", error);
      });
  }







  // --- Rendre visible l’élément bg1 (sécurité) ---
  if (bg1) {
    bg1.style.display = "block";
  }

  // --- Gestion du bouton #mon-bouton ---
  const monBouton = document.querySelector("#mon-bouton");
  if (monBouton) {
    monBouton.addEventListener("click", () => {
      console.log("Bouton cliqué !");
    });
  }

  // --- Gestion menu mobile toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const nav = document.querySelector('nav');
      if (nav) {
        nav.classList.toggle('active');
      }
    });
  }
});



