/*=========================================================
 AK Kids Video Website
 Professional Script.js
 Version: 2.0
 Module 1 - Core Foundation
=========================================================*/

"use strict";

/*=========================================================
 CONFIGURATION
=========================================================*/

const CONFIG = Object.freeze({

    API_KEY: "AIzaSyD-5jqZ2WhKxAwzpVS7vrfAvRKifrLRyso",

    CHANNEL_ID: "UC0sQWWGBsCS6WJLbDOhRFZw",

    API_BASE: "https://www.googleapis.com/youtube/v3",

    MAX_RESULTS: 12,

    CACHE_KEY: "akkids_cache",

    CACHE_TIME: 30 * 60 * 1000,

    DEFAULT_THUMBNAIL: "assets/logo.png"

});

/*=========================================================
 APPLICATION STATE
=========================================================*/

const APP = {

    uploadsPlaylistId: "",

    videos: [],

    filteredVideos: [],

    featuredVideo: null,

    currentPage: 1,

    videosPerPage: 9,

    initialized: false,

    loading: false

};

/*=========================================================
 DOM ELEMENTS
=========================================================*/

const DOM = {

    featured: document.getElementById("featuredVideo"),

    gallery: document.getElementById("videoContainer"),

    loading: document.getElementById("loading"),

    pageLoader: document.getElementById("pageLoader"),

    search: document.getElementById("searchInput"),

    sort: document.getElementById("sortVideos"),

    loadMore: document.getElementById("loadMoreBtn"),

    counter: document.getElementById("videoCount"),

    modal: document.getElementById("videoModal"),

    iframe: document.getElementById("videoFrame"),

    closeModal: document.getElementById("closeVideo"),

    backTop: document.getElementById("backToTop"),

    categories: document.querySelectorAll(".category-btn")

};

/*=========================================================
 UTILITIES
=========================================================*/

const Utils = {

    escapeHTML(text = "") {

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    },

    truncate(text = "", length = 120) {

        if (text.length <= length) return text;

        return text.substring(0, length) + "...";

    },

    formatDate(date) {

        return new Date(date).toLocaleDateString("en-US", {

            year: "numeric",

            month: "short",

            day: "numeric"

        });

    },

    debounce(callback, delay = 300) {

        let timer;

        return (...args) => {

            clearTimeout(timer);

            timer = setTimeout(() => {

                callback(...args);

            }, delay);

        };

    }

};

/*=========================================================
 CACHE
=========================================================*/

const Cache = {

    save(videos) {

        localStorage.setItem(

            CONFIG.CACHE_KEY,

            JSON.stringify({

                time: Date.now(),

                videos

            })

        );

    },

    load() {

        const cache = localStorage.getItem(CONFIG.CACHE_KEY);

        if (!cache) return null;

        try {

            const data = JSON.parse(cache);

            const expired =

                Date.now() - data.time >

                CONFIG.CACHE_TIME;

            if (expired) {

                localStorage.removeItem(CONFIG.CACHE_KEY);

                return null;

            }

            return data.videos;

        }

        catch {

            localStorage.removeItem(CONFIG.CACHE_KEY);

            return null;

        }

    },

    clear() {

        localStorage.removeItem(CONFIG.CACHE_KEY);

    }

};

/*=========================================================
 LOADER
=========================================================*/

function showLoader() {

    APP.loading = true;

    if (DOM.loading) {

        DOM.loading.style.display = "flex";

    }

}

function hideLoader() {

    APP.loading = false;

    if (DOM.loading) {

        DOM.loading.style.display = "none";

    }

    if (DOM.pageLoader) {

        DOM.pageLoader.classList.add("hide");

    }

}

/*=========================================================
 COUNTER
=========================================================*/

function updateCounter() {

    if (!DOM.counter) return;

    DOM.counter.textContent =

        `${APP.filteredVideos.length} Videos`;

}

/*=========================================================
 ERROR
=========================================================*/

function showError(message) {

    console.error(message);

    if (!DOM.gallery) return;

    DOM.gallery.innerHTML = `

        <div class="error-box">

            <h2>⚠ Unable to Load Videos</h2>

            <p>${Utils.escapeHTML(message)}</p>

        </div>

    `;

}

/*=========================================================
 INITIALIZATION
=========================================================*/

function initializeCore() {

    if (APP.initialized) return;

    APP.initialized = true;

    console.log("AK Kids Video Core Initialized");

}

/*=========================================================
 MODULE 2
 YOUTUBE API SERVICE
=========================================================*/

/*=========================================================
 API SERVICE
=========================================================*/

const YouTubeAPI = {

    async request(endpoint, params = {}) {

        params.key = CONFIG.API_KEY;

        const url = new URL(`${CONFIG.API_BASE}/${endpoint}`);

        Object.entries(params).forEach(([key, value]) => {

            url.searchParams.append(key, value);

        });

        const response = await fetch(url.toString());

        if (!response.ok) {

            throw new Error(
                `API Error (${response.status})`
            );

        }

        const data = await response.json();

        if (data.error) {

            throw new Error(data.error.message);

        }

        return data;

    }

};

/*=========================================================
 VALIDATE CONFIG
=========================================================*/

function validateConfiguration() {

    if (!CONFIG.API_KEY.startsWith("AIza")) {

        throw new Error("Invalid YouTube API Key.");

    }

    if (!CONFIG.CHANNEL_ID.startsWith("UC")) {

        throw new Error("Invalid Channel ID.");

    }

}

/*=========================================================
 GET UPLOAD PLAYLIST
=========================================================*/

async function getUploadsPlaylist() {

    if (APP.uploadsPlaylistId) {

        return APP.uploadsPlaylistId;

    }

    const data = await YouTubeAPI.request("channels", {

        part: "contentDetails",

        id: CONFIG.CHANNEL_ID

    });

    if (!data.items.length) {

        throw new Error("Channel not found.");

    }

    APP.uploadsPlaylistId =

        data.items[0]

        .contentDetails

        .relatedPlaylists

        .uploads;

    return APP.uploadsPlaylistId;

}

/*=========================================================
 LOAD VIDEOS
=========================================================*/

async function fetchLatestVideos() {

    const playlistId =

        await getUploadsPlaylist();

    const data = await YouTubeAPI.request(

        "playlistItems",

        {

            part: "snippet",

            playlistId,

            maxResults: CONFIG.MAX_RESULTS

        }

    );

    return data.items.map(item => {

        const s = item.snippet;

        return {

            id: s.resourceId.videoId,

            title: s.title,

            description: s.description,

            publishedAt: s.publishedAt,

            thumbnail:

                s.thumbnails.maxres?.url ||

                s.thumbnails.high?.url ||

                s.thumbnails.medium?.url ||

                s.thumbnails.default?.url ||

                CONFIG.DEFAULT_THUMBNAIL

        };

    });

}

/*=========================================================
 LOAD FROM CACHE OR API
=========================================================*/

async function loadVideos() {

    const cache = Cache.load();

    if (cache) {

        console.log("Loaded videos from cache.");

        APP.videos = cache;

        APP.filteredVideos = [...cache];

        APP.featuredVideo = cache[0] || null;

        return;

    }

    const videos = await fetchLatestVideos();

    APP.videos = videos;

    APP.filteredVideos = [...videos];

    APP.featuredVideo = videos[0] || null;

    Cache.save(videos);

}

/*=========================================================
 REFRESH CACHE
=========================================================*/

async function refreshVideos() {

    Cache.clear();

    APP.videos = [];

    APP.filteredVideos = [];

    APP.featuredVideo = null;

    await loadVideos();

}

/*=========================================================
 START YOUTUBE SERVICE
=========================================================*/

async function initializeYouTube() {

    validateConfiguration();

    showLoader();

    try {

        await loadVideos();

        console.log(

            `Loaded ${APP.videos.length} videos.`

        );

    }

    finally {

        hideLoader();

    }

}

/*=========================================================
 MODULE 3
 RENDERING ENGINE
=========================================================*/

/*=========================================================
 FEATURED VIDEO
=========================================================*/

function renderFeaturedVideo() {

    if (!DOM.featured) return;

    if (!APP.featuredVideo) {

        DOM.featured.innerHTML = `
            <div class="empty-state">
                <h2>No Featured Video</h2>
            </div>
        `;

        return;

    }

    const video = APP.featuredVideo;

    DOM.featured.innerHTML = `

        <div class="featured-card">

            <div class="featured-thumbnail">

                <img
                    src="${video.thumbnail}"
                    alt="${Utils.escapeHTML(video.title)}"
                    loading="lazy">

                <button
                    class="play-button"
                    data-video="${video.id}">

                    ▶

                </button>

            </div>

            <div class="featured-content">

                <span class="featured-badge">
                    ⭐ Latest Upload
                </span>

                <h2>
                    ${Utils.escapeHTML(video.title)}
                </h2>

                <p>
                    ${Utils.truncate(video.description,220)}
                </p>

                <div class="featured-meta">

                    📅 ${Utils.formatDate(video.publishedAt)}

                </div>

            </div>

        </div>

    `;

}

/*=========================================================
 VIDEO CARD
=========================================================*/

function createVideoCard(video) {

    return `

        <article class="video-card reveal">

            <div class="video-image">

                <img
                    src="${video.thumbnail}"
                    alt="${Utils.escapeHTML(video.title)}"
                    loading="lazy">

                <button
                    class="play-button"
                    data-video="${video.id}">

                    ▶

                </button>

            </div>

            <div class="video-content">

                <h3>

                    ${Utils.escapeHTML(video.title)}

                </h3>

                <p>

                    ${Utils.truncate(video.description)}

                </p>

                <div class="video-meta">

                    <span>

                        📅 ${Utils.formatDate(video.publishedAt)}

                    </span>

                </div>

            </div>

        </article>

    `;

}

/*=========================================================
 VIDEO GRID
=========================================================*/

function renderGallery() {

    if (!DOM.gallery) return;

    DOM.gallery.innerHTML = "";

    if (APP.filteredVideos.length === 0) {

        DOM.gallery.innerHTML = `

            <div class="empty-state">

                <h2>

                    No Videos Found

                </h2>

            </div>

        `;

        updateCounter();

        return;

    }

    const end =

        APP.currentPage *

        APP.videosPerPage;

    APP.filteredVideos

        .slice(0, end)

        .forEach(video => {

            DOM.gallery.insertAdjacentHTML(

                "beforeend",

                createVideoCard(video)

            );

        });

    updateCounter();

    updateLoadMoreButton();

}

/*=========================================================
 LOAD MORE
=========================================================*/

function updateLoadMoreButton() {

    if (!DOM.loadMore) return;

    const visible =

        APP.currentPage *

        APP.videosPerPage;

    DOM.loadMore.style.display =

        visible >= APP.filteredVideos.length

        ? "none"

        : "inline-flex";

}

/*=========================================================
 RENDER WEBSITE
=========================================================*/

function renderWebsite() {

    renderFeaturedVideo();

    renderGallery();

}

/*=========================================================
 REFRESH UI
=========================================================*/

function refreshWebsite() {

    updateCounter();

    renderWebsite();

}

/*=========================================================
 PLAY BUTTON EVENTS
=========================================================*/

function bindPlayButtons() {

    document

        .querySelectorAll(".play-button")

        .forEach(button => {

            button.addEventListener("click", () => {

                const id =

                    button.dataset.video;

                openVideo(id);

            });

        });

}

/*=========================================================
 AFTER RENDER
=========================================================*/

const originalRenderWebsite = renderWebsite;

renderWebsite = function () {

    originalRenderWebsite();

    bindPlayButtons();

};

/*=========================================================
 MODULE 4
 USER INTERACTION
=========================================================*/

/*=========================================================
 VIDEO MODAL
=========================================================*/

function openVideo(videoId){

    if(!DOM.modal || !DOM.iframe) return;

    DOM.modal.classList.add("active");

    DOM.iframe.src =
        `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    document.body.style.overflow="hidden";

}

function closeVideo(){

    if(!DOM.modal || !DOM.iframe) return;

    DOM.modal.classList.remove("active");

    DOM.iframe.src="";

    document.body.style.overflow="";

}

/*=========================================================
 MODAL EVENTS
=========================================================*/

function initializeModal(){

    if(DOM.closeModal){

        DOM.closeModal.addEventListener("click",closeVideo);

    }

    if(DOM.modal){

        DOM.modal.addEventListener("click",(event)=>{

            if(event.target===DOM.modal){

                closeVideo();

            }

        });

    }

    document.addEventListener("keydown",(event)=>{

        if(event.key==="Escape"){

            closeVideo();

        }

    });

}

/*=========================================================
 SEARCH
=========================================================*/

function filterVideos(keyword){

    const value = keyword.trim().toLowerCase();

    if(value===""){

        APP.filteredVideos=[...APP.videos];

    }else{

        APP.filteredVideos=APP.videos.filter(video=>{

            return(

                video.title.toLowerCase().includes(value) ||

                video.description.toLowerCase().includes(value)

            );

        });

    }

    APP.currentPage=1;

    renderWebsite();

}

function initializeSearch(){

    if(!DOM.search) return;

    DOM.search.addEventListener(

        "input",

        Utils.debounce((event)=>{

            filterVideos(event.target.value);

        },300)

    );

}

/*=========================================================
 SORTING
=========================================================*/

function sortVideos(type){

    switch(type){

        case "latest":

            APP.filteredVideos.sort(

                (a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)

            );

            break;

        case "oldest":

            APP.filteredVideos.sort(

                (a,b)=>new Date(a.publishedAt)-new Date(b.publishedAt)

            );

            break;

        case "title":

            APP.filteredVideos.sort(

                (a,b)=>a.title.localeCompare(b.title)

            );

            break;

    }

    renderWebsite();

}

function initializeSorting(){

    if(!DOM.sort) return;

    DOM.sort.addEventListener("change",(event)=>{

        sortVideos(event.target.value);

    });

}

/*=========================================================
 LOAD MORE
=========================================================*/

function initializeLoadMore(){

    if(!DOM.loadMore) return;

    DOM.loadMore.addEventListener("click",()=>{

        APP.currentPage++;

        renderGallery();

        bindPlayButtons();

    });

}

/*=========================================================
 CATEGORY FILTER
=========================================================*/

function initializeCategories(){

    if(!DOM.categories.length) return;

    DOM.categories.forEach(button=>{

        button.addEventListener("click",()=>{

            const category =

                button.dataset.category.toLowerCase();

            DOM.categories.forEach(btn=>{

                btn.classList.remove("active");

            });

            button.classList.add("active");

            if(category==="all"){

                APP.filteredVideos=[...APP.videos];

            }else{

                APP.filteredVideos=

                    APP.videos.filter(video=>{

                        const text=(

                            video.title+" "+video.description

                        ).toLowerCase();

                        return text.includes(category);

                    });

            }

            APP.currentPage=1;

            renderWebsite();

        });

    });

}

/*=========================================================
 INITIALIZE USER INTERACTION
=========================================================*/

function initializeInteraction(){

    initializeModal();

    initializeSearch();

    initializeSorting();

    initializeLoadMore();

    initializeCategories();

}

/*=========================================================
 MODULE 5
 APPLICATION BOOTSTRAP
=========================================================*/

/*=========================================================
 STICKY HEADER
=========================================================*/

function initializeHeader(){

    const header=document.querySelector(".header");

    if(!header) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>40){

            header.classList.add("sticky");

        }else{

            header.classList.remove("sticky");

        }

    });

}

/*=========================================================
 BACK TO TOP
=========================================================*/

function initializeBackToTop(){

    if(!DOM.backTop) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>500){

            DOM.backTop.classList.add("show");

        }else{

            DOM.backTop.classList.remove("show");

        }

    });

    DOM.backTop.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

/*=========================================================
 SCROLL REVEAL
=========================================================*/

function initializeRevealAnimation(){

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("active");

                observer.unobserve(entry.target);

            }

        });

    },{

        threshold:0.15

    });

    document.querySelectorAll(".reveal").forEach(item=>{

        observer.observe(item);

    });

}

/*=========================================================
 NETWORK STATUS
=========================================================*/

function initializeNetwork(){

    function update(){

        if(navigator.onLine){

            console.log("Internet Connected");

        }else{

            console.warn("Internet Disconnected");

        }

    }

    window.addEventListener("online",update);

    window.addEventListener("offline",update);

    update();

}

/*=========================================================
 AUTO REFRESH CACHE
=========================================================*/

function initializeAutoRefresh(){

    setInterval(async()=>{

        try{

            await refreshVideos();

            renderWebsite();

        }

        catch(error){

            console.error(error);

        }

    },CONFIG.CACHE_TIME);

}

/*=========================================================
 GLOBAL IMAGE FALLBACK
=========================================================*/

document.addEventListener("error",event=>{

    if(event.target.tagName==="IMG"){

        event.target.src=CONFIG.DEFAULT_THUMBNAIL;

    }

},true);

/*=========================================================
 GLOBAL ERROR HANDLER
=========================================================*/

window.addEventListener("error",event=>{

    console.error("JavaScript Error:",event.message);

});

/*=========================================================
 UNHANDLED PROMISES
=========================================================*/

window.addEventListener("unhandledrejection",event=>{

    console.error(event.reason);

});

/*=========================================================
 PERFORMANCE LOG
=========================================================*/

window.addEventListener("load",()=>{

    console.log(

        `Website Loaded in ${Math.round(performance.now())} ms`

    );

});

/*=========================================================
 APPLICATION STARTUP
=========================================================*/

async function startApplication(){

    try{

        initializeCore();

        showLoader();

        await initializeYouTube();

        renderWebsite();

        initializeInteraction();

        initializeHeader();

        initializeBackToTop();

        initializeRevealAnimation();

        initializeNetwork();

        initializeAutoRefresh();

        hideLoader();

        console.log("AK Kids Video Website Ready");

    }

    catch(error){

        hideLoader();

        showError(error.message);

    }

}

/*=========================================================
 DOM READY
=========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    startApplication

);