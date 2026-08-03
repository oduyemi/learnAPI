import crypto from "crypto";

export const generateTemporaryPassword = (length = 12): string => {
  if (length < 8) {
    throw new Error("Password length must be at least 8.");
  }

  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const special = "!@#$%&*_-";
  const all = uppercase + lowercase + numbers + special;
  const password = [
    uppercase[crypto.randomInt(uppercase.length)],
    lowercase[crypto.randomInt(lowercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    special[crypto.randomInt(special.length)],
  ];

  while (password.length < length) {
    password.push(all[crypto.randomInt(all.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
};