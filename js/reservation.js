

    // === Initialisation de la carte ===
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
          fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&lang=fr&bbox=${bboxFrance}`
          )
            .then((res) => res.json())
            .then((data) => {
              container.innerHTML = '';

              data.features.forEach((feature) => {
                const props = feature.properties;
                const label = [
                  props.name,
                  props.street,
                  props.city,
                  props.postcode,
                ]
                  .filter(Boolean)
                  .join(', ');

                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = label;
                item.setAttribute('role', 'option');

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
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && e.target !== input) {
          container.innerHTML = '';
        }
      });
    }

    createAutoComplete(originInput, originSug, (coord) => (coordOrigin = coord));
    createAutoComplete(destinationInput, destinationSug, (coord) => (coordDestination = coord));




    // -------- TRAJET & PRIX ----------
    /*
    function tracerTrajet(startLatLng, endLatLng) {
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }

      const url = `https://router.project-osrm.org/route/v1/driving/${startLatLng[1]},${startLatLng[0]};${endLatLng[1]},${endLatLng[0]}?overview=full&geometries=geojson`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
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
            alert('Itinéraire non trouvé.');
          }
        })
        .catch(() => {
          alert('Erreur lors de la récupération du trajet.');
        });
    }

*/












function tracerTrajet(startLatLng, endLatLng) {
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${startLatLng[1]},${startLatLng[0]};${endLatLng[1]},${endLatLng[0]}?overview=full&geometries=geojson`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
        const distanceMeters = route.distance;
        const distanceKm = (distanceMeters / 1000).toFixed(2);

        // --- 🔹 Détermination du tarif applicable ---
        const dateValue = document.getElementById('date').value;
        const timeValue = document.getElementById('time').value;
        const tripType = document.querySelector('input[name="tripType"]:checked').value;

        const dateObj = new Date(`${dateValue}T${timeValue}`);
        const day = dateObj.getDay(); // 0 = dimanche, 6 = samedi
        const hour = dateObj.getHours();

        const isNight = (hour >= 19 || hour < 7);
        const isSundayOrHoliday = (day === 0); // ⚠️ On peut étendre plus tard aux jours fériés

        let perKmRate = 0;
        let tarifLabel = '';

        if (tripType === 'roundtrip') {
          if (!isNight && !isSundayOrHoliday) {
            perKmRate = 0.83; // Tarif A
            tarifLabel = 'A (Aller-retour jour semaine)';
          } else {
            perKmRate = 1.24; // Tarif B
            tarifLabel = 'B (Aller-retour nuit, dimanche ou férié)';
          }
        } else {
          if (!isNight && !isSundayOrHoliday) {
            perKmRate = 1.66; // Tarif C
            tarifLabel = 'C (Aller simple jour semaine)';
          } else {
            perKmRate = 2.48; // Tarif D
            tarifLabel = 'D (Aller simple nuit, dimanche ou férié)';
          }
        }

        // --- 🔹 Suppléments (si présents dans ton futur formulaire) ---
        const nbPassengers = 3; // Exemple : à récupérer dynamiquement
        const hasAnimal = false;
        const hasLuggage = false;

        let supplements = 0;
        if (nbPassengers >= 4) supplements += 1.79;
        if (hasAnimal) supplements += 0.99;
        if (hasLuggage) supplements += 0.77;

        // --- 🔹 Calcul du tarif ---
        const priseEnCharge = 2.20;
        const totalPrice = (priseEnCharge + distanceKm * perKmRate + supplements).toFixed(2);

        // --- 🔹 Affichage de la route sur la carte ---
        routeLine = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
        map.fitBounds(routeLine.getBounds());

        // --- 🔹 Résumé ---
        tripSummary.innerHTML = `
          <table>
            <tr><th>Départ</th><td>${originInput.value}</td></tr>
            <tr><th>Arrivée</th><td>${destinationInput.value}</td></tr>
            <tr><th>Date</th><td>${dateInput.value}</td></tr>
            <tr><th>Heure</th><td>${timeInput.value}</td></tr>
            <tr><th>Type de trajet</th><td>${tripType === 'roundtrip' ? 'Aller & retour' : 'Aller simple'}</td></tr>
            <tr><th>Tarif appliqué</th><td>${tarifLabel}</td></tr>
            <tr><th>Distance</th><td>${distanceKm} km</td></tr>
            <tr><th>Suppléments</th><td>${supplements.toFixed(2)} €</td></tr>
            <tr><th>Prix estimé</th><td><strong>${totalPrice} €</strong></td></tr>
          </table>
        `;
        tripSummary.style.display = 'block';
        btnBookNow.style.display = 'block';
        bookingForm.style.display = 'none';
      } else {
        alert('Itinéraire non trouvé.');
      }
    })
    .catch(() => {
      alert('Erreur lors de la récupération du trajet.');
    });
}











    // -------- GESTION FORMULAIRE ----------
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!coordOrigin) {
        alert('Veuillez sélectionner une adresse de départ valide parmi les suggestions.');
        originInput.focus();
        return;
      }

      if (!coordDestination) {
        alert("Veuillez sélectionner une adresse d'arrivée valide parmi les suggestions.");
        destinationInput.focus();
        return;
      }

      if (!dateInput.value) {
        alert('Veuillez choisir une date.');
        dateInput.focus();
        return;
      }

      if (!timeInput.value) {
        alert('Veuillez choisir une heure.');
        timeInput.focus();
        return;
      }

      tracerTrajet(coordOrigin, coordDestination);
    });



    // -------- BOUTON RÉSERVEZ MAINTENANT ----------
	btnBookNow.addEventListener('click', () => {
	  alert("Réservation confirmée ! Merci.");

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

	  // Repositionner la fenêtre de formulaire
	  overlay.style.left = '2rem';
	  overlay.style.top = '2rem';
	  overlay.style.display = 'flex';  // ou 'block' selon ta config
	});




// === Formulaire modulable drag & drop ===


	const overlay = document.getElementById('booking-overlay');
	const closeBtn = document.getElementById('close-form');

	let isDragging = false;
	let offsetX = 0,
	  offsetY = 0;

	overlay.addEventListener('mousedown', (e) => {
	  if (
	    e.target.tagName === 'INPUT' ||
	    e.target.tagName === 'BUTTON' ||
	    e.target.tagName === 'LABEL'
	  )
	    return;
	  isDragging = true;
	  offsetX = e.offsetX;
	  offsetY = e.offsetY;
	  overlay.style.cursor = 'grabbing';
	});

	document.addEventListener('mousemove', (e) => {
	  if (isDragging) {
	    overlay.style.left = `${e.pageX - offsetX}px`;
	    overlay.style.top = `${e.pageY - offsetY}px`;
	  }
	});

	document.addEventListener('mouseup', () => {
	  isDragging = false;
	  overlay.style.cursor = 'grab';
	});

	// === Bouton de fermeture ===
	closeBtn.addEventListener('click', () => {
	  overlay.style.display = 'none';
	});





// fenetre pop




document.addEventListener("DOMContentLoaded", function () {

	const modal = document.getElementById("reservation-modal");
	const btnBookNow = document.getElementById("btn-book-now");
	const spanClose = document.querySelector(".modal .close");
	const bookingForm = document.getElementById("booking-form");


	// Gestion date et heure min
	const dateInput = document.getElementById('date');
	const timeInput = document.getElementById('time');

	if(dateInput && timeInput){
		const now = new Date();
		const yyyy = now.getFullYear();
		const mm = String(now.getMonth() + 1).padStart(2, '0');
		const dd = String(now.getDate()).padStart(2, '0');
		const hh = String(now.getHours()).padStart(2, '0');
		const min = String(now.getMinutes()).padStart(2, '0');

		const todayStr = `${yyyy}-${mm}-${dd}`;
		dateInput.value = todayStr;
		dateInput.min = todayStr;

		timeInput.value = `${hh}:${min}`;
		timeInput.min = `${hh}:${min}`;
	}


	// Validation réservation avant date/heure courante
	if(bookingForm){

		bookingForm.addEventListener("submit", function (e) {
		  const selectedDate = new Date(dateInput.value + 'T' + timeInput.value);
		  const currentDate = new Date();

		  if (selectedDate < currentDate) {
		    alert("La date et l'heure doivent être postérieures à la date et l'heure actuelles.");
		    dateInput.focus();
		    e.preventDefault();
		    return;
		  }

		  // Si valide, afficher bouton "Réservez maintenant"
		  btnBookNow.style.display = "block";
		  e.preventDefault();
		});
  

		document.addEventListener("DOMContentLoaded", () => {
				const dateInput = document.getElementById('date');
				const timeInput = document.getElementById('time');
				const bookingForm = document.getElementById('booking-form');

				const now = new Date();
				const yyyy = now.getFullYear();
				const mm = String(now.getMonth() + 1).padStart(2, '0');
				const dd = String(now.getDate()).padStart(2, '0');
				const hh = String(now.getHours()).padStart(2, '0');
				const min = String(now.getMinutes()).padStart(2, '0');

				const todayStr = `${yyyy}-${mm}-${dd}`;
				dateInput.value = todayStr;
				dateInput.min = todayStr;

				timeInput.value = `${hh}:${min}`;
				timeInput.min = `${hh}:${min}`;

			bookingForm.addEventListener('submit', e => {
			    const selectedDate = new Date(dateInput.value + 'T' + timeInput.value);
			    const currentDate = new Date();

			    if (selectedDate < currentDate) {
			      alert("La date et l'heure doivent être postérieures à la date et l'heure actuelles.");
			      dateInput.focus();
			      e.preventDefault();
			      return;
			    }

			});
		});
	}

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
			overlay.style.visibility = 'hidden';
			overlay.style.opacity = '0';
			overlay.style.pointerEvents = 'none';
		});
	}

	// Clic sur le "X" → fermer la popup
	if (spanClose) {
		spanClose.addEventListener("click", function () {
			modal.style.display = "none";
			overlay.style.visibility = 'visible';
			overlay.style.opacity = '1';
			overlay.style.pointerEvents = 'auto';
		});
	}

	// Clic à l'extérieur de la popup → fermer
	window.addEventListener("click", function (event) {
		if (event.target === modal) {
			modal.style.display = "none";
			overlay.style.visibility = 'visible';
			overlay.style.opacity = '1';
			overlay.style.pointerEvents = 'auto';
		}
	});

	// Soumission du formulaire de la popup
	/*
	if (finalForm) {
		finalForm.addEventListener("submit", function (e) {
			e.preventDefault();
			alert("Réservation confirmée !");
			modal.style.display = "none";
			overlay.style.visibility = 'visible';
			overlay.style.opacity = '1';
			overlay.style.pointerEvents = 'auto';
		});
	}
	*/

	if (finalForm) {
		finalForm.addEventListener("submit", function (e) {
			e.preventDefault();


		 
			modal.style.display = "none";
			overlay.style.visibility = 'visible';
			overlay.style.opacity = '1';
			overlay.style.pointerEvents = 'auto';
 



			// Récupération des données du trajet
			const tripType = document.querySelector('input[name="tripType"]:checked').value;

			const emailParams = {
			  to_email: "contact@gmail.com",
			  origin: originInput.value,
			  destination: destinationInput.value,
			  date: dateInput.value,
			  time: timeInput.value,
			  tripType: tripType === "roundtrip" ? "Aller & retour" : "Aller simple",
			  distance: document.querySelector("#tripSummary table tr:nth-child(6) td").textContent,
			  price: document.querySelector("#tripSummary table tr:last-child td strong").textContent,
			};

			// Envoi avec EmailJS
			emailjs.send("service_XXXXXX", "template_XXXXXX", emailParams)
			  .then(() => {
				    alert("✅ Réservation confirmée ! Un e-mail a été envoyé à contact@gmail.com.");
				    modal.style.display = "none";
				    overlay.style.visibility = 'visible';
				    overlay.style.opacity = '1';
				    overlay.style.pointerEvents = 'auto';
			  })
			  .catch((err) => {
				    console.error("Erreur EmailJS :", err);
				    alert("❌ Erreur lors de l’envoi de l’e-mail.");
			  });
		});
	}

});













