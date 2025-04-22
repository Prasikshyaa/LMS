let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || [];
let books = JSON.parse(localStorage.getItem("books")) || [];

function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function renderSidebar() {
  const sidebar = document.getElementById("menu-items");
  sidebar.innerHTML = "";

  if (!currentUser) return;

  const isLibrarian = currentUser.role === "librarian";
  const menu = isLibrarian
    ? [
        "Add Book",
        "View All Books",
        "View Available Books",
        "Search by Title",
        "See Due Dates",
        "Show Late Fees",
        "Logout",
      ]
    : [
        "View All Books",
        "Borrow Books",
        "Return Books",
        "My Borrowed Books",
        "Search by Title",
        "Late Fees & Pay",
        "Logout",
      ];

  menu.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => handleMenuClick(item);
    sidebar.appendChild(li);
  });
}

function handleMenuClick(item) {
  const content = document.getElementById("dashboard-content");
  const title = document.getElementById("dashboard-title");
  document.getElementById("member-ui").classList.add("hidden");
  document.getElementById("librarian-ui").classList.add("hidden");

  if (item === "Logout") return logout();

  if (item === "Add Book") return showAddBookForm();
  if (item === "Edit Books") return showEditBooks();
  if (item === "Remove Books") return showRemoveBooks();
  if (item === "View All Books") return renderBooks(books);
  if (item === "View Available Books")
    return renderBooks(books.filter((b) => !b.borrowedBy));
  if (item === "Search by Title") {
    if (currentUser.role === "member")
      document.getElementById("member-ui").classList.remove("hidden");
    else document.getElementById("librarian-ui").classList.remove("hidden");
    return;
  }
  if (item === "See Due Dates") return showDueDates();
  if (item === "Show Late Fees") return showLateFees();

  if (item === "Borrow Books")
    return renderBooks(books.filter((b) => !b.borrowedBy), true);
  if (item === "Return Books") return showReturnBooks();
  if (item === "My Borrowed Books") return showMyBorrowedBooks();
  if (item === "Late Fees & Pay") return showLateFees(true);

  title.textContent = item;
}

function renderBooks(list, canBorrow = false) {
  const content = document.getElementById("dashboard-content");
  content.innerHTML = "";
  document.getElementById("dashboard-title").textContent = "Books";

  list.forEach((book, i) => {
    const card = document.createElement("div");
    card.className = "book-card";

    const image = document.createElement("img");
    image.src = book.cover || "https://via.placeholder.com/150x220";
    card.appendChild(image);

    card.innerHTML += `
      <h3>${book.title}</h3>
      <p>Author: ${book.author}</p>
      <p>Genre: ${book.genre || "N/A"}</p>
      <p>Rating: ${book.rating || "Unrated"}</p>
      <p>${book.MostRead ? "🔥 MostRead" : ""}</p>
    `;

    if (canBorrow) {
      const btn = document.createElement("button");
      btn.className = "borrow-btn";
      btn.textContent = "Borrow";
      btn.onclick = () => borrowBook(i);
      card.appendChild(btn);
    }

    if (currentUser.role === "librarian") {
      const edit = document.createElement("button");
      edit.className = "edit-btn";
      edit.textContent = "Edit";
      edit.onclick = () => editBook(i);
      card.appendChild(edit);

      const del = document.createElement("button");
      del.className = "delete-btn";
      del.textContent = "Delete";
      del.onclick = () => removeBook(i);
      card.appendChild(del);
    }

    if (currentUser.role === "member") {
      const rate = document.createElement("button");
      rate.className = "rate-btn";
      rate.textContent = "Rate";
      rate.onclick = () => rateBook(i);
      card.appendChild(rate);
    }

    content.appendChild(card);
  });
}

function showAddBookForm() {
  const content = document.getElementById("dashboard-content");
  content.innerHTML = `
    <h3>Add New Book</h3>
    <form id="add-form">
      <input placeholder="Title" required />
      <input placeholder="Author" required />
      <input placeholder="Genre" />
      <input placeholder="Cover Image URL" />
      <label><input type="checkbox" id="MostRead-check" /> MostRead</label>
      <button type="submit">Add Book</button>
      <button type="button" onclick="handleCancel()">Cancel</button>
    </form>
  `;

  const form = document.getElementById("add-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    const [title, author, genre, cover] = form.querySelectorAll("input");
    if (!title.value || !author.value) return alert("Title & Author required");
    books.push({
      title: title.value,
      author: author.value,
      genre: genre.value,
      cover: cover.value,
      MostRead: document.getElementById("MostRead-check").checked,
    });
    saveBooks();
    renderBooks(books);
  };
}

function editBook(i) {
  const book = books[i];
  const content = document.getElementById("dashboard-content");
  content.innerHTML = `
    <h3>Edit Book</h3>
    <form id="edit-form">
      <input placeholder="Title" value="${book.title}" />
      <input placeholder="Author" value="${book.author}" />
      <input placeholder="Genre" value="${book.genre}" />
      <input placeholder="Cover URL" value="${book.cover}" />
       <label><input type="checkbox" id="mostReadCheckbox"> Mark as Most Read</label>
      <button type="submit">Save</button>
      <button type="button" onclick="handleCancel()">Cancel</button>
    </form>
  `;
  document.getElementById("edit-form").onsubmit = (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll("#edit-form input");
    books[i] = {
      title: inputs[0].value,
      author: inputs[1].value,
      genre: inputs[2].value,
      cover: inputs[3].value,
      MostRead: inputs[4].checked,
    };
    saveBooks();
    renderBooks(books);
  };
}

function removeBook(i) {
  if (confirm("Are you sure to delete this book?")) {
    books.splice(i, 1);
    saveBooks();
    renderBooks(books);
  }
}

function borrowBook(i) {
  const book = books[i];
  if (!book || book.borrowedBy) return;
  const due = new Date();
  due.setDate(due.getDate() + 14);
  books[i].borrowedBy = currentUser.username;
  books[i].due = due.toISOString();
  saveBooks();
  renderBooks(books.filter((b) => !b.borrowedBy), true);
}

function showReturnBooks() {
  const borrowed = books.filter((b) => b.borrowedBy === currentUser.username);
  renderBooks(borrowed);
  const cards = document.querySelectorAll(".book-card");
  cards.forEach((card, idx) => {
    const btn = document.createElement("button");
    btn.textContent = "Return";
    btn.className = "return-btn";
    btn.onclick = () => {
      books = books.map((b, i) =>
        b.borrowedBy === currentUser.username && idx === i
          ? { ...b, borrowedBy: null, due: null }
          : b
      );
      saveBooks();
      showReturnBooks();
    };
    card.appendChild(btn);
  });
}

function rateBook(i) {
  const rating = prompt("Rate this book (1-5):");
  if (!rating || isNaN(rating)) return;
  books[i].rating = `${rating}/5`;
  saveBooks();
  renderBooks(books);
}

function showMyBorrowedBooks() {
  const myBooks = books.filter((b) => b.borrowedBy === currentUser.username);
  renderBooks(myBooks);
}

function showLateFees(pay = false) {
  const today = new Date();
  const borrowed = books.filter((b) => b.borrowedBy === currentUser.username);
  const content = document.getElementById("dashboard-content");
  content.innerHTML = "<h3>Late Fees</h3>";

  borrowed.forEach((b) => {
    const due = new Date(b.due);
    const daysLate = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    const fee = daysLate > 0 ? daysLate * 2 : 0;

    const div = document.createElement("div");
    div.textContent = `${b.title} – Late: ${daysLate > 0 ? daysLate : 0} days – Fee: ₹${fee}`;
    if (fee > 0 && pay) {
      const btn = document.createElement("button");
      btn.textContent = "Pay ₹" + fee;
      btn.onclick = () => alert("Paid!");
      div.appendChild(btn);
    }
    content.appendChild(div);
  });
}

function showDueDates() {
  const content = document.getElementById("dashboard-content");
  content.innerHTML = "<h3>Due Books</h3>";

  books.forEach((b) => {
    if (b.borrowedBy) {
      const div = document.createElement("div");
      div.textContent = `${b.title} borrowed by ${b.borrowedBy} – Due: ${new Date(
        b.due
      ).toLocaleDateString()}`;
      content.appendChild(div);
    }
  });
}

function handleCancel() {
  renderBooks(books);
}

function logout() {
  currentUser = null;
  document.getElementById("dashboard-section").classList.add("hidden");
  document.getElementById("auth-section").classList.remove("hidden");
}
document.getElementById("sidebar").style.display = "none";

document.getElementById("auth-form").onsubmit = function (e) {
  e.preventDefault();
  const username = document.getElementById("auth-username").value;
  const password = document.getElementById("auth-password").value;
  const role = document.getElementById("auth-role").value;
  const user = users.find((u) => u.username === username && u.password === password && u.role === role);
  if (!user) return alert("Invalid credentials");
  currentUser = user;
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
  document.getElementById("sidebar").style.display = "block";

  renderSidebar();
  handleMenuClick("View All Books");
};

document.getElementById("register-btn").onclick = () => {
  const username = document.getElementById("auth-username").value;
  const password = document.getElementById("auth-password").value;
  const role = document.getElementById("auth-role").value;
  if (users.find((u) => u.username === username))
    return alert("Username already exists");
  users.push({ username, password, role });
  saveUsers();
  alert("Registered! You can now log in.");
};

document.getElementById("search-input").oninput = function () {
  const term = this.value.toLowerCase();
  const results = books.filter(
    (b) => b.title.toLowerCase().includes(term) && !b.borrowedBy
  );
  renderBooks(results, true);
};

document.getElementById("librarian-search").oninput = function () {
  const term = this.value.toLowerCase();
  const results = books.filter((b) => b.title.toLowerCase().includes(term));
  renderBooks(results);
};
