const request = require('supertest');
const {Role} = require('../models/roles');
const {User} = require('../models/users');

let server;

const userInfo = {
    email: "sample@user.com",
    password: "samplepassword"
}

let createdUserId = null;

const roleInfo = {
    role: "samplerole"
}

let createdRoleId = null;

describe('/api/roles', () => {
    /*
    beforeAll( async () => {
        const user = new User({});
        authToken = await user.generateAuthToken();
        console.log(`Global Auth Token: ${authToken}`);
    });
    */

    beforeEach(async () => {
        server = require ('../index');
        await createOneUser();
        await createOneRole();
    });

    afterEach(async () => {
        server.close();

        // Clean up database
        await Role.deleteMany();
        await User.deleteMany();
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

    let roleIdList = "";

    for (let i = 0; i < numRoles; i++) {
        let oneRole = roleInfoBase;
        oneRole.role += i;

        let res = await request(server)
            .post('/api/roles')
            .send(oneRole);

        if (res.status === 200) {
            if (roleIdList.length > 0) {
                roleIdList += ',';
            }

            roleIdList += res.body._id;
        } else {
            throw `createRoles() error ${res.status}`;
        }
    }

    return roleIdList;
}