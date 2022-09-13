const request = require('supertest');
const {Role} = require('../models/roles');
const {User} = require('../models/users');

let server;

const userInfo = {
    email: "sample@user.com",
    password: "samplepassword"
}

let roleArray;

describe('/api/userroles', () => {

    beforeAll( async () => {
        server = require ('../index');
        await createOneUser();
        createRoles(3);

        //authToken = await user.generateAuthToken();
        //console.log(`Global Auth Token: ${authToken}`);
    });

    afterAll( async () => {

    });

    beforeEach(async () => {
        server.close();

        // Clean up database
        await Role.deleteMany();
        await User.deleteMany();
    });

    afterEach(async () => {

    });

    describe('POST /', () => {
        it('should associate one role with a user', async () => {
            let res = await request(server)
                .post('/api/userroles')
                .query({'userid': createdUserId})
                .query({'roleid': createdRoleId});

            expect(res.status).toBe(200);

            res = await request(server)
                .post('/api/userroles')
                .query({'userid': createdUserId})
                .query({'roleid': createdRoleId});

            expect(res.status).toBe(400);
        });

        it('should associate several roles with a user', async () => {
            let roleIdList = createRoles(3);

            let res = await request(server)
                .post('/api/userroles')
                .query({'userid': createdUserId})
                .query({'roleid': roleIdList});

            expect(res.status).toBe(200);
        });
    });
});

// ---------------------------------------------------------------

async function createOneUser() {
    let res = await request(server)
        .post('/api/users')
        .send(userInfo);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', userInfo.email);

    createdUserId = res.body._id;
}

// ---------------------------------------------------------------

async function createOneRole() {
    res = await request(server)
        .post('/api/roles')
        .send(roleInfo);

    createdRoleId = res.body._id;
}

// ---------------------------------------------------------------

async function createRoles(numRoles) {
    const roleInfoBase = {
        role: "samplerole-"
    }

    roleArray = new Array();

    for (let i = 0; i < numRoles; i++) {
        let oneRole = roleInfoBase;
        oneRole.role += i;

        let res = await request(server)
            .post('/api/roles')
            .send(oneRole);

        if (res.status === 200) {
            roleArray[i] = res.body;
        } else {
            throw `createRoles() error ${res.status}`;
        }
    }

    return roleIdList;
}