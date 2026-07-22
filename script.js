// AK Kids Video Website

console.log("Welcome to AK Kids Video!");

// Welcome message
window.addEventListener("load", () => {
    setTimeout(() => {
        alert("🌈 Welcome to AK Kids Video! Have fun learning ABC, Numbers, Rhymes & Phonics!");
    }, 800);
});

// Smooth scrolling for navigation
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");

        if (targetId !== "#") {
            document.querySelector(targetId).scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// Card hover animation
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.transform = "scale(1.05)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "scale(1)";
    });
});