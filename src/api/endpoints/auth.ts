const AUTH_BASE = '/auth';

export const authEndpoints = {
    login: `${AUTH_BASE}/login`,
    register: `${AUTH_BASE}/register`,
    refresh: `${AUTH_BASE}/refresh`,
    me: `${AUTH_BASE}/me`,
    validateInvite: (code: string) => `${AUTH_BASE}/validate-invite/${code}`,
    invites: {
        list: `${AUTH_BASE}/invites`,
        create: `${AUTH_BASE}/invites`,
    },
};
