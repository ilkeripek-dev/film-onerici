#  Ne İzlesem? - Film, Dizi & Kitap Öneri Motoru

Bu proje, "Bugün ne izlesem/okusam?" kararsızlığına son vermek için geliştirilmiş kişisel bir öneri motorudur. 
Üç farklı API (TMDB ve Google Books) ile konuşarak kullanıcıya moduna, tür seçimine veya aradığı isme göre öneriler sunar.

*Bu proje, benim ilk kapsamlı web geliştirme projelerimden biridir.*

  Canlı Demo

Projeyi canlı olarak denemek için buraya tıklayın:
**https://ilkeripek-dev.github.io/film-onerici/**

---

##  Özellikler

Bu web uygulaması aşağıdakileri yapabilir:

  * **3 Farklı Medya Türü:** Film, Dizi veya Kitap arasında seçim yapabilme.
  * **Moda Göre Keşif:** "Aksiyon", "Komedi", "Gerilim" gibi önceden tanımlanmış mod/tür butonlarıyla rastgele öneriler alma.
  * **İsme Göre Arama:** Kullanıcının girdiği anahtar kelimeye (örn: "Interstellar", "Dune") göre 3 API'de de arama yapma.
  * **Rastgele Keşif:** "Şaşırt Beni!" butonuyla o an popüler olan rastgele bir yapımı keşfetme.
  * **Kişisel Liste:** `localStorage` kullanarak beğenilen önerileri "Kayıtlı Listem"e ekleyebilme ve bu listeden silebilme.
  * **Tamamen Duyarlı (Responsive):** Hem masaüstü hem de mobil cihazlarda harika görünecek şekilde tasarlanmıştır.

---

##  Öğrenilen Teknolojiler ve Beceriler

Bu projeyi geliştirirken aşağıdaki teknolojileri ve konseptleri öğrenme ve uygulama fırsatı buldum:

* **HTML5:** Semantik etiket yapısı.
  
* **CSS3:**
  Flexbox ile modern ve esnek sayfa düzenleri oluşturma.
  Media Queries (Medya Sorguları)** ile tam duyarlı (responsive) tasarım yapma.
  CSS Değişkenleri ve modern stil teknikleri.
      
* **Modern JavaScript (ES6+):**
  * **DOM (Document Object Model) Yönetimi:** HTML elemanlarını seçme, yaratma ve dinamik olarak güncelleme.
  * **API Entegrasyonu:** `fetch` kullanarak harici sunuculara (TMDB, Google Books) asenkron istekler atma (`GET`).
  * **JSON Veri İşleme:** API'lerden gelen JSON verisini okuma, ayrıştırma ve işleme.
  * **`localStorage`:** Kullanıcının kişisel listesini tarayıcı hafızasında saklama ve yönetme.
  * **Durum Yönetimi (State Management):** Seçili olan medya türünü (`movie`, `tv`, `book`) bir değişkende tutarak tüm uygulamanın davranışını dinamik olarak değiştirme.
  * **Olay Delegasyonu (Event Delegation):** Dinamik olarak oluşturulan "Sil" ve "Ekle" butonları için verimli olay dinleyicileri kurma.
  * **API Güvenliği:** Google Cloud Console'da API anahtarları oluşturma ve bu anahtarları **HTTP Yönlendirici (Referrer)** kısıtlamalarıyla
  * **sadece belirli bir web sitesi (GitHub Pages adresim) için güvence altına alma.
  * **Dağıtım (Deployment):** Projeyi **GitHub Pages** üzerinden tüm dünyanın erişebileceği canlı bir web sitesi olarak yayınlama.

---

##  Karşılaşılan En Büyük Zorluk (ve Çözümü)

Bu projedeki en zorlu kısım, "Kitap" özelliğini eklerken karşılaştığım `403 (Forbidden)` hatasıydı.

*Sorun:* Film ve Dizi API'leri (TMDB) mükemmel çalışırken, Google Books API'si canlı sitede sürekli `403 (Yasak)` hatası veriyordu.

*Çözüm:* Sorunun kodumda değil, **Google Cloud Console**'daki güvenlik ayarlarımda olduğunu fark ettim. API Anahtarımı güvenceye almak için eklediğim 
"Website restrictions" (Web sitesi kısıtlamaları) kuralını yanlış yazdığımı veya Google'ın bu kuralı algılamasının zaman aldığını keşfettim.

Kısıtlamaları geçici olarak "None" (Hiçbiri) yaparak sorunun gerçekten bu olduğunu kanıtladıktan sonra, doğru kuralı (`ilkeripek-dev.github.io/*`) yazıp 
Google'ın sunucularının bu değişikliği algılaması için 5-10 dakika bekleyerek sorunu kalıcı olarak çözdüm.
Bu, bana API güvenliğinin pratikte ne kadar önemli ve hassas olduğunu öğretti.
