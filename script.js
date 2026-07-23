// ===============================
// AK Kids Video Website
// script.js
// ===============================

// Replace with your NEW restricted API key
const API_KEY = "YOUR_NEW_API_KEY";

// Your YouTube Channel ID
const CHANNEL_ID = "UC0sQWWGBsCS6WJLbDOhRFZw";

// Number of videos to display
const MAX_RESULTS = 12;

// HTML container
const videoGrid = document.getElementById("videoGrid");

// -------------------------------
// Load Latest Videos
// -------------------------------

async function loadLatestVideos() {

    if (!videoGrid) return;

    videoGrid.innerHTML = `
        <div class="loading">
            Loading latest videos...
        </div>
    `;

    try {

        const url =
        `https://www.googleapis.com/youtube/v3/search?` +
        `key=${API_KEY}` +
        `&channelId=${CHANNEL_ID}` +
        `&part=snippet,id` +
        `&order=date` +
        `&maxResults=${MAX_RESULTS}` +
        `&type=video`;

        const response = await fetch(url);

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        videoGrid.innerHTML = "";

        data.items.forEach(video => {

            const videoId = video.id.videoId;

            const title = video.snippet.title;

            const thumbnail =
                video.snippet.thumbnails.high.url;

            const published =
                new Date(video.snippet.publishedAt)
                .toLocaleDateString();

            const card = document.createElement("div");

            card.className = "video-card";

            card.innerHTML = `

                <img
                    src="${thumbnail}"
                    alt="${title}"
                >

                <div class="video-info">

                    <h3>${title}</h3>

                    <p>📅 ${published}</p>

                    <a
                    href="https://www.youtube.com/watch?v=${videoId}"
                    target="_blank"
                    class="watch-btn">

                    ▶ Watch Video

                    </a>

                </div>

            `;

            videoGrid.appendChild(card);

        });

    }

    catch(error){

        console.error(error);

        videoGrid.innerHTML = `

        <div class="error">

        ❌ Unable to load videos.

        <br><br>

        Check:

        <br>

        ✔ API Key

        <br>

        ✔ YouTube Data API enabled

        <br>

        ✔ API restrictions

        </div>

        `;

    }

}

// -------------------------------
// Search Videos
// -------------------------------

const searchInput =
document.getElementById("searchInput");

if(searchInput){

searchInput.addEventListener("keyup",function(){

const filter =
this.value.toLowerCase();

const cards =
document.querySelectorAll(".video-card");

cards.forEach(card=>{

const text =
card.innerText.toLowerCase();

card.style.display =
text.includes(filter)
? "block"
: "none";

});

});

}

// -------------------------------
// Smooth Scroll
// -------------------------------

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

e.preventDefault();

document.querySelector(this.getAttribute("href"))
.scrollIntoView({

behavior:"smooth"

});

});

});

// -------------------------------
// Load videos when page opens
// -------------------------------

window.onload = () => {

loadLatestVideos();

};