const map = L.map('map').setView([48.0061, 0.1996], 12); // Le Mans par défaut


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

let routeLine = null;

const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const originSug = document.getElementById('origin-suggestions');
const destinationSug = document.getElementById('destination-suggestions');
const tripSummary = document.getElementById('trip-summary');
const btnBookNow = document.getElementById('btn-book-now');
const bookingForm = document.getElementById('booking-form');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');

let coordOrigin = null;
let coordDestination = null;

// -------- AUTOCOMPLETE ----------
function createAutoComplete(input, container, setCoord) {
  let timeout = null;

  input.addEventListener('input', () => {
    const val = input.value.trim();
    container.innerHTML = '';

    if (val.length < 3) return;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const bboxFrance = '-5.14,41.3,9.56,51.1';
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&lang=fr&bbox=${bboxFrance}`)
        .then(res => res.json())
        .then(data => {
          container.innerHTML = '';

          data.features.forEach(feature => {
            const props = feature.properties;
            const label = [
              props.name,
              props.street,
              props.city,
              props.postcode
            ].filter(Boolean).join(', ');

            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = label;

            item.addEventListener('click', () => {
              input.value = label;
              setCoord([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
              container.innerHTML = '';
            });

            container.appendChild(item);
          });
        })
        .catch(() => {
          container.innerHTML = '';
        });
    }, 300);
  });

  // Fermer suggestions si clic ailleurs
  document.addEventListener('click', e => {
    if (!container.contains(e.target) && e.target !== input) {
      container.innerHTML = '';
    }
  });
}

createAutoComplete(originInput, originSug, coord => coordOrigin = coord);
createAutoComplete(destinationInput, destinationSug, coord => coordDestination = coord);

// -------- TRAJET & PRIX ----------
function tracerTrajet(startLatLng, endLatLng) {
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${startLatLng[1]},${startLatLng[0]};${endLatLng[1]},${endLatLng[0]}?overview=full&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
        const distanceMeters = route.distance;
        const distanceKm = (distanceMeters / 1000).toFixed(2);

        // Calcul prix
        const basePrice = 5;
        const perKmRate = 1.5;
        const totalPrice = (basePrice + distanceKm * perKmRate).toFixed(2);

        // Affichage route
        routeLine = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
        map.fitBounds(routeLine.getBounds());

        // Affichage résumé dans un tableau
        tripSummary.innerHTML = `
          <table>
            <tr><th>Départ</th><td>${originInput.value}</td></tr>
            <tr><th>Arrivée</th><td>${destinationInput.value}</td></tr>
            <tr><th>Date</th><td>${dateInput.value}</td></tr>
            <tr><th>Heure</th><td>${timeInput.value}</td></tr>
            <tr><th>Distance</th><td>${distanceKm} km</td></tr>
            <tr><th>Prix estimé</th><td>${totalPrice} €</td></tr>
          </table>
        `;
        tripSummary.style.display = 'block';
        btnBookNow.style.display = 'block';

        // Cacher formulaire (voir prix uniquement)
        bookingForm.style.display = 'none';

      } else {
        alert("Itinéraire non trouvé.");
      }
    })
    .catch(() => {
      alert("Erreur lors de la récupération du trajet.");
    });
}

// -------- GESTION FORMULAIRE ----------
bookingForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!coordOrigin) {
    alert("Veuillez sélectionner une adresse de départ valide parmi les suggestions.");
    originInput.focus();
    return;
  }

  if (!coordDestination) {
    alert("Veuillez sélectionner une adresse d'arrivée valide parmi les suggestions.");
    destinationInput.focus();
    return;
  }

  if (!dateInput.value) {
    alert("Veuillez choisir une date.");
    dateInput.focus();
    return;
  }

  if (!timeInput.value) {
    alert("Veuillez choisir une heure.");
    timeInput.focus();
    return;
  }

  tracerTrajet(coordOrigin, coordDestination);
});







// -------- BOUTON RÉSERVEZ MAINTENANT ----------
btnBookNow.addEventListener('click', () => {
  alert("Réservation confirmée ! Merci.");
  // Ici, on pourrait envoyer le formulaire ou faire autre chose.

  // Remettre formulaire visible et cacher résumé + bouton
  bookingForm.style.display = 'flex';
  tripSummary.style.display = 'none';
  btnBookNow.style.display = 'none';

  // Reset formulaire et données
  bookingForm.reset();
  coordOrigin = null;
  coordDestination = null;

  // Enlever tracé
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }

  map.setView([48.8566, 2.3522], 12); // revenir à Paris
});


 // fenetre pop

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("reservation-modal");
  const btnBookNow = document.getElementById("btn-book-now");
  const spanClose = document.querySelector(".modal .close");
  const bookingForm = document.getElementById("booking-form");

  // Si le formulaire principal est soumis → afficher le bouton "Réservez maintenant"
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      btnBookNow.style.display = "block";
    });
  }

  // Clic sur le bouton "Réservez maintenant" → ouvrir la popup
  if (btnBookNow) {
    btnBookNow.addEventListener("click", function () {
      modal.style.display = "block";
    });
  }

  // Clic sur le "X" → fermer la popup
  if (spanClose) {
    spanClose.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  // Clic à l'extérieur de la popup → fermer
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Soumission du formulaire de la popup
  const finalForm = document.getElementById("final-booking-form");
  if (finalForm) {
    finalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Réservation confirmée !");
      modal.style.display = "none";
    });
  }
});

 









