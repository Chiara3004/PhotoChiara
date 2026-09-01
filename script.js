document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");
  const dropdown = document.querySelector(".dropdown");
  const dropdownBtn = document.querySelector(".dropdown-btn");

  // --- CLICK SU CATEGORIE DEL MENU ---
  const categoryLinks = document.querySelectorAll('.category-link');

  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const tag = link.getAttribute('data-tag');
      
      if (tag) {
        cercaFotoDB(tag);
      }

      if (navMenu) {
        navMenu.classList.remove("open");
      }
    });
  });

  // Tasto Home: Ricarica tutte le foto
  const homeBtn = document.querySelector('a[href="index.html"]');
  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mostraGalleria(tutteFoto);
      if (navMenu) navMenu.classList.remove("open");
    });
  }

  // Hamburger Menu
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("open");
        if (dropdown) dropdown.classList.remove("open");
      }
    });
  }

  if (dropdownBtn && dropdown) {
    dropdownBtn.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle("open");
      }
    });
  }

  // --- MODALITÀ GIORNO / NOTTE ---
  const dayBtn = document.getElementById("dayBtn");
  const nightBtn = document.getElementById("nightBtn");
  const logoStartImg = document.getElementById("logo-start-img");
  const logoEndImg = document.getElementById("logo-end-img");

  function setMode(isDay) {
    if (isDay) {
      document.body.classList.add("day-mode");
      if (logoStartImg) logoStartImg.src = "sfondi/infoIIB.png";
      if (logoEndImg) logoEndImg.src = "sfondi/infoIIB.png";
      localStorage.setItem("mode", "day");
    } else {
      document.body.classList.remove("day-mode");
      if (logoStartImg) logoStartImg.src = "sfondi/infoII.png";
      if (logoEndImg) logoEndImg.src = "sfondi/infoII.png";
      localStorage.setItem("mode", "night");
    }
  }

  if (localStorage.getItem("mode") === "day") {
    setMode(true);
  } else {
    setMode(false);
  }

  if (dayBtn) dayBtn.addEventListener("click", () => setMode(true));
  if (nightBtn) nightBtn.addEventListener("click", () => setMode(false));

  // --- BARRA DI RICERCA ---
  const searchInput = document.getElementById("searchInput");
  const searchForm = document.getElementById("searchForm");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const testo = searchInput ? searchInput.value.trim() : "";

      if (testo === "") {
        mostraGalleria(tutteFoto);
      } else {
        cercaFotoDB(testo);
      }
    });
  }

  caricaFoto();
});

var tutteFoto = [];

function formattaData(dataStringa) {
    if (!dataStringa) return 'N/D';
    var d = new Date(dataStringa);
    if (isNaN(d.getTime())) return dataStringa;
    
    var giorno = String(d.getDate()).padStart(2, '0');
    var mese = String(d.getMonth() + 1).padStart(2, '0');
    var anno = d.getFullYear();
    
    return `${giorno}/${mese}/${anno}`;
}

function caricaFoto() {
    fetch('foto.json')
        .then(res => res.json())
        .then(dati => {
            var fotoCasuali = shuffleArray(dati);
            tutteFoto = fotoCasuali;
            mostraGalleria(fotoCasuali);
        })
        .catch(err => console.error("Errore recupero foto:", err));
}

function mostraGalleria(fotoLista) {
    var container = document.querySelector('.photocontainer');
    if (!container) return;

    container.innerHTML = '';

    if (!fotoLista || fotoLista.length === 0) {
        container.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1/-1; padding: 20px;">Nessuna foto trovata con questo tag.</p>';
        return;
    }

    fotoLista.forEach(foto => {
        var urlThumb = foto.URL_FILE;
        var urlOriginale = foto.URL_ORIGINALE || foto.URL_FILE;

        var item = document.createElement('div');
        item.className = 'photocontainer-item';

        var svgLente = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

        item.innerHTML = `
            <div class="img-wrapper">
                <img src="${urlThumb}" class="gallery-image" alt="${foto.NOME || 'Foto'}">
                <img src="sfondi/infoII.png" class="watermark-logo" alt="Firma Chiara Obert">
                <button type="button" class="lens-btn" title="Vedi Dettagli">
                    ${svgLente}
                </button>
            </div>
        `;

        item.querySelector('.gallery-image').addEventListener('click', () => {
            apriFotoOriginale(urlOriginale);
        });

        item.querySelector('.lens-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mostraDettagliFoto(foto);
        });

        container.appendChild(item);
    });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function mostraDettagliFoto(foto) {
    var layout = document.querySelector('.page-layout');
    var detailsPanel = document.querySelector('.grid-details');
    
    if (!layout || !detailsPanel) return;

    detailsPanel.innerHTML = `
        <button type="button" class="close-details-btn" id="closeDetailsBtn" title="Chiudi">&times;</button>
        <h3>Dettagli Foto</h3>
        <ul>
            <li> <h2>${foto.NOME || foto.nome_file || 'N/D'}</h2></li>
            <li><strong>Luogo:</strong> ${foto.LUOGO || foto.luogo || 'N/D'}</li>
            <li><strong>Fotocamera:</strong> ${foto.FOTOCAMERA || foto.fotocamera || 'N/D'}</li>
            <li><strong>Dimensione:</strong> ${foto.DIMENSIONE || foto.dimensioni || (foto.LARGHEZZA ? `${foto.LARGHEZZA}x${foto.ALTEZZA}` : 'N/D')}</li>
            <li><strong>Iso:</strong> ${foto.ISO || foto.iso || 'N/D'}</li>
            <li><strong>Diaframma:</strong> ${foto.DIAFRAMMA || foto.diaframma || 'N/D'}</li>
            <li><strong>Tempo di scatto:</strong> ${foto.TEMPO_SCATTO || foto.tempo_scatto || 'N/D'}</li>
            <li><strong>Peso:</strong> ${foto.PESO || foto.peso || foto.size || 'N/D'}</li>
            <li><strong>Data:</strong> ${formattaData(foto.DATA_SCATTO)}</li>
        </ul>
    `;

    detailsPanel.querySelector('.close-details-btn').addEventListener('click', () => {
        chiudiDettagli();
    });

    layout.classList.add('details-open');
}

function chiudiDettagli() {
    var layout = document.querySelector('.page-layout');
    if (layout) layout.classList.remove('details-open');
}

function apriFotoOriginale(urlOriginale) {
    var nomeFile = urlOriginale.split('/').pop();
    window.open(`dettaglio.html?img=${encodeURIComponent(nomeFile)}`, '_blank');
}

function cercaFotoDB(query) {
    console.log("Ricerca locale per tag/testo:", query);
    
    if (!tutteFoto || tutteFoto.length === 0) return;

    var term = query.toLowerCase().replace(/\s+/g, '');

    var risultati = tutteFoto.filter(foto => {
        var nome = (foto.NOME || '').toLowerCase().replace(/\s+/g, '');
        var luogo = (foto.LUOGO || '').toLowerCase().replace(/\s+/g, '');
        var fotocamera = (foto.FOTOCAMERA || '').toLowerCase().replace(/\s+/g, '');
        
        var tagsMatch = false;
        if (Array.isArray(foto.TAGS)) {
            tagsMatch = foto.TAGS.some(t => t.toLowerCase().replace(/\s+/g, '').includes(term));
        }

        return nome.includes(term) || luogo.includes(term) || fotocamera.includes(term) || tagsMatch;
    });

    console.log("Risultati trovati:", risultati.length);
    mostraGalleria(risultati);
}

// Gestione Carosello nella pagina About
let currentIndex = 0;
let carouselPhotos = [];

function inizializzaCarosello() {
  const carouselSlide = document.getElementById('carouselSlide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!carouselSlide) return;

  fetch('foto.json')
    .then(res => res.json())
    .then(dati => {
      carouselPhotos = shuffleArray(dati).slice(0, 5);
      carouselSlide.innerHTML = '';

      carouselPhotos.forEach(foto => {
        var urlOriginale = foto.URL_ORIGINALE || foto.URL_FILE;

        // Creazione dello stesso wrapper usato nella galleria
        const wrapper = document.createElement('div');
        wrapper.className = 'img-wrapper carousel-item-wrapper';

        wrapper.innerHTML = `
          <img src="${foto.URL_FILE}" alt="${foto.NOME || 'Foto carosello'}" class="carousel-img">
          <img src="sfondi/infoII.png" class="watermark-logo" alt="Firma Chiara Obert">
        `;

        wrapper.addEventListener('click', () => {
          apriFotoOriginale(urlOriginale);
        });

        carouselSlide.appendChild(wrapper);
      });
    })
    .catch(err => console.error("Errore carosello:", err));

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      if (carouselPhotos.length === 0) return;
      currentIndex = (currentIndex + 1) % carouselPhotos.length;
      aggiornaCarosello();
    });

    prevBtn.addEventListener('click', () => {
      if (carouselPhotos.length === 0) return;
      currentIndex = (currentIndex - 1 + carouselPhotos.length) % carouselPhotos.length;
      aggiornaCarosello();
    });
  }
}

function aggiornaCarosello() {
  const carouselSlide = document.getElementById('carouselSlide');
  if (carouselSlide) {
    carouselSlide.style.transform = `translateX(-${currentIndex * 100}%)`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inizializzaCarosello();
});