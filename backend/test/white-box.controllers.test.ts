import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockTemplateService } = vi.hoisted(() => ({
  mockPrisma: {
    project: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
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
  mockTemplateService: {
    getBaseTemplateContent: vi.fn(),
    getTemplateFilesWithContent: vi.fn(),
  },
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: mockPrisma,
}));

vi.mock("../src/services/templateService.js", () => mockTemplateService);

import { createProject, getProject } from "../src/controllers/projectController.js";
import { createTemplateFile, listFiles } from "../src/controllers/fileController.js";

const logPass = (checkName: string) => {
  console.log(`PASS CHECK: ${checkName}`);
};

type MockRes = {
  statusCode: number;
  body: any;
  status: (code: number) => MockRes;
  json: (payload: any) => MockRes;
};

const makeRes = (): MockRes => {
  const res: MockRes = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

describe("White-box controller tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createProject stores null userId when blank string is provided", async () => {
    const req = {
      body: {
        name: "Project A",
        description: "desc",
        framework: "node",
        privacy: "public",
        userId: "   ",
      },
    } as any;
    const res = makeRes();

    mockPrisma.project.create.mockResolvedValue({ id: "p1", name: "Project A" });

    await createProject(req, res as any);

    expect(mockPrisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: null }),
      })
    );
    expect(res.statusCode).toBe(200);
    logPass("createProject sets userId=null when request has blank userId");
  });

  it("getProject returns 404 when project is absent", async () => {
    const req = { params: { id: "missing" } } as any;
    const res = makeRes();

    mockPrisma.project.findUnique.mockResolvedValue(null);

    await getProject(req, res as any);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
    logPass("getProject returns 404 for non-existent project id");
  });

  it("listFiles returns directories before files and sorts by name", async () => {
    const req = { query: { projectId: "p1", dirPath: "." } } as any;
    const res = makeRes();

    mockPrisma.file.findMany.mockResolvedValue([
      { path: "src", type: "FOLDER" },
      { path: "src/index.ts", type: "FILE" },
      { path: "README.md", type: "FILE" },
      { path: "a.txt", type: "FILE" },
    ]);

    await listFiles(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.files[0].type).toBe("directory");
    expect(res.body.files[0].name).toBe("src");
    expect(res.body.files[1].name).toBe("a.txt");
    expect(res.body.files[2].name).toBe("README.md");
    logPass("listFiles places directories first and sorts file names");
  });

  it("createTemplateFile returns 404 when template lookup fails", async () => {
    const req = {
      body: {
        moduleId: "unknown-module",
        fileType: "ts",
        projectId: "p1",
      },
    } as any;
    const res = makeRes();

    mockTemplateService.getBaseTemplateContent.mockRejectedValue(new Error("not found"));

    await createTemplateFile(req, res as any);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
    logPass("createTemplateFile returns 404 when template content is unavailable");
  });

  it("createTemplateFile builds fallback filename for unknown module id", async () => {
    const req = {
      body: {
        moduleId: "redis",
        fileType: "js",
        projectId: "p1",
      },
    } as any;
    const res = makeRes();

    mockTemplateService.getBaseTemplateContent.mockResolvedValue("module content");
    mockPrisma.file.upsert.mockResolvedValue({ id: "ok" });

    await createTemplateFile(req, res as any);

    expect(mockTemplateService.getBaseTemplateContent).toHaveBeenCalledWith("RedisSetup_JS.js");
    expect(mockPrisma.file.upsert).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    logPass("createTemplateFile uses fallback naming and upserts template file");
  });
});
