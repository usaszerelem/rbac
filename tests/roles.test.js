const request = require('supertest');
const {Role} = require('../models/roles');

let server;

describe('/api/roles', () => {
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

            const res = await request(server).get('/api/roles');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.role === 'role1')).toBeTruthy();
        });
    });

    describe('POST /', () => {
        it('should add a new role', async () => {
            let res = await request(server)
                    .post('/api/roles')
                    .send({role: "role1"});

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('role', "role1");

            res = await request(server)
                    .post('/api/roles')
                    .send({role: "role1"});

            expect(res.status).toBe(400);
        });
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
