/* =====================================================
   AK Kids Video Website
   script.js
===================================================== */

// ============================================
// CONFIGURATION
// ============================================

const API_KEY = "AIzaSyD-5jqZ2WhKxAwzpVS7vrfAvRKifrLRyso";

const CHANNEL_ID = "UC0sQWWGBsCS6WJLbDOhRFZw";

const MAX_RESULTS = 12;

// ============================================

const videoContainer = document.getElementById("videoContainer");

const searchInput = document.getElementById("searchInput");

// ============================================
// LOAD LATEST VIDEOS
// ============================================

async function loadVideos() {

    if (!videoContainer) return;

    videoContainer.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading Latest Videos...</p>
        </div>
    `;

    try {

        const url =
            `https://www.googleapis.com/youtube/v3/search?part=snippet,id` +
            `&channelId=${CHANNEL_ID}` +
            `&maxResults=${MAX_RESULTS}` +
            `&order=date` +
            `&type=video` +
            `&key=${API_KEY}`;

        const response = await fetch(url);

        const data = await response.json();

        if (data.error) {

            throw new Error(data.error.message);

        }

        videoContainer.innerHTML = "";

        data.items.forEach(video => {

            const videoId = video.id.videoId;

            const title = video.snippet.title;

            const thumbnail =
                video.snippet.thumbnails.high.url;

            const date =
                new Date(video.snippet.publishedAt)
                .toLocaleDateString();

            const card = document.createElement("div");

            card.className = "video-card";

            card.innerHTML = `

                <img src="${thumbnail}" alt="${title}">

                <div class="video-info">

                    <h3>${title}</h3>

                    <p>📅 ${date}</p>

                    <a
                        href="https://www.youtube.com/watch?v=${videoId}"
                        target="_blank"
                        class="watch-btn">

                        <i class="fab fa-youtube"></i>

                        Watch Video

                    </a>

                </div>

            `;

            videoContainer.appendChild(card);

        });

    }

    catch (error) {

        console.error(error);

        videoContainer.innerHTML = `

            <div class="error">

                <h3>Unable to Load Videos</h3>

                <p>${error.message}</p>

                <br>

                <p>Check:</p>

                <p>✔ YouTube Data API v3 enabled</p>

                <p>✔ API key restrictions</p>

                <p>✔ Channel ID</p>

            </div>

        `;

    }

}

// ============================================
// SEARCH FILTER
// ============================================

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        const cards = document.querySelectorAll(".video-card");

        cards.forEach(card => {

            const title =
                card.querySelector("h3")
                .innerText
                .toLowerCase();

            if (title.includes(value)) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });

    });

}

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const target =
            document.querySelector(
                this.getAttribute("href")
            );

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

// ============================================
// HEADER SHADOW ON SCROLL
// ============================================

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if (!header) return;

    if (window.scrollY > 30) {

        header.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.10)";

    } else {

        header.style.boxShadow =
            "0 4px 18px rgba(0,0,0,.08)";

    }

});

// ============================================
// LOAD PAGE
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    loadVideos();

});