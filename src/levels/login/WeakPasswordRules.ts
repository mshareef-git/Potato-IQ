export const COMMON_WEAK_PASSWORDS = [
  "password",
  "12345",
  "123456",
  "qwerty",
  "abc123",
  "admin",
  "0000",
  "1111",
  "111111",
  "abcd",
  "dogesh",
  "potato",
  "guest",
  "login"
];

export function isPasswordAccepted(password: string): { accepted: boolean; reason: string } {
  const trimmed = password.trim();
  if (!trimmed) {
    return { accepted: false, reason: "A password is required, even a terrible one." };
  }

  // Allowed if <= 4 characters
  if (trimmed.length <= 4) {
    return { accepted: true, reason: "Password strength: wet tissue. Perfect." };
  }

  // Allowed if in common weak list
  if (COMMON_WEAK_PASSWORDS.includes(trimmed.toLowerCase())) {
    return { accepted: true, reason: "That password could be cracked by a toaster. Welcome." };
  }

  // Otherwise rejected for being too strong!
  return {
    accepted: false,
    reason: "Too strong! This is an IQ test, not a bank. Make it weaker."
  };
}
