document.addEventListener("DOMContentLoaded", function () {
  const authForm = document.getElementById("auth-form");
  const registerBtn = document.getElementById("register-btn");

  const authSection = document.getElementById("auth-section");
  const dashboardSection = document.getElementById("dashboard-section");

  const memberUI = document.getElementById("member-ui");
  const librarianUI = document.getElementById("librarian-ui");
  const dashboardTitle = document.getElementById("dashboard-title");

  const menuItems = document.getElementById("menu-items");
  const dashboardContent = document.getElementById("dashboard-content");

  let currentRole = null;

  const books = [
    {
      title: "The Great Gatsby",
      imageUrl: "https://via.placeholder.com/150x200?text=Gatsby",
      available: true,
      dueDate: null,
    },
    {
      title: "1984",
      imageUrl: "https://via.placeholder.com/150x200?text=1984",
      available: false,
      dueDate: "2025-05-12",
    },
    {
      title: "Harry Potter",
      imageUrl: "https://via.placeholder.com/150x200?text=Harry+Potter",
      available: true,
      dueDate: null,
    },
  ];

  authForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const role = document.getElementById("auth-role").value;
    currentRole = role;
    showDashboard(role);
  });

  registerBtn.addEventListener("click", function () {
    alert("Registration not implemented.");
  });

  function showDashboard(role) {
    authSection.classList.add("d-none");
    dashboardSection.classList.remove("d-none");

    memberUI.classList.add("d-none");
    librarianUI.classList.add("d-none");

    menuItems.innerHTML = "";
    dashboardContent.innerHTML = "";

    if (role === "librarian") {
      dashboardTitle.textContent = "Librarian Dashboard";
      librarianUI.classList.remove("d-none");

      addMenu("Add Book", addBookUI);
      addMenu("View All Books", () => showBooks(books));
      addMenu("View Available Books", () =>
        showBooks(books.filter((b) => b.available))
      );
      addMenu("Search by Title", searchBookUI);
      addMenu("See Due Dates", showDueDates);
      addMenu("Show Late Fees", showLateFees);
      addMenu("Logout", logout);
    } else {
      dashboardTitle.textContent = "Member Dashboard";
      memberUI.classList.remove("d-none");

      addMenu("View All Books", () => showBooks(books));
      addMenu("Borrow Books", borrowBookUI);
      addMenu("Return Books", returnBookUI);
      addMenu("My Borrowed Books", showBorrowedBooks);
      addMenu("Search by Title", searchBookUI);
      addMenu("Late Fees & Pay", showLateFees);
      addMenu("Logout", logout);
    }
  }

  function addMenu(label, action) {
    const li = document.createElement("li");
    li.className = "nav-item sidebar-item px-3 py-2";
    li.textContent = label;
    li.addEventListener("click", () => {
      dashboardContent.innerHTML = "";
      action();
    });
    menuItems.appendChild(li);
  }

  function showBooks(bookList) {
    dashboardContent.innerHTML = "";

    bookList.forEach((book, index) => {
      const col = document.createElement("div");
      col.className = "col";

      const card = document.createElement("div");
      card.className = "card book-card shadow-sm";

      const img = document.createElement("img");
      img.className = "card-img-top book-cover";
      img.src = book.imageUrl || "https://via.placeholder.com/150x200";
      img.alt = book.title;

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";

      const title = document.createElement("h5");
      title.className = "card-title";
      title.textContent = book.title;

      cardBody.appendChild(title);

      if (book.dueDate) {
        const due = document.createElement("p");
        due.textContent = `Due: ${book.dueDate}`;
        cardBody.appendChild(due);
      }

      if (currentRole === "librarian") {
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-outline-primary me-2";
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editBook(index);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-outline-danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {
          if (confirm(`Delete "${book.title}"?`)) {
            books.splice(index, 1);
            showBooks(books);
          }
        };

        cardBody.appendChild(editBtn);
        cardBody.appendChild(deleteBtn);
      }

      card.appendChild(img);
      card.appendChild(cardBody);
      col.appendChild(card);
      dashboardContent.appendChild(col);
    });
  }

  function editBook(index) {
    const book = books[index];
    dashboardContent.innerHTML = `
      <h5>Edit Book</h5>
      <form id="edit-form">
        <div class="mb-3">
          <input class="form-control" id="edit-title" value="${book.title}" />
        </div>
        <div class="mb-3">
          <input class="form-control" id="edit-img" value="${book.imageUrl}" />
        </div>
        <div class="mb-3">
          <input class="form-control" id="edit-date" type="date" value="${book.dueDate || ""}" />
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="edit-available" ${book.available ? "checked" : ""
      } />
          <label class="form-check-label" for="edit-available">Available</label>
        </div>
        <button class="btn btn-success" type="submit">Update</button>
      </form>
    `;

    document.getElementById("edit-form").addEventListener("submit", (e) => {
      e.preventDefault();
      book.title = document.getElementById("edit-title").value;
      book.imageUrl = document.getElementById("edit-img").value;
      book.dueDate = document.getElementById("edit-date").value || null;
      book.available = document.getElementById("edit-available").checked;
      alert("Book updated.");
      showBooks(books);
    });
  }

  function addBookUI() {
    const form = document.createElement("form");
    form.innerHTML = `
      <h5>Add a New Book</h5>
      <div class="mb-3">
        <input class="form-control" id="new-book-title" placeholder="Book Title" required />
      </div>
      <div class="mb-3">
        <input class="form-control" id="new-book-img" placeholder="Image URL (optional)" />
      </div>
      <button type="submit" class="btn btn-success">Add Book</button>
    `;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const title = document.getElementById("new-book-title").value.trim();
      const imageUrl = document.getElementById("new-book-img").value.trim();
      if (title) {
        books.push({ title, imageUrl, available: true, dueDate: null });
        alert(`Book "${title}" added.`);
        showBooks(books);
      }
    });
    dashboardContent.appendChild(form);
  }

  function searchBookUI() {
    const input = document.createElement("input");
    input.className = "form-control mb-3";
    input.placeholder = "Enter book title to search...";
    input.addEventListener("input", () => {
      const searchTerm = input.value.toLowerCase();
      const results = books.filter((b) =>
        b.title.toLowerCase().includes(searchTerm)
      );
      showBooks(results);
    });
    dashboardContent.appendChild(input);
  }

  function showDueDates() {
    const list = books
      .filter((b) => b.dueDate)
      .map((b) => `<li>${b.title} - Due: ${b.dueDate}</li>`)
      .join("");
    dashboardContent.innerHTML = `<ul>${list || "No due books."}</ul>`;
  }

  function showLateFees() {
    const today = new Date().toISOString().split("T")[0];
    const lateBooks = books.filter((b) => b.dueDate && b.dueDate < today);
    if (lateBooks.length === 0) {
      dashboardContent.innerHTML = "<p>No late books.</p>";
      return;
    }
    const list = lateBooks
      .map((b) => `<li>${b.title} - Late Fee: Rs. 100</li>`)
      .join("");
    dashboardContent.innerHTML = `<ul>${list}</ul>`;
  }

  function borrowBookUI() {
    const available = books.filter((b) => b.available);
    if (available.length === 0) {
      dashboardContent.innerHTML = "<p>No books available to borrow.</p>";
      return;
    }
    available.forEach((book, index) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-primary m-2";
      btn.textContent = `Borrow "${book.title}"`;
      btn.onclick = () => {
        book.available = false;
        book.dueDate = getFutureDate(7); // due in 7 days
        alert(`You borrowed "${book.title}"`);
        showBooks(books);
      };
      dashboardContent.appendChild(btn);
    });
  }

  function returnBookUI() {
    const borrowed = books.filter((b) => !b.available);
    if (borrowed.length === 0) {
      dashboardContent.innerHTML = "<p>No borrowed books to return.</p>";
      return;
    }
    borrowed.forEach((book) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-success m-2";
      btn.textContent = `Return "${book.title}"`;
      btn.onclick = () => {
        book.available = true;
        book.dueDate = null;
        alert(`Returned "${book.title}"`);
        showBooks(books);
      };
      dashboardContent.appendChild(btn);
    });
  }

  function showBorrowedBooks() {
    const borrowed = books.filter((b) => !b.available);
    if (borrowed.length === 0) {
      dashboardContent.innerHTML = "<p>You have no borrowed books.</p>";
    } else {
      showBooks(borrowed);
    }
  }

  function logout() {
    if (confirm("Are you sure you want to logout?")) {
      location.reload();
    }
  }

  function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }
});
