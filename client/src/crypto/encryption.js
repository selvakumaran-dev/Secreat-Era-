/**
 * End-to-End Encryption using Web Crypto API
 * AES-GCM 256-bit encryption
 */

/**
 * Generate a new encryption key
 */
export async function generateKey() {
    const key = await window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256
        },
        true, // extractable
        ['encrypt', 'decrypt']
    );

    return key;
}

/**
 * Export key to transferable format
 */
export async function exportKey(key) {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(exported));
}

/**
 * Import key from array
 */
export async function importKey(keyArray) {
    const key = await window.crypto.subtle.importKey(
        'raw',
        new Uint8Array(keyArray),
        {
            name: 'AES-GCM',
            length: 256
        },
        true,
        ['encrypt', 'decrypt']
    );

    return key;
}

/**
 * Encrypt data
 */
export async function encrypt(data, key) {
    // Generate a random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return combined.buffer;
}

/**
 * Decrypt data
 */
export async function decrypt(encryptedData, key) {
    const data = new Uint8Array(encryptedData);

    // Extract IV and encrypted content
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encrypted
    );

    return decrypted;
}

/**
 * Create encryption utilities for file transfer
 */
export function createEncryptionUtils(key) {
    return {
        encryptChunk: async (chunk) => {
            return await encrypt(chunk, key);
        },
        decryptChunk: async (chunk) => {
            return await decrypt(chunk, key);
        }
    };
}
