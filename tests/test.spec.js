const supertest = require("supertest");

const server = require("../api/server.js");
const db = require("../database/dbConfig");

//deletes the data within the database after ALL tests are completed, allowing to continue running tests without the need rollback or sed everytime

afterAll(async () => {
return db('users').truncate();
});

describe("server", function () {
//makes sure the tests work
it("runs the tests", function () {
    expect(true).toBe(true);
});
//sets the params for the req.body
let user = {
    username: "NewUser",
    password: "Password",
    token: ""
}

describe("POST api/auth/register", () => {
//makes sure the notNullable is working
    it("Return error when no username or password is given", () => {
        return supertest(server)
            .post("/api/auth/register")
            .send({
            })
            .then(res => {
                expect(res.status).toBe(500)
            })
    })
//ceates a new user to test register
    it("Create a new user", () => {
        return supertest(server)
            .post("/api/auth/register")
            .send({
                username: "john",
                password: "rossi"
            })
            .then(res => {
                expect(res.status).toBe(201)
            })
    })
})
//should fail if not logged in
it("pre-login testl", () => {
    return supertest(server)
            .get('/api/jokes')
            .set('Authorization', user.token)
            .then(res => {
                expect(res.status).toBe(400);
                
            })
})

describe("POST /api/auth/login", () => {
//should fail to login because of wrong password
    it("Return an error with invalid login and password", () => {
        return supertest(server)
            .post("/api/auth/login")
            .send({
                username: "John",
                password: "rossi1"
            })
            .then(res => {
                expect(res.body.message).toBe("Invalid credentials")
                expect(res.status).toBe(401)
            })
    })
//succeffful login should succed and pass a token to the user
    it("Successful login returns token", () => {
        return supertest(server)
                .post("/api/auth/login")
                .send({
                    username: "john",
                    password: "rossi"
                })
                .then(res => {
                    expect(res.status).toBe(200)
                    user.token = res.body.token
                })
    })

})

describe("GET /api/jokes", () => {
//tests the restriction middleware when no valid token is passed
    it("Cannot accesss without valid credentials", () => {
        return supertest(server)
                .get('/api/jokes')
                .then(res => {
                    expect(res.status).toBe(400)
                    expect(res.body.message).toBe("A authorization header token is required")
                })
    })
//allows access to jokes if valid token
    it("Return jokes when you authorization is successful", () => {
        return supertest(server)
                .get('/api/jokes')
                .set('Authorization', user.token)
                .then(res => {
                    expect(res.status).toBe(200);
                    expect((res.body).length).toBeGreaterThan(0)
                })
    })

})
})