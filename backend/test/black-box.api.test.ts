import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockGenerateProject, mockTemplateService } = vi.hoisted(() => ({
  mockPrisma: {
    project: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    file: {
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
  mockGenerateProject: vi.fn().mockResolvedValue(undefined),
  mockTemplateService: {
    getBaseTemplateContent: vi.fn().mockResolvedValue("template"),
    getTemplateFilesWithContent: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: mockPrisma,
}));

vi.mock("../src/services/generator_service.js", () => ({
  generateProject: mockGenerateProject,
}));

vi.mock("../src/services/templateService.js", () => mockTemplateService);

import app from "../src/app.js";

const logPass = (checkName: string) => {
  console.log(`PASS CHECK: ${checkName}`);
};

describe("Black-box API tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.findUnique.mockResolvedValue(null);

    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue(null);

    mockPrisma.file.findFirst.mockResolvedValue(null);
    mockPrisma.file.findMany.mockResolvedValue([]);
  });

  it("POST /api/projects returns 400 when name is missing", async () => {
    const res = await request(app).post("/api/projects").send({ description: "x" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name is required/i);
    logPass("POST /api/projects validates required name field");
  });

  it("POST /api/projects creates a project for valid payload", async () => {
    const payload = {
      id: "p1",
      name: "Black Box Project",
      description: "desc",
      framework: "node",
      privacy: "public",
      userId: null,
      createdAt: new Date().toISOString(),
    };

    mockPrisma.project.create.mockResolvedValue(payload);

    const res = await request(app).post("/api/projects").send({ name: "Black Box Project" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Black Box Project");
    logPass("POST /api/projects creates project for valid payload");
  });

  it("POST /api/users/signup returns 201 with token for valid input", async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: "u1",
      username: "bb_user",
      email: "bb_user@example.com",
      password: "hashed",
    });

    const res = await request(app)
      .post("/api/users/signup")
      .send({ username: "bb_user", email: "bb_user@example.com", password: "Pass@1234" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("bb_user@example.com");
    logPass("POST /api/users/signup returns token and user object for valid signup");
  });

  it("POST /api/users/login returns 400 when account does not exist", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "no-user@example.com", password: "Pass@1234" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no account found/i);
    logPass("POST /api/users/login rejects unknown account");
  });

  it("GET /api/users/auth/verify returns 401 without auth header", async () => {
    const res = await request(app).get("/api/users/auth/verify");

    expect(res.status).toBe(401);
    logPass("GET /api/users/auth/verify enforces auth header");
  });

  it("POST /api/files/create returns 400 when file already exists", async () => {
    mockPrisma.file.findFirst.mockResolvedValue({ id: "existing" });

    const res = await request(app)
      .post("/api/files/create")
      .send({ projectId: "p1", filePath: "backend/src/index.ts" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
    logPass("POST /api/files/create rejects duplicate file path");
  });

  it("GET /api/files/content returns 404 when file is missing", async () => {
    mockPrisma.file.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/files/content")
      .query({ projectId: "p1", filePath: "backend/src/missing.ts" });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
    logPass("GET /api/files/content returns 404 for missing file");
  });

  it("POST /api/users/login returns 200 for valid credentials", async () => {
    const hashed = await bcrypt.hash("Pass@1234", 6);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      username: "bb_user",
      email: "bb_user@example.com",
      password: hashed,
    });

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "bb_user@example.com", password: "Pass@1234" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    logPass("POST /api/users/login returns token for valid credentials");
  });

  it("POST /api/generate returns 400 for invalid config shape", async () => {
    const res = await request(app).post("/api/generate").send({ auth: "jwt" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
    logPass("POST /api/generate validates boilerplate schema and rejects invalid body");
  });
});
