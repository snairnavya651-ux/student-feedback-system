const form = document.getElementById("feedbackForm");
const stars = document.querySelectorAll(".star");
const ratingLabel = document.getElementById("ratingLabel");
const message = document.getElementById("message");
const feedbackList = document.getElementById("feedbackList");
const searchInput = document.getElementById("searchInput");
const ratingFilter = document.getElementById("ratingFilter");

let selectedRating = 0;
let feedbacks = [];

const ratingNames = [
    "Poor",
    "Fair",
    "Good",
    "Very Good",
    "Excellent"
];

// Select a star rating
stars.forEach(function (star) {
    star.addEventListener("click", function () {
        selectedRating = Number(star.dataset.rating);
        updateStars();

        ratingLabel.textContent =
            selectedRating + " / 5 - " +
            ratingNames[selectedRating - 1];
    });
});

// Display selected stars
function updateStars() {
    stars.forEach(function (star) {
        const rating = Number(star.dataset.rating);

        star.classList.toggle(
            "active",
            rating <= selectedRating
        );

        star.setAttribute(
            "aria-pressed",
            String(rating === selectedRating)
        );
    });
}

// Display success or error message
function showMessage(text, success) {
    message.textContent = text;
    message.className = success ? "success" : "error";
}

// Submit feedback form
form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (selectedRating === 0) {
        showMessage("Please select a teaching rating.", false);
        return;
    }

    const feedback = {
        name: document.getElementById("studentName").value.trim(),
        roll: document.getElementById("rollNumber").value.trim(),
        department: document.getElementById("department").value,
        semester: document.getElementById("semester").value,
        subject: document.getElementById("subject").value,
        faculty: document.getElementById("faculty").value.trim(),
        rating: selectedRating,
        comments: document.getElementById("comments").value.trim()
    };

    if (
        !feedback.name ||
        !feedback.roll ||
        !feedback.department ||
        !feedback.semester ||
        !feedback.subject ||
        !feedback.faculty ||
        !feedback.comments
    ) {
        showMessage("Please fill in all fields.", false);
        return;
    }

    feedbacks.unshift(feedback);

    renderDashboard();
    renderFeedback();

    form.reset();
    selectedRating = 0;
    updateStars();
    ratingLabel.textContent = "Select a rating from 1 to 5";

    showMessage("Feedback submitted successfully!", true);
});

// Reset form and selected stars
form.addEventListener("reset", function () {
    selectedRating = 0;
    updateStars();
    ratingLabel.textContent = "Select a rating from 1 to 5";
    message.textContent = "";
});

// Update dashboard statistics
function renderDashboard() {
    document.getElementById("totalFeedback").textContent =
        feedbacks.length;

    const totalRating = feedbacks.reduce(
        function (sum, item) {
            return sum + item.rating;
        },
        0
    );

    const average = feedbacks.length
        ? (totalRating / feedbacks.length).toFixed(1)
        : "0.0";

    document.getElementById("averageRating").textContent =
        average + " / 5";

    const facultyNames = new Set(
        feedbacks.map(function (item) {
            return item.faculty.toLowerCase();
        })
    );

    document.getElementById("facultyCount").textContent =
        facultyNames.size;
}

// Create text elements safely
function addText(parent, tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    parent.appendChild(element);
    return element;
}

// Display feedback with search and rating filters
function renderFeedback() {
    const search = searchInput.value.trim().toLowerCase();
    const selectedFilter = ratingFilter.value;

    const filteredFeedback = feedbacks.filter(function (item) {
        const searchableText = [
            item.name,
            item.roll,
            item.department,
            item.semester,
            item.subject,
            item.faculty,
            item.comments
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(search);

        const matchesRating =
            selectedFilter === "all" ||
            item.rating === Number(selectedFilter);

        return matchesSearch && matchesRating;
    });

    feedbackList.replaceChildren();

    if (filteredFeedback.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";

        empty.textContent = feedbacks.length === 0
            ? "No feedback submitted yet."
            : "No matching feedback found.";

        feedbackList.appendChild(empty);
        return;
    }

    filteredFeedback.forEach(function (item) {
        const card = document.createElement("article");
        card.className = "feedback-item";

        addText(
            card,
            "h3",
            item.name + " - " + item.subject
        );

        addText(
            card,
            "p",
            "Roll Number: " + item.roll +
            " | Department: " + item.department +
            " | " + item.semester
        );

        addText(card, "p", "Faculty: " + item.faculty);

        addText(
            card,
            "p",
            "Rating: " +
            "★".repeat(item.rating) +
            "☆".repeat(5 - item.rating) +
            " (" + item.rating + "/5)",
            "feedback-rating"
        );

        addText(
            card,
            "p",
            "Comments: " + item.comments
        );

        feedbackList.appendChild(card);
    });
}

// Search feedback
searchInput.addEventListener("input", renderFeedback);

// Filter by star rating
ratingFilter.addEventListener("change", renderFeedback);

// Clear all feedback records
document.getElementById("clearBtn").addEventListener(
    "click",
    function () {
        if (feedbacks.length === 0) {
            showMessage("There is no feedback to clear.", false);
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to clear all feedback?"
        );

        if (confirmed) {
            feedbacks = [];

            renderDashboard();
            renderFeedback();

            showMessage("All feedback has been cleared.", true);
        }
    }
);

// Initial display
updateStars();
renderDashboard();
renderFeedback();