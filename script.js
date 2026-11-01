// ==========================================
// CONTACTHUB - CONTACT MANAGEMENT SYSTEM
// ==========================================

// DOM Elements
const contactsGrid = document.getElementById("contactsGrid");
const totalContacts = document.getElementById("totalContacts");
const favoriteContacts = document.getElementById("favoriteContacts");

const searchInput = document.getElementById("searchInput");

const contactModal = document.getElementById("contactModal");
const contactForm = document.getElementById("contactForm");

const addContactBtn = document.getElementById("addContactBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const modalTitle = document.getElementById("modalTitle");
const emptyState = document.getElementById("emptyState");

// Form Inputs
const contactId = document.getElementById("contactId");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactPhone = document.getElementById("contactPhone");
const contactCompany = document.getElementById("contactCompany");
const contactAddress = document.getElementById("contactAddress");
const contactFavorite = document.getElementById("contactFavorite");

// LocalStorage
const STORAGE_KEY = "contactHubContacts";

let contacts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = "all";


// ==========================================
// SAVE CONTACTS
// ==========================================

function saveContacts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}


// ==========================================
// GENERATE UNIQUE ID
// ==========================================

function generateId() {
    return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}


// ==========================================
// GENERATE AVATAR INITIALS
// ==========================================

function getInitials(name) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}


// ==========================================
// HTML ESCAPING
// ==========================================

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// ==========================================
// RENDER CONTACTS
// ==========================================

function renderContacts() {

    const searchTerm = searchInput.value.toLowerCase().trim();

    let filteredContacts = contacts.filter(contact => {

        const matchesSearch =
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm) ||
            contact.phone.toLowerCase().includes(searchTerm) ||
            (contact.company || "").toLowerCase().includes(searchTerm);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "favorites" && contact.favorite);

        return matchesSearch && matchesFilter;
    });

    contactsGrid.innerHTML = "";

    totalContacts.textContent = contacts.length;

    favoriteContacts.textContent =
        contacts.filter(contact => contact.favorite).length;

    if (filteredContacts.length === 0) {

        emptyState.style.display = "block";

        emptyState.querySelector("h3").textContent =
            contacts.length === 0
                ? "No contacts yet"
                : "No contacts found";

        emptyState.querySelector("p").textContent =
            contacts.length === 0
                ? "Add your first contact to get started."
                : "Try searching with a different keyword.";

        emptyAddBtn.style.display =
            contacts.length === 0 && currentFilter === "all"
                ? "inline-block"
                : "none";

        return;
    }

    emptyState.style.display = "none";

    filteredContacts.forEach(contact => {

        const card = document.createElement("div");

        card.className = "contact-card";

        card.innerHTML = `
            <div class="contact-card-top">

                <div class="contact-avatar">
                    ${escapeHTML(getInitials(contact.name))}
                </div>

                <div class="contact-info">
                    <h3>${escapeHTML(contact.name)}</h3>
                    <p>${escapeHTML(contact.company || "No company")}</p>
                </div>

                <span class="favorite-star">
                    ${contact.favorite ? "★" : ""}
                </span>

            </div>

            <div class="contact-details">
                <p>✉️ ${escapeHTML(contact.email)}</p>
                <p>📞 ${escapeHTML(contact.phone)}</p>
                <p>📍 ${escapeHTML(contact.address || "No address")}</p>
            </div>

            <div class="contact-actions">

                <button class="edit-btn" data-action="edit"
                    data-id="${escapeHTML(contact.id)}">
                    Edit
                </button>

                <button class="favorite-btn" data-action="favorite"
                    data-id="${escapeHTML(contact.id)}">
                    ${contact.favorite ? "Unfavorite" : "Favorite"}
                </button>

                <button class="delete-btn" data-action="delete"
                    data-id="${escapeHTML(contact.id)}">
                    Delete
                </button>

            </div>
        `;

        contactsGrid.appendChild(card);
    });
}


// ==========================================
// OPEN ADD CONTACT MODAL
// ==========================================

function openModal() {

    contactForm.reset();

    contactId.value = "";

    modalTitle.textContent = "Add New Contact";

    contactModal.classList.add("show");

    contactName.focus();
}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    contactModal.classList.remove("show");

    contactForm.reset();

    contactId.value = "";
}


// ==========================================
// ADD / UPDATE CONTACT
// ==========================================

contactForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const id = contactId.value;

    const name = contactName.value.trim();
    const email = contactEmail.value.trim().toLowerCase();
    const phone = contactPhone.value.trim();
    const company = contactCompany.value.trim();
    const address = contactAddress.value.trim();

    const favorite = contactFavorite.checked;

    // Validation
    if (!name || !email || !phone) {
        alert("Please fill all required fields.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    const duplicateEmail = contacts.find(contact =>
        contact.email.toLowerCase() === email &&
        contact.id !== id
    );

    if (duplicateEmail) {
        alert("This email address already exists!");
        return;
    }

    const existingIndex = contacts.findIndex(
        contact => contact.id === id
    );

    const contactData = {
        id: id || generateId(),
        name,
        email,
        phone,
        company,
        address,
        favorite
    };

    if (existingIndex !== -1) {

        contacts[existingIndex] = contactData;

        alert("Contact updated successfully!");

    } else {

        contacts.unshift(contactData);

        alert("Contact added successfully!");
    }

    saveContacts();

    renderContacts();

    closeModal();
});


// ==========================================
// EDIT CONTACT
// ==========================================

function editContact(id) {

    const contact = contacts.find(item => item.id === id);

    if (!contact) return;

    contactId.value = contact.id;

    contactName.value = contact.name;
    contactEmail.value = contact.email;
    contactPhone.value = contact.phone;
    contactCompany.value = contact.company || "";
    contactAddress.value = contact.address || "";
    contactFavorite.checked = contact.favorite;

    modalTitle.textContent = "Edit Contact";

    contactModal.classList.add("show");
}


// ==========================================
// DELETE CONTACT
// ==========================================

function deleteContact(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this contact?"
    );

    if (!confirmDelete) return;

    contacts = contacts.filter(contact => contact.id !== id);

    saveContacts();

    renderContacts();
}


// ==========================================
// TOGGLE FAVORITE
// ==========================================

function toggleFavorite(id) {

    contacts = contacts.map(contact => {

        if (contact.id === id) {

            return {
                ...contact,
                favorite: !contact.favorite
            };
        }

        return contact;
    });

    saveContacts();

    renderContacts();
}


// ==========================================
// CONTACT CARD BUTTON EVENTS
// ==========================================

contactsGrid.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        editContact(id);
    }

    if (action === "delete") {
        deleteContact(id);
    }

    if (action === "favorite") {
        toggleFavorite(id);
    }
});


// ==========================================
// SEARCH CONTACTS
// ==========================================

searchInput.addEventListener("input", renderContacts);


// ==========================================
// SIDEBAR FILTER
// ==========================================

document.querySelectorAll(".nav-item").forEach((item, index) => {

    item.addEventListener("click", function(event) {

        event.preventDefault();

        document.querySelectorAll(".nav-item").forEach(nav =>
            nav.classList.remove("active")
        );

        item.classList.add("active");

        currentFilter = index === 1 ? "favorites" : "all";

        renderContacts();
    });
});


// ==========================================
// MODAL EVENTS
// ==========================================

addContactBtn.addEventListener("click", openModal);

emptyAddBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);

contactModal.addEventListener("click", function(event) {

    if (event.target === contactModal) {
        closeModal();
    }
});

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeModal();
    }
});


// ==========================================
// JSON EXPORT
// ==========================================

function exportContacts() {

    if (contacts.length === 0) {
        alert("No contacts available to export.");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(contacts, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "contacthub-contacts.json";

    link.click();

    URL.revokeObjectURL(url);
}


// ==========================================
// JSON IMPORT
// ==========================================

function importContacts(event) {

    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
        alert("Please select a JSON file.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {

        try {

            const imported = JSON.parse(reader.result);

            if (!Array.isArray(imported)) {
                throw new Error("Invalid JSON format");
            }

            const validContacts = imported.filter(contact =>
                contact &&
                typeof contact.name === "string" &&
                typeof contact.email === "string" &&
                typeof contact.phone === "string"
            );

            if (validContacts.length === 0) {
                alert("No valid contacts found in this file.");
                return;
            }

            let addedCount = 0;

            validContacts.forEach(contact => {

                const exists = contacts.some(existing =>
                    existing.email.toLowerCase() ===
                    contact.email.toLowerCase()
                );

                if (!exists) {

                    contacts.push({
                        id: generateId(),
                        name: contact.name.trim(),
                        email: contact.email.trim().toLowerCase(),
                        phone: String(contact.phone),
                        company: contact.company || "",
                        address: contact.address || "",
                        favorite: Boolean(contact.favorite)
                    });

                    addedCount++;
                }
            });

            saveContacts();

            renderContacts();

            alert(`${addedCount} contacts imported successfully!`);

        } catch (error) {

            alert("Invalid JSON file. Please check the file format.");

        } finally {

            event.target.value = "";
        }
    };

    reader.readAsText(file);
}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

renderContacts();
// ==========================================
// IMPORT / EXPORT BUTTON EVENTS
// ==========================================

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

exportBtn.addEventListener("click", exportContacts);

importBtn.addEventListener("click", function() {
    importFile.click();
});

importFile.addEventListener("change", importContacts);

console.log("ContactHub initialized successfully!");