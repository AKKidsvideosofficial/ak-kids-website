/* =====================================================
   AK Kids Video Website v2.0
   Module 1
   Configuration + YouTube Uploads Playlist Loader
===================================================== */

"use strict";

// =====================================================
// CONFIGURATION
// =====================================================

// IMPORTANT:
// Replace with your NEW restricted YouTube API Key.
// Do NOT use an API key that has already been exposed.

const API_KEY = "AIzaSyD-5jqZ2WhKxAwzpVS7vrfAvRKifrLRyso";

const CHANNEL_ID = "UC0sQWWGBsCS6WJLbDOhRFZw";

const VIDEOS_PER_PAGE = 12;

// =====================================================
// GLOBAL VARIABLES
// =====================================================

let uploadsPlaylistId = "";

let nextPageToken = "";

let isLoading = false;

// =====================================================
// MODULE 3 VARIABLES
// =====================================================

let allVideos = [];

let filteredVideos = [];

let currentVisible = VIDEOS_PER_PAGE;

// =====================================================
// DOM ELEMENTS
// =====================================================

const videoContainer = document.getElementById("videoContainer");

const searchInput = document.getElementById("searchInput");

const loadMoreBtn = document.getElementById("loadMoreBtn");

// =====================================================
// SHOW LOADING
// =====================================================

function showLoading(){

if(videoContainer.children.length>0)return;

videoContainer.innerHTML="";

for(let i=0;i<6;i++){

const card=document.createElement("div");

card.className="video-card skeleton";

card.innerHTML=`

<div class="skeleton-thumb"></div>

<div class="video-info">

<div class="skeleton-line"></div>

<div class="skeleton-line short"></div>

<div class="skeleton-btn"></div>

</div>

`;

videoContainer.appendChild(card);

}

}
// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {

    videoContainer.innerHTML = `

        <div class="error">

            <h3>Unable to Load Videos</h3>

            <p>${message}</p>

        </div>

    `;

}

// =====================================================
// GET UPLOADS PLAYLIST ID
// =====================================================

async function getUploadsPlaylist() {

    try {

        const url =
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;

        const response = await fetch(url);

        const data = await response.json();

        if(data.error){

    switch(data.error.code){

        case 400:

            throw new Error("Invalid API request.");

        case 403:

            throw new Error("API quota exceeded or key restrictions are blocking access.");

        case 404:

            throw new Error("Channel not found.");

        default:

            throw new Error(data.error.message);

    }

}

    catch (error) {

        console.error(error);

        showError(error.message);

    }

}

// =====================================================
// LOAD VIDEOS
// =====================================================

async function loadVideos() {

    if (isLoading) return;

    isLoading = true;

    showLoading();

    try {

        if (!uploadsPlaylistId) {

            await getUploadsPlaylist();

        }

        let url =
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${VIDEOS_PER_PAGE}&key=${API_KEY}`;

        if (nextPageToken) {

            url += `&pageToken=${nextPageToken}`;

        }

        const response = await fetch(url);

        const data = await response.json();

        if (data.error) {

            throw new Error(data.error.message);

        }

        nextPageToken = data.nextPageToken || "";

        if (videoContainer.querySelector(".loading")) {

            videoContainer.innerHTML = "";

        }

        displayVideos(data.items);

        if (loadMoreBtn) {

            if (nextPageToken) {

                loadMoreBtn.style.display = "inline-flex";

            } else {

                loadMoreBtn.style.display = "none";

            }

        }

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

    finally {

        isLoading = false;

    }

}

// =====================================================
// INITIALIZE WEBSITE
// =====================================================

window.addEventListener("DOMContentLoaded", () => {

    loadVideos();

});

// =====================================================
// DISPLAY VIDEOS
// =====================================================

videos.forEach(video=>{

    allVideos.push(video);

});

function displayVideos(videos) {

    videos.forEach(video => {

        const videoId = video.snippet.resourceId.videoId;

        const title = video.snippet.title;

        const thumbnails = video.snippet.thumbnails;

const thumbnail =
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url;

        const published =
            new Date(video.snippet.publishedAt)
            .toLocaleDateString();

        const card = document.createElement("div");

        card.className = "video-card";

        card.innerHTML = `

            <div class="video-thumbnail">

                <img
    src="${thumbnail}"
    alt="${title}"
    loading="lazy"
    decoding="async">

                <div class="play-overlay">

                    <i class="fas fa-play-circle"></i>

                </div>

            </div>

            <div class="video-info">

                <h3>${title}</h3>

                <p class="video-date">

                    📅 ${published}

                </p>

 // =====================================================
// LOAD MORE
// =====================================================

if(loadMoreBtn){

loadMoreBtn.addEventListener("click",()=>{

loadVideos();

});

}

            </div>

        `;

        card.classList.add("fade-in");

videoContainer.appendChild(card);

    });

}

// =====================================================
// LIVE SEARCH
// =====================================================

if(searchInput){

searchInput.addEventListener("keyup",function(){

const value=this.value.toLowerCase().trim();

const cards=document.querySelectorAll(".video-card");

cards.forEach(card=>{

const title=
card.querySelector("h3")
.innerText
.toLowerCase();

if(title.includes(value)){

card.style.display="";

}else{

card.style.display="none";

}

});

});

}

// =====================================================
// VIDEO POPUP PLAYER
// =====================================================

const modal = document.getElementById("videoModal");

const player = document.getElementById("youtubePlayer");

const closeModal = document.getElementById("closeModal");

function playVideo(videoId){

    if(!modal || !player) return;

    player.src =
    `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

}

function closeVideo(){

    if(!modal || !player) return;

    modal.classList.remove("show");

    player.src = "";

    document.body.style.overflow = "auto";

}

if(closeModal){

    closeModal.addEventListener("click",closeVideo);

}

window.addEventListener("click",(e)=>{

    if(e.target===modal){

        closeVideo();

    }

});

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeVideo();

    }

});

const topBtn = document.getElementById("backToTop");

window.addEventListener("scroll",()=>{

if(window.scrollY>400){

topBtn.classList.add("show");

}else{

topBtn.classList.remove("show");

}

});

topBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

