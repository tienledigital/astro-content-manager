// Function to generate a new AES-GCM key
export const generateCryptoKey = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Function to export a CryptoKey to a storable format (JWK)
export const exportCryptoKey = async (key: CryptoKey): Promise<JsonWebKey> => {
  return window.crypto.subtle.exportKey('jwk', key);
};

// Function to import a CryptoKey from a storable format (JWK)
export const importCryptoKey = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
};

// Function to encrypt data
export const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is recommended for AES-GCM
  const encodedData = new TextEncoder().encode(data);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  // Combine IV and encrypted data into a single buffer, then base64 encode
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
};

// Function to decrypt data
export const decryptData = async (encryptedBase64: string, key: CryptoKey): Promise<string> => {
  const combined = new Uint8Array(
    atob(encryptedBase64)
      .split('')
      .map(char => char.charCodeAt(0))
  );

  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decryptedBuffer);
};
