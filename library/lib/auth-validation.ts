// The sign-up and login rules. The browser uses them for instant messages and the
// server uses them again, because anything sent from a browser can't be trusted.

// Keyed by each input's name attribute.
export type FieldErrors = Record<string, string>;

const MAX_LENGTH = 200;
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readEmail(formData: FormData) {
  return text(formData, "email").trim().toLowerCase();
}

export function readLogin(formData: FormData) {
  return { email: readEmail(formData), password: text(formData, "password") };
}

export function readSignup(formData: FormData) {
  return {
    name: text(formData, "name").trim().replace(/\s+/g, " "),
    email: readEmail(formData),
    password: text(formData, "password"),
  };
}

function emailProblem(email: string) {
  if (!email) return "Please enter your email.";
  if (email.length > MAX_LENGTH || !EMAIL.test(email)) {
    return "Please enter a real email address, like name@example.com.";
  }
}

function nameProblem(name: string) {
  if (!name) return "Please enter your name.";
  if (name.length > MAX_LENGTH) return "That name is too long (200 characters at most).";
  if (!/\p{L}/u.test(name)) return "Your name needs at least one letter.";
}

function newPasswordProblem(password: string) {
  if (!password) return "Please enter a password.";
  if (password.length < 8) return "Your password needs at least 8 characters.";
  if (password.length > MAX_LENGTH) return "That password is too long (200 characters at most).";
  if (!/\p{L}/u.test(password) || !/\p{N}/u.test(password)) {
    return "Your password needs at least one letter and one number.";
  }
}

// Leaves out fields with no problem.
function onlyProblems(problems: Record<string, string | undefined>) {
  const errors: FieldErrors = {};
  for (const [field, problem] of Object.entries(problems)) {
    if (problem) errors[field] = problem;
  }
  return errors;
}

export function validateSignup(formData: FormData) {
  const { name, email, password } = readSignup(formData);
  return onlyProblems({
    name: nameProblem(name),
    email: emailProblem(email),
    password: newPasswordProblem(password),
  });
}

// Only checks a password was typed: the new-password rules mustn't lock out an
// account whose password was made before they existed.
export function validateLogin(formData: FormData) {
  const { email, password } = readLogin(formData);
  return onlyProblems({
    email: emailProblem(email),
    password: password ? undefined : "Please enter your password.",
  });
}
