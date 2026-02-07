const STORAGE_KEY = "secure_feedback_entries";
const ENTRIES_PER_PAGE = 4;

const listContainer = document.getElementById("feedback-list");
const pagination = document.getElementById("pagination");

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

function renderList(page) {
  const feedback = getStoredFeedback();
  const totalPages = Math.max(1, Math.ceil(feedback.length / ENTRIES_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  listContainer.innerHTML = "";

  if (feedback.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No feedback has been submitted yet.";
    listContainer.appendChild(empty);
    pagination.innerHTML = "";
    return;
  }

  const start = (currentPage - 1) * ENTRIES_PER_PAGE;
  const entries = feedback.slice(start, start + ENTRIES_PER_PAGE);

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "feedback-row";

    const title = document.createElement("h3");
    title.textContent = entry.name;

    const email = document.createElement("p");
    email.textContent = entry.email;

    const message = document.createElement("p");
    message.textContent = entry.message;

    const meta = document.createElement("div");
    meta.className = "feedback-meta";
    const date = new Date(entry.createdAt);
    meta.textContent = `Submitted on ${date.toLocaleString()}`;

    row.appendChild(title);
    row.appendChild(email);
    row.appendChild(message);
    row.appendChild(meta);
    listContainer.appendChild(row);
  });

  renderPagination(totalPages, currentPage);
}

function renderPagination(totalPages, currentPage) {
  pagination.innerHTML = "";

  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-btn";
    if (page === currentPage) {
      button.classList.add("active");
    }
    button.textContent = page;
    button.addEventListener("click", () => renderList(page));
    pagination.appendChild(button);
  }
}

renderList(1);
