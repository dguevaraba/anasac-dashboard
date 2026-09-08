/**
 * Supabase PKCE necesita crypto.subtle.digest (SHA-256).
 * Hermes/Expo Go no lo traen → sin polyfill usa "plain" y Google falla.
 */
import * as ExpoCrypto from "expo-crypto";

function resolveDigestAlgorithm(algorithm: AlgorithmIdentifier) {
  const name =
    typeof algorithm === "string"
      ? algorithm
      : ((algorithm as { name?: string }).name ?? "SHA-256");

  switch (name.toUpperCase()) {
    case "SHA-1":
      return ExpoCrypto.CryptoDigestAlgorithm.SHA1;
    case "SHA-256":
    case "SHA256":
      return ExpoCrypto.CryptoDigestAlgorithm.SHA256;
    case "SHA-384":
      return ExpoCrypto.CryptoDigestAlgorithm.SHA384;
    case "SHA-512":
      return ExpoCrypto.CryptoDigestAlgorithm.SHA512;
    default:
      return ExpoCrypto.CryptoDigestAlgorithm.SHA256;
  }
}

function ensureCryptoObject(): {
  getRandomValues: typeof ExpoCrypto.getRandomValues;
  randomUUID: typeof ExpoCrypto.randomUUID;
  subtle: {
    digest: (
      algorithm: AlgorithmIdentifier,
      data: BufferSource,
    ) => Promise<ArrayBuffer>;
  };
} {
  const root = globalThis as typeof globalThis & { crypto?: Record<string, unknown> };

  if (!root.crypto || typeof root.crypto !== "object") {
    Object.defineProperty(root, "crypto", {
      value: {},
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  const cryptoObj = root.crypto as {
    getRandomValues?: typeof ExpoCrypto.getRandomValues;
    randomUUID?: typeof ExpoCrypto.randomUUID;
    subtle?: {
      digest?: (
        algorithm: AlgorithmIdentifier,
        data: BufferSource,
      ) => Promise<ArrayBuffer>;
    };
  };

  if (typeof cryptoObj.getRandomValues !== "function") {
    cryptoObj.getRandomValues = ExpoCrypto.getRandomValues;
  }
  if (typeof cryptoObj.randomUUID !== "function") {
    cryptoObj.randomUUID = ExpoCrypto.randomUUID;
  }
  if (typeof cryptoObj.subtle?.digest !== "function") {
    cryptoObj.subtle = {
      digest: (algorithm, data) =>
        ExpoCrypto.digest(resolveDigestAlgorithm(algorithm), data),
    };
  }

  return cryptoObj as ReturnType<typeof ensureCryptoObject>;
}

export function installWebCryptoPolyfill() {
  const cryptoObj = ensureCryptoObject();

  // Hermes a veces resuelve el identificador libre `crypto` desde `global`.
  const g = global as typeof globalThis & { crypto?: unknown };
  try {
    Object.defineProperty(g, "crypto", {
      get: () => cryptoObj,
      set: () => undefined,
      configurable: true,
      enumerable: true,
    });
  } catch {
    g.crypto = cryptoObj;
  }

  // btoa lo usa auth-js para el code_challenge
  if (typeof globalThis.btoa !== "function") {
    globalThis.btoa = (value: string) => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let output = "";
      let i = 0;
      while (i < value.length) {
        const a = value.charCodeAt(i++);
        const b = i < value.length ? value.charCodeAt(i++) : Number.NaN;
        const c = i < value.length ? value.charCodeAt(i++) : Number.NaN;
        const bitmap =
          (a << 16) |
          ((Number.isNaN(b) ? 0 : b) << 8) |
          (Number.isNaN(c) ? 0 : c);
        output +=
          chars.charAt((bitmap >> 18) & 63) +
          chars.charAt((bitmap >> 12) & 63) +
          (Number.isNaN(b) ? "=" : chars.charAt((bitmap >> 6) & 63)) +
          (Number.isNaN(c) ? "=" : chars.charAt(bitmap & 63));
      }
      return output;
    };
  }
}

installWebCryptoPolyfill();
