export interface UserRow {
    id: string;
    username: string;
    email: string;
    password: string;
    created_at: Date;
}
export declare const findUserByEmail: (email: string) => Promise<UserRow | null>;
export declare const findUserByUsername: (username: string) => Promise<UserRow | null>;
export declare const userExists: (username: string, email: string) => Promise<boolean>;
export declare const createUser: (username: string, email: string, hashedPassword: string) => Promise<UserRow>;
//# sourceMappingURL=User.d.ts.map