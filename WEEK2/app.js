const form = document.getElementById("feedback-form");
const successMessage = document.getElementById("success");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const messageError = document.getElementById("message-error");

const STORAGE_KEY = "secure_feedback_entries";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const safeCharsPattern = /^[\w\s.,'"!?()\-@#:$%&/\\]*$/;

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateField(value, fieldName, maxLength) {
  if (!value.trim()) {
    return `${fieldName} is required.`;
  }
  if (value.length > maxLength) {
    return `${fieldName} must be under ${maxLength} characters.`;
  }
  if (!safeCharsPattern.test(value)) {
    return `${fieldName} contains unsafe characters.`;
  }
  if (/[<>]/.test(value)) {
    return `${fieldName} cannot include < or > characters.`;
  }
  return "";
}

function validate() {
  const nameValue = nameInput.value.trim();
  const emailValue = emailInput.value.trim();
  const messageValue = messageInput.value.trim();

  const nameMessage = validateField(nameValue, "Name", 60);
  const messageMessage = validateField(messageValue, "Message", 500);
  let emailMessage = "";

  if (!emailValue) {
    emailMessage = "Email is required.";
  } else if (!emailPattern.test(emailValue)) {
    emailMessage = "Enter a valid email address.";
  } else if (!safeCharsPattern.test(emailValue) || /[<>]/.test(emailValue)) {
    emailMessage = "Email contains unsafe characters.";
  }

  nameError.textContent = nameMessage;
  emailError.textContent = emailMessage;
  messageError.textContent = messageMessage;

  return !(nameMessage || emailMessage || messageMessage);
}

function getStoredFeedback() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFeedback(entry) {
  const feedback = getStoredFeedback();
  feedback.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  successMessage.textContent = "";

  if (!validate()) {
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    name: escapeHtml(nameInput.value.trim()),
    email: escapeHtml(emailInput.value.trim()),
    message: escapeHtml(messageInput.value.trim()),
    createdAt: new Date().toISOString(),
  };

  saveFeedback(entry);

  form.reset();
  successMessage.textContent = "Feedback submitted successfully.";
});
