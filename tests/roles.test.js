const request = require('supertest');
const {Role} = require('../models/roles');
const {User} = require('../models/users');

let server;
let authToken;

describe('/api/roles', () => {

    beforeAll( async () => {
        const user = new User({});
        authToken = await user.generateAuthToken();
        console.log(`Global Auth Token: ${authToken}`);
    });

    beforeEach(() => { server = require ('../index'); });
    afterEach(async () => {
        server.close();

        // Clean up database
        await Role.deleteMany();
    });

    describe('GET /', () => {
        it('should return all roles', async () => {

            await Role.collection.insertMany([
                { role: 'role1' },
                { role: 'role2' },
            ]);

            const res = await request(server)
                .get('/api/roles')
                .set('x-auth-token', authToken);
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.role === 'role1')).toBeTruthy();
        });
    });

    describe('POST /', () => {
        /*
        it('should get admin user and add a new role', async () => {
            // roles can only be added by an admin so first
            // we authenticate as an admin and use the returned
            // auth token to add a user.

            const adminInfo = {
                email: "mfallenstedt@airfind.com",
                password: "qwertyqwerty"
            }

            let res = await request(server)
                    .post('/api/auth')
                    .send(adminInfo);

            expect(res.status).toBe(200);
            
            expect(res.body).toHaveProperty('authToken');
            console.log(`Returned Auth Token ${res.body.authToken}`);

            res = await request(server)
                    .post('/api/roles')
                    .set('x-auth-token', res.body.authToken)
                    .send({role: "role1"});

            expect(res.status).toBe(200);
        });
        */
    });

    describe('PUT /', () => {
        it('should update an existing role', async () => {
            let res = await request(server)
                .post('/api/roles')
                .send({role: "role1"});

            expect(res.status).toBe(200);

            //console.log(`ID: ${res.body._id}`);
            //console.log(`Role: ${res.body.role}`);

            expect(res.body).toHaveProperty('role', "role1");

            // Now lets update the name of this role

            res = await request(server)
                .put('/api/roles')
                .send({id: res.body._id, role: "role2"});

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('role', "role2");
        });
    });

    describe('DELETE /', () => {
        it('should delete an existing role', async () => {
            let res = await request(server)
                .post('/api/roles')
                .send({role: "role1"});

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty('role', "role1");

            // Now lets delete this role
            //console.log(`Deleting ${res.body._id}`);

            res = await request(server)
                .delete('/api/roles')
                .query({'id': res.body._id});

            expect(res.status).toBe(200);
        });
    });
});
