const DB_PASSWORD = process.env.DB_PASSWORD || '';

const consts = {
    apiPath: '/api',
    db: {
        host: 'localhost',
        port: 3306,
        name: 'proyecto2_cifrados',
        password: DB_PASSWORD,
        user: 'root',
    },
    cypherAlgorithms: {
        RSA: 'RSA',
        ECC: 'ECC',
    },
    SQL_INJECTION_PATTERNS: [
        /(?:^|\s)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\s+/i,
        /\b(EXEC|EXECUTE)\s*\(/i,
        /\s+UNION\s+(?:ALL\s+)?SELECT\s+/i,
        /\s+(OR|AND)\s+['"]?\w+['"]?\s*[=<>!]+\s*['"]?\w+['"]?/i,
        /\s+(OR|AND)\s+\d+\s*[=<>!]+\s*\d+/i,
        /['";]\s*(--|#)/,
        /;\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|UNION)\s+/i,
        /\b(?:SLEEP|BENCHMARK|WAITFOR|DELAY|LOAD_FILE)\s*\(/i,
        /['"]\s*(?:OR|AND)\s+['"]/i,
        /['"]\s*(?:OR|AND)\s+\d+\s*=/i,
        /['"]\s*(?:OR|AND)\s+/i,
        /\bSELECT\s+\*/i,
    ],
    XSS_PATTERNS: [
        /<script[\s>]/i,
        /<[^>]+\s+on\w+\s*=/i,
        /javascript\s*:/i,
        /data:text\/html/i,
        /<iframe[\s>]/i,
        /<(object|embed|applet|meta|link|base)[\s>]/i,
        /<svg[^>]*>[\s\S]*<script/i,
    ],
};
export default consts;