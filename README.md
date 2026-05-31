# LaTeX Repo - Sistem Analizi ve Tasarımı Projesi

Bu proje, **Bahar 2026 Sistem Analizi ve Tasarımı** dersi kapsamında geliştirilmiş, matematiksel LaTeX ifadelerini saklamak, kategorize etmek ve PDF formatında derlemek için tasarlanmış tam yığın (full-stack) bir web uygulamasıdır.

**GitHub Repository:** [https://github.com/basarkaraca127/latex-repo-project](https://github.com/basarkaraca127/latex-repo-project)

## I. Proje Tanımı
Sistem, kullanıcıların LaTeX kodlarını bir veritabanında saklamasına, bu kodlar üzerinde arama yapmasına ve yerel bir LaTeX motoru kullanarak bu ifadeleri PDF dosyasına dönüştürmesine olanak tanır. Uygulama tamamen **Vanilla JavaScript** ile geliştirilmiş bir **SPA (Single Page Application)** yapısına sahiptir.

## II. Özellikler
*   **Tam CRUD Desteği:** LaTeX ifadelerini oluşturma, listeleme, güncelleme ve silme.
*   **Gelişmiş Arama ve Filtreleme:** Başlık, açıklama ve önceden tanımlanmış etiketler (tags) üzerinden anlık arama.
*   **PDF Derleme:** Sistemde yüklü olan LaTeX motoru (`pdflatex`) ile canlı PDF üretimi.
*   **Dosya Dışa Aktarımı:** İfadeleri `.txt` veya `.pdf` olarak indirme seçeneği.
*   **RESTful Mimari:** Standart HTTP metodları (GET, POST, PUT, DELETE) ve JSON veri değişimi.
*   **API Dokümantasyonu:** Swagger UI entegrasyonu.

## III. Teknolojiler
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (SPA).
*   **Backend:** Node.js, Express.js.
*   **Veri Katmanı:** SQLite3.
*   **Test:** Jest (Unit Testing).
*   **PDF Motoru:** node-latex (Sistemdeki `pdflatex` bağımlılığını kullanır).

## IV. Sistem Gereksinimleri
Uygulamanın PDF üretim özelliğinin çalışabilmesi için sisteminizde bir LaTeX dağıtımının yüklü ve `PATH` değişkenine eklenmiş olması gerekmektedir.

### LaTeX Kurulumu
*   **Linux (Ubuntu/Debian):**
    ```bash
    sudo apt-get update
    sudo apt-get install texlive-latex-extra texlive-fonts-recommended
    ```
*   **Windows:** MiKTeX veya TeX Live indirilmeli ve kurulmalıdır.
*   **macOS:** MacTeX kurulumu önerilir.

*Kurulum sonrası terminalde `pdflatex --version` komutunun çalıştığından emin olun.*

## V. Kurulum ve Çalıştırma

Programı yerel makinenizde yeniden üretmek için aşağıdaki adımları izleyin:

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Sunucuyu Başlatın:**
    ```bash
    npm start
    ```
    Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

3.  **Uygulamaya Erişin:**
    Tarayıcınızdan `http://localhost:3000` adresine gidin.

## VI. API Dokümantasyonu (Swagger)
API uç noktalarını (endpoints) incelemek ve test etmek için tarayıcıdan aşağıdaki adrese gidin:
`http://localhost:3000/api-docs`

## VII. Testlerin Çalıştırılması
İş mantığı (business logic) fonksiyonları için hazırlanan birim testlerini (unit tests) çalıştırmak için:
```bash
npm test
```
Testler `src/services/` dizini altındaki servis katmanını kapsamaktadır.

## VIII. Proje Yapısı
Proje, ders gereksinimlerine uygun olarak iş mantığının rotalardan ayrıldığı katmanlı bir mimariye sahiptir:

```text
latex-repo-project/
├── public/             # Frontend dosyaları (Vanilla JS, HTML, CSS)
│   ├── index.html      # Ana uygulama arayüzü
│   ├── main.js         # SPA mantığı ve Event Handler'lar
│   └── style.css       # Uygulama tasarımı
├── src/
│   ├── config/         # Veritabanı yapılandırması (SQLite)
│   ├── controllers/    # Request/Response yönetimi (Interrupt Handlers)
│   ├── routes/         # API uç noktası tanımlamaları
│   ├── services/       # İş mantığı ve CRUD işlemleri (Business Logic)
│   └── app.js          # Uygulama giriş noktası ve Middleware yapılandırması
├── swagger.json        # OpenAPI dokümantasyonu
├── project.db          # SQLite veritabanı dosyası (Otomatik oluşur)
└── package.json        # Bağımlılıklar ve script tanımları
```

## IX. Girdi Doğrulama (Validation)
*   **Frontend:** Form gönderilmeden önce zorunlu alanlar ve veri tipleri JavaScript ile kontrol edilir.
*   **Backend:** Gelen tüm POST ve PUT istekleri `expressionController.js` içerisinde doğrulanır; eksik veya hatalı verilerde uygun HTTP durum kodları (400 Bad Request) döndürülür.

---
**Geliştiren:** Başar Karaca  
**Ders:** Sistem Analizi ve Tasarımı  
**Dönem:** Bahar 2026