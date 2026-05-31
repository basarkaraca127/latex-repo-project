// C'deki #include <stdio.h> mantığı: Express kütüphanesini projeye dahil ediyoruz.
const express = require('express'); 
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json'); // Henüz oluşturmadık, aşağıda ekleyeceğiz
const expressionRoutes = require('./routes/expressionRoutes');
const userController = require('./controllers/userController');

const app = express(); // HTTP sunucu nesnemizi (soket yapımızı) instantiate ediyoruz.
const PORT = 3000;     // Sunucunun dinleyeceği port numarası

// Middleware (Ara Katman): Gelen JSON paketlerini otomatik parse et (C'deki char* veriyi struct'a map etmek gibi)
app.use(express.json());

// Frontend (public klasörü) dosyalarımızı dışarıya servis et
app.use(express.static(path.join(__dirname, '../public')));

// Rotalarımızı sisteme bağlıyoruz (Mounting the drivers)
app.use('/api/expressions', expressionRoutes);

// Kullanıcı Kayıt Rotası (İsteğe bağlı ama altyapı hazır)
app.post('/api/users/register', userController.register);

// Swagger Dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Basit bir test API ucu (Endpoint)
app.get('/api/ping', (req, res) => {
    // req: Gelen istek verisi (Request)
    // res: İstemciye gönderilecek cevap (Response)
    return res.status(200).json({ message: "pong" });
});

// Sunucuyu başlatıyoruz (C'deki listen(socket_fd, ...) fonksiyonu)
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandırıldı!`);
});