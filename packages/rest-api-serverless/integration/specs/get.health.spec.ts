import axios from 'axios';

describe('GET /health', () => {
    test('should respond success message and status code', async () => {
        const { data, status } = await axios.get('/health');

        expect(status).toEqual(200);
        expect(data).toMatchObject({ message: 'server is up 🚀' });
    });
});
