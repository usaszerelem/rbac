const request = require('supertest');
const {Role} = require('../models/roles');
const {User} = require('../models/users');

let server;

const userInfo = {
    email: "sample@user.com",
    password: "samplepassword"
}

let roleArray = [];
let createdUserId = 0;

describe('/api/userroles', () => {
    beforeAll( async () => {
        server = require ('../index');
        await createRoles(3);
    });

    afterAll( async () => {
        await Role.deleteMany();
        server.close();
    });

    beforeEach( async () => {
        await createOneUser();
    });

    afterEach(async () => {
        await User.deleteMany();
    });

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------

    describe('POST /', () => {
        it('should associate one role with a user', async () => {
            await associateOneRoleWithUser();

            res = await request(server)
                .post('/api/userroles')
                .query({'userid': createdUserId})
                .query({'roleid': roleArray[0]._id});

            expect(res.status).toBe(400);
        });

        it('should associate several roles with a user', async () => {
            await associateManyRolesWithUser();
        });
    });

    describe('GET /', () => {
        it('should validate that roles are associated with a user', async () => {
            let userObj = await associateManyRolesWithUser();

            expect(userObj.roles.length).toBe(3);
            expect(userObj.roles[0]).toBe(roleArray[0]._id);
            expect(userObj.roles[1]).toBe(roleArray[1]._id);
            expect(userObj.roles[2]).toBe(roleArray[2]._id);
        });
    });

    describe('DELETE /', () => {
        it('should validate that roles are removed from a user', async () => {
            let userObj = await associateManyRolesWithUser();

            expect(userObj.roles.length).toBe(3);

            userObj = await removeOneRoleFromUser(roleArray[2]._id);
            expect(userObj.roles.length).toBe(2);
            expect(userObj.roles[0]).toBe(roleArray[0]._id);
            expect(userObj.roles[1]).toBe(roleArray[1]._id);
        });
    });
});

// ---------------------------------------------------------------

async function removeOneRoleFromUser(roleId) {
    let res = await request(server)
        .delete('/api/userroles')
        .query({'userid': createdUserId})
        .query({'roleid': roleId});

    expect(res.status).toBe(200);
    return res.body;
}

// ---------------------------------------------------------------

async function associateOneRoleWithUser() {
    let res = await request(server)
        .post('/api/userroles')
        .query({'userid': createdUserId})
        .query({'roleid': roleArray[0]._id});

    expect(res.status).toBe(200);
}

// ---------------------------------------------------------------

async function associateManyRolesWithUser() {
    let roleIdList = "";
    
    for (let i = 0; i < roleArray.length; i++) {
        if (roleIdList.length > 0) {
            roleIdList += ",";
        }

        roleIdList += roleArray[i]._id;
    }

    let res = await request(server)
        .post('/api/userroles')
        .query({'userid': createdUserId})
        .query({'roleid': roleIdList});

    expect(res.status).toBe(200);
    return res.body;
}


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
}