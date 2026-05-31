const expressionService = require('./expressionService');
const db = require('../config/db');

// Veritabanı modülünü mock'luyoruz.
// C Analojisi: Gerçek donanım sürücüsü yerine bir 'stub' veya 'simülatör' kullanmak gibi.
// Böylece testler gerçek veritabanına dokunmadan çalışır.
jest.mock('../config/db', () => ({
    run: jest.fn(),
    all: jest.fn(),
    get: jest.fn(),
}));

describe('expressionService', () => {
    // Her testten önce mock'ları temizle
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createExpression', () => {
        it('should create a new expression and resolve with its ID', async () => {
            const mockData = {
                latex_id: 'test_id_123',
                userID: 'user_1',
                title: 'Test Title',
                latexCode: '\\alpha + \\beta',
                description: 'A test description',
                tags: ['math', 'test'],
                visibility: 'public',
            };

            // db.run fonksiyonunun başarılı bir şekilde callback çağırmasını simüle et
            // C Analojisi: Bir sistem çağrısının başarılı dönüş kodunu simüle etmek.
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 1 }); // SQLite'ın 'this.changes' özelliğini simüle et
            });

            const result = await expressionService.createExpression(mockData);

            expect(db.run).toHaveBeenCalledTimes(1);
            expect(db.run).toHaveBeenCalledWith(
                expect.any(String), // SQL sorgusu
                [
                    mockData.latex_id,
                    mockData.userID,
                    mockData.title,
                    mockData.latexCode,
                    mockData.description,
                    JSON.stringify(mockData.tags), // Tags stringify edilmiş olmalı
                    mockData.visibility,
                ],
                expect.any(Function) // Callback fonksiyonu
            );
            expect(result).toEqual({ latex_id: mockData.latex_id, message: 'İfade başarıyla oluşturuldu.' });
        });

        it('should reject if db.run encounters an error', async () => {
            const mockData = { /* ... */ };
            const mockError = new Error('DB write error');

            db.run.mockImplementation((query, params, callback) => {
                callback(mockError);
            });

            await expect(expressionService.createExpression(mockData)).rejects.toThrow(mockError);
            expect(db.run).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAllPublic', () => {
        it('should return all public expressions with parsed tags', async () => {
            const mockRows = [
                { latex_id: '1', title: 'A', tags: '["tag1"]', visibility: 'public' },
                { latex_id: '2', title: 'B', tags: '["tag2", "tag3"]', visibility: 'public' },
            ];
            db.all.mockImplementation((query, params, callback) => {
                callback(null, mockRows);
            });

            const result = await expressionService.getAllPublic();

            expect(db.all).toHaveBeenCalledTimes(1);
            expect(db.all).toHaveBeenCalledWith(expect.any(String), [], expect.any(Function));
            expect(result).toEqual([
                { latex_id: '1', title: 'A', tags: ['tag1'], visibility: 'public' },
                { latex_id: '2', title: 'B', tags: ['tag2', 'tag3'], visibility: 'public' },
            ]);
        });

        it('should reject if db.all encounters an error', async () => {
            const mockError = new Error('DB read error');
            db.all.mockImplementation((query, params, callback) => {
                callback(mockError);
            });

            await expect(expressionService.getAllPublic()).rejects.toThrow(mockError);
        });
    });

    describe('getById', () => {
        it('should return a single expression with parsed tags', async () => {
            const mockRow = { latex_id: '1', title: 'A', tags: '["tag1"]', visibility: 'public' };
            db.get.mockImplementation((query, params, callback) => {
                callback(null, mockRow);
            });

            const result = await expressionService.getById('1');

            expect(db.get).toHaveBeenCalledTimes(1);
            expect(db.get).toHaveBeenCalledWith(expect.any(String), ['1'], expect.any(Function));
            expect(result).toEqual({ latex_id: '1', title: 'A', tags: ['tag1'], visibility: 'public' });
        });

        it('should return null if no expression is found', async () => {
            db.get.mockImplementation((query, params, callback) => {
                callback(null, undefined);
            });

            const result = await expressionService.getById('non_existent_id');
            expect(result).toBeUndefined(); // SQLite'da row bulunamazsa undefined döner
        });

        it('should reject if db.get encounters an error', async () => {
            const mockError = new Error('DB read error');
            db.get.mockImplementation((query, params, callback) => {
                callback(mockError);
            });

            await expect(expressionService.getById('1')).rejects.toThrow(mockError);
        });
    });

    describe('updateExpression', () => {
        it('should update an expression and return changes count', async () => {
            const mockId = '1';
            const mockUpdateData = {
                title: 'Updated Title',
                latexCode: '\\gamma',
                description: 'Updated desc',
                tags: ['new', 'tags'],
                visibility: 'private',
            };
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 1 });
            });

            const result = await expressionService.updateExpression(mockId, mockUpdateData);

            expect(db.run).toHaveBeenCalledTimes(1);
            expect(db.run).toHaveBeenCalledWith(
                expect.any(String),
                [
                    mockUpdateData.title,
                    mockUpdateData.latexCode,
                    mockUpdateData.description,
                    JSON.stringify(mockUpdateData.tags),
                    mockUpdateData.visibility,
                    mockId,
                ],
                expect.any(Function)
            );
            expect(result).toEqual({ updated: 1 });
        });
    });

    describe('deleteExpression', () => {
        it('should delete an expression and return changes count', async () => {
            const mockId = '1';
            db.run.mockImplementation((query, params, callback) => {
                callback.call({ changes: 1 });
            });

            const result = await expressionService.deleteExpression(mockId);

            expect(db.run).toHaveBeenCalledTimes(1);
            expect(db.run).toHaveBeenCalledWith(expect.any(String), [mockId], expect.any(Function));
            expect(result).toEqual({ deleted: 1 });
        });
    });
});