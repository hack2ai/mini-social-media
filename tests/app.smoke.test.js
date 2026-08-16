require("dotenv").config();

const request = require("supertest");
const app = require("../app");

describe("Mini Social Media - API smoke regression", () => {
    test("GET /api/health returns a healthy API response", async () => {
        const response = await request(app)
            .get("/api/health")
            .expect(200);

        expect(response.body).toMatchObject({
            success: true,
            message: "API is healthy",
        });

        expect(response.body).toHaveProperty("timestamp");
        expect(response.body).toHaveProperty("environment");
    });

    test("GET / returns the frontend entry point", async () => {
        const response = await request(app)
            .get("/")
            .expect(200);

        expect(response.headers["content-type"]).toMatch(/text\/html/);
        expect(response.text).toContain("Mini Social");
    });

    test("protected notifications endpoint rejects missing authentication", async () => {
        const response = await request(app)
            .get("/api/notifications")
            .expect(401);

        expect(response.body).toMatchObject({
            success: false,
        });

        expect(response.body.message).toMatch(
            /authorization|access denied|token/i
        );
    });

    test("unknown API route returns JSON 404", async () => {
        const response = await request(app)
            .get("/api/does-not-exist")
            .expect(404);

        expect(response.body).toMatchObject({
            success: false,
            message: "API route not found.",
            method: "GET",
        });
    });

    test("Helmet security headers are present", async () => {
        const response = await request(app)
            .get("/api/health")
            .expect(200);

        expect(response.headers).toHaveProperty(
            "x-content-type-options",
            "nosniff"
        );
        expect(response.headers).toHaveProperty("x-frame-options");
    });
});