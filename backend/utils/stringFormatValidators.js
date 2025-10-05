import consts from "./consts.js";

/**
 * Detecta intentos de SQL Injection
 */
const detectSQLInjectionAttempt = (value) => {
    if (typeof value !== 'string') return false;
    if (value.length === 0) return false;

    for (const pattern of consts.SQL_INJECTION_PATTERNS) {
        if (pattern.test(value)) {
            return true;
        }
    }
    return false;
};

/**
 * Detecta intentos de XSS
 */
const detectXSSAttempt = (value) => {
    if (typeof value !== 'string') return false;
    if (value.length === 0) return false;

    for (const pattern of consts.XSS_PATTERNS) {
        if (pattern.test(value)) {
            return true;
        }
    }
    return false;
};

export {
    detectSQLInjectionAttempt,
    detectXSSAttempt
};
