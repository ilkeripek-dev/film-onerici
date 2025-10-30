// === 1. Adım: HTML Elemanlarını Yakalama ===
const surpriseButton = document.getElementById('surpriseButton');
const sonucAlani = document.getElementById('movieResult');
const moodButonlari = document.querySelectorAll('.mood-btn');
const mediaButonlari = document.querySelectorAll('.media-btn');

// === 2. Adım: API Bilgileri ===
// --- DİKKAT! İKİ ANAHTARI DA BURAYA GİR ---
const tmdbApiKey = 'd724a5d75373b6467a7507e7c830caba'; // Film/Dizi için
const booksApiKey = 'AIzaSyBbPEMF3b4hq66HMa7S87V1nZyplJIpIzg'; // Kitap için
// ---

const resimOnEki = 'https://image.tmdb.org/t/p/w500'; // TMDB resimleri için

// === 3. Adım: Durum (State) Yönetimi ===
// Hafızamız artık 3 durumu da biliyor: 'movie', 'tv', 'book'
let currentMediaType = 'movie'; // Başlangıç hala 'movie'

// === 4. Adım: Olay Dinleyicileri (Event Listeners) ===

// Medya Türü (Film/Dizi/Kitap) Butonları Dinleyicisi
// (Bu kod zaten 3 butonu da yönetecek şekilde yazılmıştı, harika!)
mediaButonlari.forEach(buton => {
    buton.addEventListener('click', () => {
        currentMediaType = buton.dataset.type; // 'movie', 'tv' veya 'book'
        console.log("Medya Tipi Değişti:", currentMediaType);

        document.querySelector('.media-btn.active').classList.remove('active');
        buton.classList.add('active');
        sonucAlani.innerHTML = ""; // Sonucu temizle
    });
});

// "Şaşırt Beni" butonu dinleyicisi
surpriseButton.addEventListener('click', rastgeleGetir);

// Mod Butonları dinleyicisi (GÜNCELLENDİ)
moodButonlari.forEach(buton => {
    buton.addEventListener('click', () => {
        let genreData; // Artık sadece 'id' değil, 'veri' diyelim
        
        // KONTROL ET: Hangi tür seçili?
        if (currentMediaType === 'movie') {
            genreData = buton.dataset.movieId; // Film ID'sini al
        } else if (currentMediaType === 'tv') {
            genreData = buton.dataset.tvId; // Dizi ID'sini al
        } else if (currentMediaType === 'book') {
            genreData = buton.dataset.bookSubject; // Kitap 'konu' adını al
        }

        // Fonksiyonu doğru parametrelerle çağır
        turuneGoreGetir(currentMediaType, genreData);
    });
});

// === 5. Adım: VERİ GETİRME FONKSİYONLARI (GÜNCELLENDİ) ===

// "Şaşırt Beni" fonksiyonu (Artık 3'lü çalışıyor)
function rastgeleGetir() {
    console.log(`Rastgele ${currentMediaType} aranıyor...`);
    let apiUrl = '';

    // 1. API URL'ini belirle
    if (currentMediaType === 'movie') {
        apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=tr-TR&page=1`;
    } else if (currentMediaType === 'tv') {
        apiUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&language=tr-TR&page=1`;
    } else if (currentMediaType === 'book') {
        // Google Books için "popüler" gibi net bir şey yok, "Yazılım" (programming) ile ilgili
        // rastgele bir arama yapalım (veya sen 'roman' gibi bir şey de yazabilirsin)
        apiUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&langRestrict=tr&maxResults=20&key=${booksApiKey}`;
    }

    // 2. API'ye isteği at
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // 3. Veriyi işle (API'ler farklı veri döner!)
            let sonuclar;
            if (currentMediaType === 'book') {
                sonuclar = data.items; // Google 'items' dizisi döner
            } else {
                sonuclar = data.results; // TMDB 'results' dizisi döner
            }

            if (!sonuclar || sonuclar.length === 0) {
                 hataMesajiGoster("Bu kritere uygun sonuç bulunamadı.");
                 return;
            }

            const rastgeleIndex = Math.floor(Math.random() * sonuclar.length);
            const secilen = sonuclar[rastgeleIndex];

            sonucuEkranaBas(secilen); // İşi 'sonucuEkranaBas'a pasla
        })
        .catch(hata => hataMesajiGoster(hata));
}

// "Mod" butonlarının fonksiyonu (Artık 3'lü çalışıyor)
function turuneGoreGetir(mediaType, genreData) {
    if (!genreData) {
        hataMesajiGoster("Bu mod için seçili türde bir karşılık bulunamadı.");
        return;
    }
    
    console.log(`Tür (${genreData}) için ${mediaType} aranıyor...`);
    let apiUrl = '';

    // 1. API URL'ini belirle
    if (mediaType === 'movie') {
        apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=tr-TR&sort_by=popularity.desc&with_genres=${genreData}&page=1`;
    } else if (mediaType === 'tv') {
        apiUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&language=tr-TR&sort_by=popularity.desc&with_genres=${genreData}&page=1`;
    } else if (mediaType === 'book') {
        // Google Books için 'discover' yok, 'q=subject:' kullanıyoruz
        apiUrl = `https://www.googleapis.com/books/v1/volumes?q=subject:${genreData}&langRestrict=tr&maxResults=20&key=${booksApiKey}`;
    }

    // 2. API'ye isteği at (Kod tekrarı, bu ileride refactor edilebilir!)
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let sonuclar;
            if (mediaType === 'book') {
                sonuclar = data.items; // Google 'items' dizisi döner
            } else {
                sonuclar = data.results; // TMDB 'results' dizisi döner
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


// === 6. Adım: YARDIMCI FONKSİYONLAR (GÜNCELLENDİ) ===

// Ekrana basma fonksiyonu (Artık 3'ünü de anlıyor!)
function sonucuEkranaBas(data) {
    let title, ozet, posterUrl, puan;

    // KONTROL: Veri TMDB'den mi (Film/Dizi) yoksa Google Books'tan mı (Kitap)?
    if (currentMediaType === 'book') {
        // --- KİTAP Veri Yapısı ---
        const volumeInfo = data.volumeInfo;
        title = volumeInfo.title;
        // Kitaplarda bazen yazar olur, özet olmaz. Yazar(lar)ı alalım:
        const yazarlar = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Bilinmiyor';
        ozet = volumeInfo.description ? volumeInfo.description : `Yazar: ${yazarlar}`;
        // Kitap kapakları:
        posterUrl = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '';
        // Kitap puanı (varsa):
        puan = volumeInfo.averageRating ? `${volumeInfo.averageRating} / 5` : 'Puanlanmamış';

    } else {
        // --- FİLM/DİZİ Veri Yapısı ---
        title = data.title ? data.title : data.name; // Film 'title', Dizi 'name' kullanır
        ozet = data.overview ? data.overview : "Bu yapım için özet bilgisi bulunmamaktadır.";
        posterUrl = data.poster_path ? `${resimOnEki}${data.poster_path}` : '';
        puan = `${data.vote_average.toFixed(1)} / 10`;
    }

    console.log("Seçilen yapım:", title);
    
    // Güvenlik: Bazen özetler çok uzun olur, 400 karakterle sınırlayalım
    if (ozet.length > 400) {
        ozet = ozet.substring(0, 400) + "... (devamı kitap/film sayfasında)";
    }

    sonucAlani.innerHTML = `
        <h2>${title}</h2>
        <img src="${posterUrl}" alt="${title} Afişi">
        <p><strong>Puanı:</strong> ${puan}</p>
        <p><strong>Özet:</strong> ${ozet}</p>
    `;
}

// Hata mesajı (Artık parametre alıyor)
function hataMesajiGoster(mesaj) {
    console.error("Hata oluştu:", mesaj);
    sonucAlani.innerHTML = `<p>Üzgünüz, bir hata oluştu: ${mesaj}</p>`;
}
