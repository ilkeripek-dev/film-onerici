// === 1. Adım: HTML Elemanlarını Yakalama ===
const surpriseButton = document.getElementById('surpriseButton');
const sonucAlani = document.getElementById('movieResult');
const moodButonlari = document.querySelectorAll('.mood-btn');
const mediaButonlari = document.querySelectorAll('.media-btn');
// YENİ: Kayıtlı Liste Butonunu yakala
const showListButton = document.getElementById('showListButton');

// === 2. Adım: API Bilgileri ===
const tmdbApiKey = 'd724a5d75373b6467a7507e7c830caba'; 
const booksApiKey = 'AIzaSyBbPEMF3b4hq66HMa7S87V1nZyplJIpIzg'; 
const resimOnEki = 'https://image.tmdb.org/t/p/w500';

// === 3. Adım: Durum (State) Yönetimi ===
let currentMediaType = 'movie'; 
// YENİ: Kullanıcı "Listeme Ekle" butonuna bastığında hangi öğeyi ekleyeceğimizi bilmek için
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

// YENİ: "Kayıtlı Listem" butonu dinleyicisi
showListButton.addEventListener('click', showList);

// YENİ (ÇOK ÖNEMLİ): Olay Delegasyonu (Event Delegation)
// 'sonucAlani' içindeki tıklamaları dinleyen tek bir ana dinleyici.
sonucAlani.addEventListener('click', (event) => {
    // Tıklanan şey "Listeme Ekle" butonu mu?
    if (event.target.id === 'saveButton') {
        saveToList(); // Kaydetme fonksiyonunu çağır
    }
    
    // Tıklanan şey "Listeden Çıkar" butonu mu?
    if (event.target.classList.contains('remove-btn')) {
        const idToRemove = event.target.dataset.id; // Silinecek öğenin ID'sini al
        removeFromList(idToRemove); // Silme fonksiyonunu çağır
    }
});


// === 5. Adım: VERİ GETİRME FONKSİYONLARI (Değişmedi, aynı) ===

function rastgeleGetir() {
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
            if (currentMediaType === 'book') {
                sonuclar = data.items; 
            } else {
                sonuclar = data.results; 
            }

            if (!sonuclar || sonuclar.length === 0) {
                 hataMesajiGoster("Bu kritere uygun sonuç bulunamadı.");
                 return;
            }

            const rastgeleIndex = Math.floor(Math.random() * sonuclar.length);
            const secilen = sonuclar[rastgeleIndex];

            sonucuEkranaBas(secilen); 
        })
        .catch(hata => hataMesajiGoster(hata));
}

function turuneGoreGetir(mediaType, genreData) {
    if (!genreData) {
        hataMesajiGoster("Bu mod için seçili türde bir karşılık bulunamadı.");
        return;
    }
    
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
            if (mediaType === 'book') {
                sonuclar = data.items; 
            } else {
                sonuclar = data.results; 
            }

            if (!sonuclar || sonuclar.length === 0) {
                 hataMesajiGoster("Bu kritere uygun sonuç bulunamadı.");
                 return;
            }
            
            const rastgeleIndex = Math.floor(Math.random() * sonuclar.length);
            const secilen = sonuclar[rastgeleIndex];

            sonucuEkranaBas(secilen);
        })
        .catch(hata => hataMesajiGoster(hata));
}


// === 6. Adım: EKRANA BASMA FONKSİYONU (GÜNCELLENDİ) ===

function sonucuEkranaBas(data) {
    let title, ozet, posterUrl, puan, id;

    // KONTROL: Veri TMDB'den mi yoksa Google Books'tan mı?
    if (currentMediaType === 'book') {
        const volumeInfo = data.volumeInfo;
        title = volumeInfo.title;
        const yazarlar = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Bilinmiyor';
        ozet = volumeInfo.description ? volumeInfo.description : `Yazar: ${yazarlar}`;
        id = data.id; // Kitabın Google ID'si (string)
        
        posterUrl = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '';
        if (posterUrl) {
            posterUrl = posterUrl.replace('zoom=1', 'zoom=0'); // Net resim hilesi
        }
        puan = volumeInfo.averageRating ? `${volumeInfo.averageRating} / 5` : 'Puanlanmamış';

    } else {
        title = data.title ? data.title : data.name; 
        ozet = data.overview ? data.overview : "Bu yapım için özet bilgisi bulunmamaktadır.";
        posterUrl = data.poster_path ? `${resimOnEki}${data.poster_path}` : '';
        puan = `${data.vote_average.toFixed(1)} / 10`;
        id = data.id; // Filmin/Dizinin ID'si (number)
    }

    console.log("Seçilen yapım:", title);
    
    // YENİ: Bu öğeyi 'currentItemToSave' değişkenine kaydet
    // Bu, "Listeme Ekle" butonunun neyi ekleyeceğini bilmesini sağlar.
    currentItemToSave = {
        id: id,
        title: title,
        posterUrl: posterUrl,
        mediaType: currentMediaType 
    };
    
    // Özeti kısalt
    if (ozet.length > 400) {
        ozet = ozet.substring(0, 400) + "... (devamı)";
    }

    // YENİ: HTML'in sonuna "Listeme Ekle" butonu eklendi!
    sonucAlani.innerHTML = `
        <h2>${title}</h2>
        <img src="${posterUrl}" alt="${title} Afişi">
        <p><strong>Puanı:</strong> ${puan}</p>
        <p><strong>Özet:</strong> ${ozet}</p>
        <button id="saveButton" class="list-btn">Listeme Ekle 💾</button>
    `;
}

// Hata mesajı (Değişmedi)
function hataMesajiGoster(mesaj) {
    console.error("Hata oluştu:", mesaj);
    sonucAlani.innerHTML = `<p>Üzgünüz, bir hata oluştu: ${mesaj}</p>`;
}

// === 7. Adım: YENİ localStorage FONKSİYONLARI ===

// Yardımcı Fonksiyon: Listeyi hafızadan (localStorage) okur
function getListFromStorage() {
    const listJson = localStorage.getItem('mySavedList');
    return listJson ? JSON.parse(listJson) : []; // Varsa JSON'ı çöz, yoksa boş dizi döndür
}

// Yardımcı Fonksiyon: Listeyi hafızaya (localStorage) kaydeder
function saveListToStorage(list) {
    const listJson = JSON.stringify(list); // Diziyi string'e çevir
    localStorage.setItem('mySavedList', listJson); // Hafızaya yaz
}

// Ana Fonksiyon: "Listeme Ekle" butonunun çağırdığı fonksiyon
function saveToList() {
    if (!currentItemToSave) return; // Kaydedilecek bir şey yoksa dur

    const list = getListFromStorage();
    
    // Hata Kontrolü: Bu öğe zaten listede var mı?
    const isAlreadyInList = list.some(item => item.id === currentItemToSave.id);
    
    if (isAlreadyInList) {
        alert("Bu öğe zaten listenizde!");
    } else {
        list.push(currentItemToSave); // Yeni öğeyi listeye ekle
        saveListToStorage(list); // Güncel listeyi hafızaya kaydet
        alert("Listeye Eklendi!");
    }
}

// Ana Fonksiyon: "Kayıtlı Listem" butonunun çağırdığı fonksiyon
function showList() {
    const list = getListFromStorage();
    
    // Önce alanı temizle ve başlık koy
    sonucAlani.innerHTML = "<h2>Kayıtlı Listem 🗂️</h2>";
    
    if (list.length === 0) {
        sonucAlani.innerHTML += "<p>Listeniz şu anda boş. Keşfetmeye devam edin!</p>";
        return;
    }
    
    // Listeyi göstereceğimiz yeni bir alan oluşturalım
    const listContainer = document.createElement('div');
    listContainer.className = 'saved-list';
    
    // Listedeki her öğe için bir "mini-kart" oluştur
    list.forEach(item => {
        // Hangi türe ait olduğunu gösteren bir ikon
        let icon = '🎬'; // Film
        if (item.mediaType === 'tv') icon = '📺';
        if (item.mediaType === 'book') icon = '📚';

        listContainer.innerHTML += `
            <div class="saved-item">
                <img src="${item.posterUrl}" alt="${item.title} Afişi">
                <div class="item-info">
                    <strong>${icon} ${item.title}</strong>
                </div>
                <button class="remove-btn" data-id="${item.id}">Sil ❌</button>
            </div>
        `;
    });
    
    // Oluşturduğumuz listeyi ana 'sonucAlani'na ekle
    sonucAlani.appendChild(listContainer);
}

// Ana Fonksiyon: "Sil ❌" butonunun çağırdığı fonksiyon
function removeFromList(idToRemove) {
    const list = getListFromStorage();
    
    // Listeyi filtrele: Silinmesi istenen ID dışındaki *tüm* öğeleri tut
    const newList = list.filter(item => item.id.toString() !== idToRemove.toString());
    
    saveListToStorage(newList); // Yeni (filtrelenmiş) listeyi kaydet
    
    // Listeyi ekranda tazele!
    showList();
}
