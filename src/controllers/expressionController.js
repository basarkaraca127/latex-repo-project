const expressionService = require('../services/expressionService');
const latex = require('node-latex'); // Yerel LaTeX motoru için
const { v4: uuidv4 } = require('uuid'); // Benzersiz string ID'ler için


/**
 * Expression Controller
 * C Analojisi: Interrupt Handler gibi davranır. 
 * Gelen sinyali (request) yakalar, işler ve sonucu (response) döner.
 */

exports.create = async (req, res) => {
    try {
        const { title, latexCode, visibility } = req.body;
        // Görünürlük kontrolü güncellendi
        if (!title || !latexCode || !['public', 'private'].includes(visibility)) {
            return res.status(400).json({ error: "Eksik veri veya geçersiz görünürlük seçimi." });
        }

        const data = {
            latex_id: uuidv4(), // Benzersiz string ID oluştur
            userID: "user_1", // Şimdilik statik, ileride auth eklenebilir
            ...req.body         // Kullanıcıdan gelen title, latexCode, tags, visibility verilerini ekle
        };

        const result = await expressionService.createExpression(data);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.listPublic = async (req, res) => {
    try {
        const expressions = await expressionService.getAllPublic();
        res.json(expressions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const expression = await expressionService.getById(req.params.id);
        if (!expression) return res.status(404).json({ error: "Kayıt bulunamadı." });
        res.json(expression);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { title, latexCode, visibility } = req.body;
        // Backend Validasyonu (Gereksinim III-D)
        if (!title || !latexCode || !['public', 'private'].includes(visibility)) {
            return res.status(400).json({ error: "Güncelleme için geçerli veriler gerekli." });
        }
        const result = await expressionService.updateExpression(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await expressionService.deleteExpression(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * LaTeX kodunu düz metin dosyası olarak indirir.
 */
exports.downloadAsFile = async (req, res) => {
    try {
        const expression = await expressionService.getById(req.params.id);
        if (!expression) return res.status(404).send("Dosya bulunamadı.");

        const fileName = `${expression.title.replace(/\s+/g, '_')}.txt`;
        
        // HTTP Header'larını ayarlıyoruz (C'deki socket header'ları gibi)
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'text/plain');
        
        res.send(expression.latexCode);
    } catch (err) {
        res.status(500).send("Dosya üretim hatası.");
    }
};

/**
 * LaTeX kodunu PDF'e çevirip stream olarak döner.
 */
exports.generatePdf = async (req, res) => {
    try {
        const expression = await expressionService.getById(req.params.id);
        if (!expression) return res.status(404).send("İfade bulunamadı.");

        // Yerel LaTeX motorunu (pdflatex) kullanarak PDF üretimi
        const pdfStream = latex(expression.latexCode);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${expression.title}.pdf`);
        
        pdfStream.pipe(res);
        
        pdfStream.on('error', err => {
            console.error("Yerel LaTeX motoru hatası:", err);
            if (!res.headersSent) {
                res.status(500).send("PDF Oluşturma Hatası: Yerel LaTeX motoru hata verdi. Kodu kontrol edin.");
            }
        });
    } catch (err) {
        res.status(500).send("Sunucu hatası.");
    }
};

exports.listMyExpressions = async (req, res) => {
    try {
        const expressions = await expressionService.getByUser("user_1");
        res.json(expressions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};