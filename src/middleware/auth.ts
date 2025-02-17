import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import type { JWTPayloadSpec } from '@elysiajs/jwt';
import DB from '../database/db';
import * as bcrypt from 'bcrypt';
import type { User } from '../types';

const JWT_SECRET = 'your-super-secret-key-change-this-in-production';

// Custom error classes for better error handling
export class AuthError extends Error {
    constructor(message: string, public status: number = 401) {
        super(message);
        this.name = 'AuthError';
    }
}

export class ValidationError extends Error {
    constructor(message: string, public status: number = 400) {
        super(message);
        this.name = 'ValidationError';
    }
}

interface JWTPayload extends Record<string, string | number> {
    id: string;
    username: string;
    role: 'admin' | 'teacher' | 'staff';
    iat?: number;
    exp?: number;
}

type ElysiaContext = {
    jwt: {
        sign: (payload: Record<string, string | number>) => Promise<string>;
        verify: (token: string) => Promise<unknown>;
    };
    headers: Record<string, string | undefined>;
    set: { status?: number };
};

const authConfig = {
    name: 'auth',
    secret: JWT_SECRET,
    exp: '7d'
};

export const auth = new Elysia({ name: 'auth' })
    .use(jwt(authConfig))
    .derive((context): { authorize: () => Promise<JWTPayload> } => {
        const { jwt, headers } = context as ElysiaContext;
        
        return {
            authorize: async (): Promise<JWTPayload> => {
                try {
                    const authorization = headers.authorization;
                    if (!authorization) {
                        throw new AuthError('No authorization header');
                    }

                    const [scheme, token] = authorization.split(' ');
                    if (scheme !== 'Bearer' || !token) {
                        throw new AuthError('Invalid authorization format');
                    }

                    const payload = await jwt.verify(token);
                    if (!payload || typeof payload !== 'object') {
                        throw new AuthError('Invalid token');
                    }

                    // Type guard for JWT payload
                    if (!isJWTPayload(payload)) {
                        throw new AuthError('Invalid token payload');
                    }

                    return payload;
                } catch (error) {
                    if (error instanceof AuthError) {
                        throw error;
                    }
                    throw new AuthError('Authentication failed');
                }
            }
        };
    });

// Type guard for JWT payload
function isJWTPayload(payload: unknown): payload is JWTPayload {
    if (!payload || typeof payload !== 'object') return false;
    
    const { id, username, role } = payload as any;
    return (
        typeof id === 'string' &&
        typeof username === 'string' &&
        (role === 'admin' || role === 'teacher' || role === 'staff')
    );
}

export async function validateUser(username: string, password: string): Promise<User> {
    if (!username || !password) {
        throw new ValidationError('Username and password are required');
    }

    const user = await DB.get<User>(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );

    if (!user) {
        throw new ValidationError('User not found');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new ValidationError('Invalid password');
    }

    return user;
}

interface AuthContext {
    authorize: () => Promise<JWTPayload>;
}

export function requireRole(roles: ('admin' | 'teacher' | 'staff')[]) {
    return async ({ authorize }: AuthContext) => {
        try {
            const payload = await authorize();
            if (!roles.includes(payload.role)) {
                throw new AuthError(`Required role: ${roles.join(' or ')}`);
            }
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            throw new AuthError('Authorization failed');
        }
    };
}
