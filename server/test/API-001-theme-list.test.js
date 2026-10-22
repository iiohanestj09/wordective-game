// API-001: Return the seeded theme list.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import createApp from "../app";
const {
  connectApiTestDatabase,
  disconnectApiTestDatabase,
} = require("./apiTestHelpers");

describe("API-001 theme list", () => {
  beforeAll(connectApiTestDatabase);
  afterAll(disconnectApiTestDatabase);

  it("returns all six themes with their required fields", async () => {
    const response = await request(createApp()).get("/api/themes");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(6);
    for (const theme of response.body) {
      expect(theme.theme_id).toBeTruthy();
      expect(theme.theme_name).toEqual(expect.any(String));
      expect(theme.description).toEqual(expect.any(String));
    }
  });
});
