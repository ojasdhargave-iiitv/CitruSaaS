import { type Request, type Response } from "express";
export declare const createFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createFolder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const saveFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loadProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listFiles: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTemplateFile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const initWorkspace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=fileController.d.ts.map