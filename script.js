// === 1. Adım: HTML Elemanlarını Yakalama ===
const surpriseButton = document.getElementById('surpriseButton');
const sonucAlani = document.getElementById('movieResult');
const moodButonlari = document.querySelectorAll('.mood-btn');
const mediaButonlari = document.querySelectorAll('.media-btn');
const showListButton = document.getElementById('showListButton');
// YENİ: Arama elemanlarını yakala
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// === 2. Adım: API Bilgileri ===
const tmdbApiKey = 'd724a5d75373b6467a7507e7c830caba'; 
const booksApiKey = 'AIzaSyBbPEMF3b4hq66HMa7S87V1nZyplJIpIzg'; 
const resimOnEki = 'https://image.tmdb.org/t/p/w500';

// === 3. Adım: Durum (State) Yönetimi ===
let currentMediaType = 'movie'; 
let currentItemToSave = null; 

// === 4. Adım: Olay Dinleyicileri (Event Listeners) ===

// Medya Türü (Film/Dizi/Kitap) Butonları Dinleyicisi
mediaButonlari.forEach(buton => {
    buton.addEventListener('click', () => {
        currentMediaType = buton.dataset.type; 
        document.querySelector('.media-btn.active').classList.remove('active');
        buton.classList.add('active');
        sonucAlani.innerHTML = ""; 
    });
});

// "Şaşırt Beni" butonu dinleyicisi
surpriseButton.addEventListener('click', rastgeleGetir);

// Mod Butonları dinleyicisi
moodButonlari.forEach(buton => {
    buton.addEventListener('click', () => {
        let genreData; 
        if (currentMediaType === 'movie') {
            genreData = buton.dataset.movieId; 
        } else if (currentMediaType === 'tv') {
            genreData = buton.dataset.tvId; 
        } else if (currentMediaType === 'book') {
            genreData = buton.dataset.bookSubject; 
        }
        turuneGoreGetir(currentMediaType, genreData);
    });
});

// "Kayıtlı Listem" butonu dinleyicisi
showListButton.addEventListener('click', showList);

// YENİ: "Ara 🔍" butonu dinleyicisi
searchButton.addEventListener('click', searchByName);

// YENİ: Arama kutusundayken Enter'a basınca da ara
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchByName();
    }
});

// Olay Delegasyonu (Event Delegation) - (Değişmedi)
sonucAlani.addEventListener('click', (event) => {
    if (event.target.id === 'saveButton') {
        saveToList(); 
    }
    if (event.target.classList.contains('remove-btn')) {
        const idToRemove = event.target.dataset.id; 
        removeFromList(idToRemove); 
    }
});


// === 5. Adım: VERİ GETİRME FONKSİYONLARI ===

// YENİ: "Ara 🔍" butonunun çağırdığı ana fonksiyon
function searchByName() {
    const query = searchInput.value; // Arama kutusundaki metni al
    if (!query) {
        alert("Lütfen bir arama terimi girin.");
        return;
    }

    console.log(`"${query}" için ${currentMediaType} aranıyor...`);
    let apiUrl = '';

    // 1. API URL'ini belirle (Artık 'search' endpoint'lerini kullanıyoruz)
    if (currentMediaType === 'movie') {
        apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${query}&language=tr-TR&page=1`;
    } else if (currentMediaType === 'tv') {
        apiUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${query}&language=tr-TR&page=1`;
    } else if (currentMediaType === 'book') {
        // Google Books'ta 'search' ve 'discover' aynıdır, 'q=' parametresi değişir
        apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=tr&maxResults=1&key=${booksApiKey}`;
    }

    // 2. API'ye isteği at
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let sonuclar;
            if (currentMediaType === 'book') {
                sonuclar = data.items; 
            } else {
                sonuclar = data.results; 
            }

            if (!sonuclar || sonuclar.length === 0) {
                 hataMesajiGoster("Bu arama için sonuç bulunamadı.");
                 return;
            }

            // ARAMA'da her zaman listenin İLK ve EN ALAKALI sonucunu alırız
            const secilen = sonuclar[0];
            sonucuEkranaBas(secilen); 
        })
        .catch(hata => hataMesajiGoster(hata));
}


// "Şaşırt Beni" fonksiyonu (Değişmedi)
function rastgeleGetir() {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    console.log(`Rastgele ${currentMediaType} aranıyor...`);
    let apiUrl = '';
    if (currentMediaType === 'movie') {
        apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=tr-TR&page=1`;
    } else if (currentMediaType === 'tv') {
        apiUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&language=tr-TR&page=1`;
    } else if (currentMediaType === 'book') {
        apiUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&langRestrict=tr&maxResults=20&key=${booksApiKey}`;
    }
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let sonuclar;
            if (currentMediaType === 'book') { sonuclar = data.items; } else { sonuclar = data.results; }
            if (!sonuclar || sonuclar.length === 0) { hataMesajiGoster("Bu kritere uygun sonuç bulunamadı."); return; }
            const rastgeleIndex = Math.floor(Math.random() * sonuclar.length);
            const secilen = sonuclar[rastgeleIndex];
            sonucuEkranaBas(secilen); 
        })
        .catch(hata => hataMesajiGoster(hata));
}

// "Moduna Göre" fonksiyonu (Değişmedi)
function turuneGoreGetir(mediaType, genreData) {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    if (!genreData) { hataMesajiGoster("Bu mod için seçili türde bir karşılık bulunamadı."); return; }
    console.log(`Tür (${genreData}) için ${mediaType} aranıyor...`);
    let apiUrl = '';
    if (mediaType === 'movie') {
        apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=tr-TR&sort_by=popularity.desc&with_genres=${genreData}&page=1`;
    } else if (mediaType === 'tv') {
        apiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&language=tr-TR&sort_by=popularity.desc&with_genres=${genreData}&page=1`;
    } else if (mediaType === 'book') {
        apiUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:${genreData}&langRestrict=tr&maxResults=20&key=${booksApiKey}`;
    }
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let sonuclar;
            if (mediaType === 'book') { sonuclar = data.items; } else { sonuclar = data.results; }
            if (!sonuclar || sonuclar.length === 0) { hataMesajiGoster("Bu kritere uygun sonuç bulunamadı."); return; }
            const rastgeleIndex = Math.floor(Math.random() * sonuclar.length);
            const secilen = sonuclar[rastgeleIndex];
            sonucuEkranaBas(secilen);
        })
        .catch(hata => hataMesajiGoster(hata));
}


// === 6. Adım: EKRANA BASMA FONKSİYONU (Değişmedi) ===
function sonucuEkranaBas(data) {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    let title, ozet, posterUrl, puan, id;
    if (currentMediaType === 'book') {
        const volumeInfo = data.volumeInfo;
        title = volumeInfo.title;
        const yazarlar = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Bilinmiyor';
        ozet = volumeInfo.description ? volumeInfo.description : `Yazar: ${yazarlar}`;
        id = data.id; 
        posterUrl = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '';
        if (posterUrl) { posterUrl = posterUrl.replace('zoom=1', 'zoom=0'); }
        puan = volumeInfo.averageRating ? `${volumeInfo.averageRating} / 5` : 'Puanlanmamış';
    } else {
        title = data.title ? data.title : data.name; 
        ozet = data.overview ? data.overview : "Bu yapım için özet bilgisi bulunmamaktadır.";
        posterUrl = data.poster_path ? `${resimOnEki}${data.poster_path}` : '';
        puan = `${data.vote_average.toFixed(1)} / 10`;
        id = data.id; 
    }
    currentItemToSave = { id: id, title: title, posterUrl: posterUrl, mediaType: currentMediaType };
    if (ozet && ozet.length > 400) { ozet = ozet.substring(0, 400) + "... (devamı)"; }
    sonucAlani.innerHTML = `
        <h2>${title}</h2>
        <img src="${posterUrl}" alt="${title} Afişi">
        <p><strong>Puanı:</strong> ${puan}</p>
        <p><strong>Özet:</strong> ${ozet ? ozet : ''}</p>
        <button id="saveButton" class="list-btn">Listeme Ekle 💾</button>
    `;
}

// Hata mesajı (Değişmedi)
function hataMesajiGoster(mesaj) {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    console.error("Hata oluştu:", mesaj);
    sonucAlani.innerHTML = `<p>Üzgünüz, bir hata oluştu: ${mesaj}</p>`;
}

// === 7. Adım: localStorage FONKSİYONLARI (Değişmedi) ===
function getListFromStorage() {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    const listJson = localStorage.getItem('mySavedList');
    return listJson ? JSON.parse(listJson) : []; 
}
function saveListToStorage(list) {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    const listJson = JSON.stringify(list); 
    localStorage.setItem('mySavedList', listJson); 
}
function saveToList() {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    if (!currentItemToSave) return; 
    const list = getListFromStorage();
    const isAlreadyInList = list.some(item => item.id === currentItemToSave.id);
    if (isAlreadyInList) {
        alert("Bu öğe zaten listenizde!");
    } else {
        list.push(currentItemToSave); 
        saveListToStorage(list); 
        alert("Listeye Eklendi!");
    }
}
function showList() {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    const list = getListFromStorage();
    sonucAlani.innerHTML = "<h2>Kayıtlı Listem 🗂️</h2>";
    if (list.length === 0) {
        sonucAlani.innerHTML += "<p>Listeniz şu anda boş. Keşfetmeye devam edin!</p>";
        return;
    }
    const listContainer = document.createElement('div');
    listContainer.className = 'saved-list';
    list.forEach(item => {
        let icon = '🎬'; 
        if (item.mediaType === 'tv') icon = '📺';
        if (item.mediaType === 'book') icon = '📚';
        listContainer.innerHTML += `
            <div class="saved-item">
                <img src="${item.posterUrl ? item.posterUrl : ''}" alt="${item.title} Afişi">
                <div class="item-info">
                    <strong>${icon} ${item.title}</strong>
                </div>
                <button class="remove-btn" data-id="${item.id}">Sil ❌</button>
            </div>
        `;
    });
    sonucAlani.appendChild(listContainer);
}
function removeFromList(idToRemove) {
    // ... (Bu fonksiyonun içi Seviye 4 koduyla aynı, değişmedi)
    const list = getListFromStorage();
    const newList = list.filter(item => item.id.toString() !== idToRemove.toString());
    saveListToStorage(newList); 
    showList();
}
