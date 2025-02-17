import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import DB from '../database/db';
import * as bcrypt from 'bcrypt';

const authConfig = {
    name: 'auth',
    seed: 'your-secret-key'  // In production, use environment variable
};

export const auth = new Elysia()
    .use(jwt(authConfig))
    .derive(async ({ jwt, headers }) => {
        return {
            authorize: async () => {
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

export async function validateUser(username: string, password: string) {
    const user = await DB.get(
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

export function requireRole(roles: string[]) {
    return async ({ authorize }: any) => {
        const payload = await authorize();
        if (!roles.includes(payload.role)) {
            throw new Error('Unauthorized role');
        }
    };
}
