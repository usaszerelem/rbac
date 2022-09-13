const request = require('supertest');
const {User} = require('../models/users');

let server;
const userInfo = {
    email: "sample@user.com",
    password: "samplepassword"
}
let createdUserId = null;

describe('/api/users', () => {
    beforeEach( async () => {
        server = require ('../index');
        await createOneUser();
    });
    
    afterEach(async () => {
        server.close();

        // Clean up database
        await User.deleteMany();
    });

    describe('POST /', () => {
        it('should create a new user', async () => {
            // call already made in beforeEach();
        });
    });

    describe('GET /', () => {
        it('should get an existing user', async () => {
            res = await request(server)
                .get('/api/users')
                .query({'id': createdUserId});

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('email', userInfo.email);
        });
    });

    describe('PUT /', () => {
        it('should get an existing user', async () => {
            const userUpdateInfo = {
                email: "donaldduck@disney.com",
                password: "qwertyqwerty"
            }

            res = await request(server)
                .put('/api/users')
                .query({'id': createdUserId})
                .send(userUpdateInfo);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('email', userUpdateInfo.email);
        });
    });

    describe('DELETE /', () => {
        it('should delete an existing user', async () => {
            res = await request(server)
                .delete('/api/users')
                .query({'id': createdUserId});

            expect(res.status).toBe(200);
        });
    });
});

// ----------------------------------------------------------------

async function createOneUser() {
    let res = await request(server)
        .post('/api/users')
        .send(userInfo);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', userInfo.email);

    createdUserId = res.body._id;
}