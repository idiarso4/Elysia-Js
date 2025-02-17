import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import DB from '../database/db';
import * as bcrypt from 'bcrypt';
import type { User } from '../types';

const JWT_SECRET = 'your-super-secret-key-change-this-in-production';

interface JWTPayload {
    id: string;
    username: string;
    role: string;
}

const authConfig = {
    name: 'auth',
    secret: JWT_SECRET
};

type JWTContext = {
    jwt: {
        sign: (payload: JWTPayload) => Promise<string>;
        verify: (token: string) => Promise<JWTPayload | null>;
    };
    headers: Record<string, string | undefined>;
};

export const auth = new Elysia()
    .use(jwt(authConfig))
    .derive(async ({ jwt, headers }: JWTContext) => {
        return {
            authorize: async (): Promise<JWTPayload> => {
                const authorization = headers.authorization;
                if (!authorization) throw new Error('No authorization header');

                const token = authorization.split(' ')[1];
                if (!token) throw new Error('No token provided');

                const payload = await jwt.verify(token);
                if (!payload) throw new Error('Invalid token');

                return payload;
            }
        };
    });

export async function validateUser(username: string, password: string): Promise<User> {
    const user = await DB.get<User>(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );

    if (!user) {
        throw new Error('User not found');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Invalid password');
    }

    return user;
}

interface AuthContext {
    authorize: () => Promise<JWTPayload>;
}

export function requireRole(roles: string[]) {
    return async ({ authorize }: AuthContext) => {
        try {
            const payload = await authorize();
            if (!roles.includes(payload.role)) {
                throw new Error('Unauthorized');
            }
        } catch (error) {
            throw new Error('Unauthorized');
        }
    };
}
