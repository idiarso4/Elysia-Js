import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        role?: string;
        token?: string;
    }
    
    interface Session {
        user: User & {
            role?: string;
            token?: string;
        };
    }
}
