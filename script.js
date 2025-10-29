// === 1. Adım: HTML Elemanlarını Yakalama ===
const surpriseButton = document.getElementById('surpriseButton');
const sonucAlani = document.getElementById('movieResult');
const moodButonlari = document.querySelectorAll('.mood-btn');
// YENİ: Film/Dizi seçici butonları yakala
const mediaButonlari = document.querySelectorAll('.media-btn');

// === 2. Adım: API Bilgileri ===
const apiKey = 'd724a5d75373b6467a7507e7c830caba';
const resimOnEki = 'https://image.tmdb.org/t/p/w500';

// === 3. Adım: Durum (State) Yönetimi ===
// Projemizin "hafızası". Başlangıçta 'movie' (film) seçili.
let currentMediaType = 'movie'; 

// === 4. Adım: Olay Dinleyicileri (Event Listeners) ===

// YENİ: Medya Türü (Film/Dizi) Butonları Dinleyicisi
mediaButonlari.forEach(buton => {
    buton.addEventListener('click', () => {
        // Tıklanan butonun türünü al (HTML'deki 'data-type' özelliği)
        currentMediaType = buton.dataset.type;
        console.log("Medya Tipi Değişti:", currentMediaType);

        // Diğer butonlardan 'active' class'ını kaldır
        document.querySelector('.media-btn.active').classList.remove('active');
        // Sadece tıklanan bu butona 'active' class'ını ekle
        buton.classList.add('active');

        // Tür değiştiğinde, eski sonucu temizle
        sonucAlani.innerHTML = "";
    });
});

// "Şaşırt Beni" butonu dinleyicisi (Artık 'rastgeleGetir'i çağırıyor)
surpriseButton.addEventListener('click', rastgeleGetir);

// Mod Butonları dinleyicisi
moodButonlari.forEach(buton => {
    buton.addEventListener('click', () => {
        let genreId;
        
        // ÖNCE KONTROL ET: Film mi arıyoruz, dizi mi?
        if (currentMediaType === 'movie') {
            genreId = buton.dataset.movieId; // Film ID'sini al
        } else {
            genreId = buton.dataset.tvId; // Dizi ID'sini al
        }

        // Fonksiyonu doğru parametrelerle çağır
        turuneGoreGetir(currentMediaType, genreId);
    });
});

// === 5. Adım: FİLM/DİZİ GETİRME FONKSİYONLARI (GÜNCELLENDİ) ===

// "Şaşırt Beni" fonksiyonu (Artık dinamik)
function rastgeleGetir() {
    console.log(`Rastgele ${currentMediaType} aranıyor...`);
    
    // URL'yi 'currentMediaType' değişkenine göre dinamik olarak oluştur
    const apiUrl = `https://api.themoviedb.org/3/${currentMediaType}/popular?api_key=${apiKey}&language=tr-TR&page=1`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const sonuclar = data.results;
            const rastgeleIndex = Math.floor(Math.random() * sonuclar.length);
            const secilen = sonuclar[rastgeleIndex];

            sonucuEkranaBas(secilen); // İşi 'sonucuEkranaBas'a pasla
        })
        .catch(hata => hataMesajiGoster(hata));
}

// "Mod" butonlarının fonksiyonu (Artık dinamik)
function turuneGoreGetir(mediaType, genreId) {
    // Eğer o tür için bir ID tanımlanmamışsa (örn: Dizi-Romantizm yoktu)
    if (!genreId) {
        sonucAlani.innerHTML = "<p>Üzgünüz, bu mod için seçili türde (Film/Dizi) bir karşılık bulunamadı.</p>";
        return; // Fonksiyonu durdur
    }
    
    console.log(`Tür ID (${genreId}) için ${mediaType} aranıyor...`);
    
    // URL'yi 'mediaType' ve 'genreId' değişkenlerine göre dinamik olarak oluştur
    const apiUrl = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${apiKey}&language=tr-TR&sort_by=popularity.desc&with_genres=${genreId}&page=1`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 0) {
                 sonucAlani.innerHTML = "<p>Üzgünüz, bu kritere uygun bir sonuç bulunamadı.</p>";
                 return;
            }
            
            const sonuclar = data.results;
            const rastgeleIndex = Math.floor(Math.random() * sonuclar.length);
            const secilen = sonuclar[rastgeleIndex];

            sonucuEkranaBas(secilen); // İşi 'sonucuEkranaBas'a pasla
        })
        .catch(hata => hataMesajiGoster(hata));
}


// === 6. Adım: YARDIMCI FONKSİYONLAR (GÜNCELLENDİ) ===

// Ekrana basma fonksiyonu (Artık FİLM ve DİZİ ayrımı yapabiliyor)
function sonucuEkranaBas(data) {
    // FİLM ise 'title' kullanır, DİZİ ise 'name' kullanır.
    const title = data.title ? data.title : data.name;

    // Özet boşsa, varsayılan bir metin ata
    const ozet = data.overview ? data.overview : "Bu yapım için özet bilgisi bulunmamaktadır.";
    
    // Afiş yolu yoksa, boş geç (CSS'te gizlenebilir veya varsayılan resim konabilir)
    const posterUrl = data.poster_path ? `${resimOnEki}${data.poster_path}` : '';

    console.log("Seçilen yapım:", title);

    sonucAlani.innerHTML = `
        <h2>${title}</h2>
        <img src="${posterUrl}" alt="${title} Afişi">
        <p><strong>Puanı:</strong> ${data.vote_average.toFixed(1)} / 10</p>
        <p><strong>Özet:</strong> ${ozet}</p>
    `;
}

// Hata mesajı (Değişmedi)
function hataMesajiGoster(error) {
    console.error("Hata oluştu:", error);
    sonucAlani.innerHTML = "<p>Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin.</p>";
}