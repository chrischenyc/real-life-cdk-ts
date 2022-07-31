import axios from 'axios';

describe('GET /', () => {
    test('should respond success message and status code', async () => {
        const { data, status } = await axios.get('/');

        expect(status).toEqual(200);
        expect(data).toMatchObject({ message: 'server is up 🚀' });
    });
});
