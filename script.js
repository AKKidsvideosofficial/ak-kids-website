/*=========================================================
 AK Kids Video Website
 Professional Script.js
 Module 1
=========================================================*/

"use strict";

/*=========================================================
 CONFIGURATION
=========================================================*/

const CONFIG = {

    API_KEY: "UC0sQWWGBsCS6WJLbDOhRFZw",

    CHANNEL_ID: "AIzaSyD-5jqZ2WhKxAwzpVS7vrfAvRKifrLRyso",

    MAX_RESULTS: 12,

    CACHE_DURATION: 30 * 60 * 1000,

    YOUTUBE_URL: "https://www.googleapis.com/youtube/v3",

    DEFAULT_IMAGE: "assets/logo.png"

};

/*=========================================================
 APPLICATION STATE
=========================================================*/

const APP = {

    uploadsPlaylist: "",

    videos: [],

    filteredVideos: [],

    featuredVideo: null,

    currentPage: 1,

    videosPerPage: 9,

    loading: false,

    initialized: false

};

/*=========================================================
 DOM CACHE
=========================================================*/

const DOM = {

    featuredVideo:
        document.getElementById("featuredVideo"),

    videoContainer:
        document.getElementById("videoContainer"),

    loading:
        document.getElementById("loading"),

    loadMore:
        document.getElementById("loadMoreBtn"),

    search:
        document.getElementById("searchInput"),

    sort:
        document.getElementById("sortVideos"),

    counter:
        document.getElementById("videoCount"),

    popup:
        document.getElementById("videoModal"),

    iframe:
        document.getElementById("videoFrame"),

    popupClose:
        document.getElementById("closeVideo"),

    categories:
        document.querySelectorAll(".category-btn"),

    backTop:
        document.getElementById("backToTop")

};

/*=========================================================
 UTILITIES
=========================================================*/

const Utils = {

    formatDate(date){

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year:"numeric",
                month:"short",
                day:"numeric"
            }
        );

    },

    shorten(text,length=120){

        if(!text) return "";

        if(text.length<=length) return text;

        return text.substring(0,length)+"...";

    },

    escape(text){

        if(!text) return "";

        return text

        .replaceAll("&","&amp;")

        .replaceAll("<","&lt;")

        .replaceAll(">","&gt;")

        .replaceAll('"',"&quot;")

        .replaceAll("'","&#39;");

    },

    debounce(callback,delay){

        let timer;

        return (...args)=>{

            clearTimeout(timer);

            timer=setTimeout(()=>{

                callback(...args);

            },delay);

        };

    }

};

/*=========================================================
 LOADER
=========================================================*/

function showLoader(){

    APP.loading=true;

    if(DOM.loading){

        DOM.loading.style.display="flex";

    }

}

function hideLoader(){

    APP.loading=false;

    if(DOM.loading){

        DOM.loading.style.display="none";

    }

}

/*=========================================================
 ERROR MESSAGE
=========================================================*/

function showError(message){

    console.error(message);

    if(!DOM.videoContainer) return;

    DOM.videoContainer.innerHTML=`

    <div class="error-box">

        <h2>⚠ Unable to Load Videos</h2>

        <p>${message}</p>

    </div>

    `;

}

/*=========================================================
 CACHE
=========================================================*/

function saveCache(videos){

    const data={

        time:Date.now(),

        videos

    };

    localStorage.setItem(

        "akkids_cache",

        JSON.stringify(data)

    );

}

function loadCache(){

    const cache=

    localStorage.getItem("akkids_cache");

    if(!cache) return null;

    const data=JSON.parse(cache);

    const expired=

    Date.now()-data.time>

    CONFIG.CACHE_DURATION;

    if(expired){

        localStorage.removeItem("akkids_cache");

        return null;

    }

    return data.videos;

}

/*=========================================================
 UPDATE COUNTER
=========================================================*/

function updateCounter(){

    if(DOM.counter){

        DOM.counter.textContent=

        APP.filteredVideos.length+

        " Videos";

    }

}

/*=========================================================
 RESET PAGINATION
=========================================================*/

function resetPagination(){

    APP.currentPage=1;

}

/*=========================================================
 INITIALIZE
=========================================================*/

async function initializeWebsite(){

    if(APP.initialized) return;

    APP.initialized=true;

    showLoader();

    console.log(

        "AK Kids Video Website Initializing..."

    );

}

/*=========================================================
 DOM READY
=========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    initializeWebsite

);

/*=========================================================
 MODULE 2
 YOUTUBE API ENGINE
=========================================================*/

/*=========================================================
 API REQUEST
=========================================================*/

async function apiRequest(endpoint, params = {}) {

    const url = new URL(`${CONFIG.YOUTUBE_URL}/${endpoint}`);

    params.key = CONFIG.API_KEY;

    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `YouTube API Error (${response.status})`
        );

    }

    const data = await response.json();

    if (data.error) {

        throw new Error(data.error.message);

    }

    return data;

}

/*=========================================================
 GET CHANNEL UPLOADS PLAYLIST
=========================================================*/

async function getUploadsPlaylist() {

    const data = await apiRequest("channels", {

        part: "contentDetails",

        id: CONFIG.CHANNEL_ID

    });

    if (!data.items || !data.items.length) {

        throw new Error("Channel not found.");

    }

    APP.uploadsPlaylist =
        data.items[0]
        .contentDetails
        .relatedPlaylists
        .uploads;

    return APP.uploadsPlaylist;

}

/*=========================================================
 LOAD LATEST VIDEOS
=========================================================*/

async function loadLatestVideos() {

    const cache = loadCache();

    if (cache) {

        console.log("Loaded videos from cache.");

        APP.videos = cache;

        APP.filteredVideos = [...cache];

        updateCounter();

        hideLoader();

        return APP.videos;

    }

    if (!APP.uploadsPlaylist) {

        await getUploadsPlaylist();

    }

    const data = await apiRequest("playlistItems", {

        part: "snippet",

        playlistId: APP.uploadsPlaylist,

        maxResults: CONFIG.MAX_RESULTS

    });

    APP.videos = data.items.map(item => {

        const snippet = item.snippet;

        return {

            id: snippet.resourceId.videoId,

            title: snippet.title,

            description: snippet.description,

            publishedAt: snippet.publishedAt,

            thumbnail:

                snippet.thumbnails.maxres?.url ||

                snippet.thumbnails.high?.url ||

                snippet.thumbnails.medium?.url ||

                snippet.thumbnails.default?.url ||

                CONFIG.DEFAULT_IMAGE

        };

    });

    APP.filteredVideos = [...APP.videos];

    saveCache(APP.videos);

    updateCounter();

    hideLoader();

    console.log(

        `${APP.videos.length} videos loaded.`

    );

    return APP.videos;

}

/*=========================================================
 REFRESH CACHE
=========================================================*/

async function refreshVideos() {

    localStorage.removeItem("akkids_cache");

    APP.videos = [];

    APP.filteredVideos = [];

    await loadLatestVideos();

}

/*=========================================================
 API VALIDATION
=========================================================*/

function validateAPI() {

    if (

        CONFIG.API_KEY === "YOUR_API_KEY" ||

        CONFIG.CHANNEL_ID === "YOUR_CHANNEL_ID"

    ) {

        console.warn(

            "Please configure your API Key and Channel ID."

        );

        return false;

    }

    return true;

}

/*=========================================================
 START LOADING VIDEOS
=========================================================*/

async function startYouTubeEngine() {

    try {

        if (!validateAPI()) return;

        showLoader();

        await loadLatestVideos();

        console.log("YouTube Engine Ready");

    }

    catch (error) {

        showError(error.message);

        console.error(error);

    }

    finally {

        hideLoader();

    }

}

/*=========================================================
 UPDATE INITIALIZER
=========================================================*/

/*
Replace initializeWebsite() in Module 1 with:

async function initializeWebsite(){

    if(APP.initialized) return;

    APP.initialized = true;

    await startYouTubeEngine();

}

*/

/*=========================================================
 MODULE 3
 RENDERING ENGINE
=========================================================*/

/*=========================================================
 FEATURED VIDEO
=========================================================*/

function renderFeaturedVideo() {

    if (!DOM.featuredVideo) return;

    if (APP.videos.length === 0) {

        DOM.featuredVideo.innerHTML = `
            <div class="empty-featured">
                <h3>No Featured Video Available</h3>
            </div>
        `;
        return;
    }

    APP.featuredVideo = APP.videos[0];

    DOM.featuredVideo.innerHTML = `
        <div class="featured-card">

            <div class="featured-image">

                <img
                    src="${APP.featuredVideo.thumbnail}"
                    alt="${Utils.escape(APP.featuredVideo.title)}"
                    loading="lazy">

                <button
                    class="play-btn"
                    onclick="openVideo('${APP.featuredVideo.id}')">

                    ▶

                </button>

            </div>

            <div class="featured-content">

                <span class="featured-label">
                    ⭐ Latest Upload
                </span>

                <h2>

                    ${Utils.escape(APP.featuredVideo.title)}

                </h2>

                <p>

                    ${Utils.shorten(APP.featuredVideo.description,250)}

                </p>

                <div class="featured-meta">

                    📅 ${Utils.formatDate(APP.featuredVideo.publishedAt)}

                </div>

            </div>

        </div>
    `;

}

/*=========================================================
 CREATE VIDEO CARD
=========================================================*/

function createVideoCard(video) {

    return `

    <article class="video-card reveal">

        <div class="video-thumbnail">

            <img
                src="${video.thumbnail}"
                alt="${Utils.escape(video.title)}"
                loading="lazy">

            <button
                class="video-play"
                onclick="openVideo('${video.id}')">

                ▶

            </button>

        </div>

        <div class="video-info">

            <h3>

                ${Utils.escape(video.title)}

            </h3>

            <p>

                ${Utils.shorten(video.description,120)}

            </p>

            <div class="video-footer">

                <span>

                    📅 ${Utils.formatDate(video.publishedAt)}

                </span>

            </div>

        </div>

    </article>

    `;

}

/*=========================================================
 RENDER VIDEO GRID
=========================================================*/

function renderVideoGrid() {

    if (!DOM.videoContainer) return;

    const start = 0;

    const end = APP.currentPage * APP.videosPerPage;

    const videos = APP.filteredVideos.slice(start, end);

    DOM.videoContainer.innerHTML = "";

    videos.forEach(video => {

        DOM.videoContainer.insertAdjacentHTML(

            "beforeend",

            createVideoCard(video)

        );

    });

    updateCounter();

    updateLoadMoreButton();

}

/*=========================================================
 LOAD MORE BUTTON
=========================================================*/

function updateLoadMoreButton() {

    if (!DOM.loadMore) return;

    if (

        APP.filteredVideos.length <=

        APP.currentPage * APP.videosPerPage

    ) {

        DOM.loadMore.style.display = "none";

    }

    else {

        DOM.loadMore.style.display = "inline-flex";

    }

}

/*=========================================================
 RENDER EVERYTHING
=========================================================*/

function renderWebsite() {

    renderFeaturedVideo();

    renderVideoGrid();

}

/*=========================================================
 AFTER VIDEOS ARE LOADED
=========================================================*/

/*
At the end of loadLatestVideos()
replace

return APP.videos;

with

renderWebsite();

return APP.videos;

*/

/*=========================================================
 MODULE 4
 USER INTERACTION ENGINE
=========================================================*/

/*=========================================================
 VIDEO PLAYER
=========================================================*/

function openVideo(videoId){

    if(!DOM.popup || !DOM.iframe) return;

    DOM.popup.classList.add("active");

    DOM.iframe.src =
    `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    document.body.style.overflow="hidden";

}

function closeVideo(){

    if(!DOM.popup || !DOM.iframe) return;

    DOM.popup.classList.remove("active");

    DOM.iframe.src="";

    document.body.style.overflow="";

}

if(DOM.popupClose){

    DOM.popupClose.addEventListener(

        "click",

        closeVideo

    );

}

if(DOM.popup){

    DOM.popup.addEventListener("click",(e)=>{

        if(e.target===DOM.popup){

            closeVideo();

        }

    });

}

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeVideo();

    }

});

/*=========================================================
 LIVE SEARCH
=========================================================*/

function filterBySearch(keyword){

    keyword = keyword.trim().toLowerCase();

    if(keyword===""){

        APP.filteredVideos=[...APP.videos];

    }

    else{

        APP.filteredVideos=APP.videos.filter(video=>{

            return(

                video.title.toLowerCase()

                .includes(keyword)

                ||

                video.description

                .toLowerCase()

                .includes(keyword)

            );

        });

    }

    resetPagination();

    renderVideoGrid();

}

if(DOM.search){

    DOM.search.addEventListener(

        "input",

        Utils.debounce((e)=>{

            filterBySearch(e.target.value);

        },300)

    );

}

/*=========================================================
 CATEGORY FILTER
=========================================================*/

function filterCategory(category){

    DOM.categories.forEach(btn=>{

        btn.classList.remove("active");

    });

    document
    .querySelector(`[data-category="${category}"]`)
    ?.classList.add("active");

    if(category==="all"){

        APP.filteredVideos=[...APP.videos];

    }

    else{

        APP.filteredVideos=

        APP.videos.filter(video=>{

            const title=

            video.title.toLowerCase();

            const desc=

            video.description.toLowerCase();

            return(

                title.includes(category)

                ||

                desc.includes(category)

            );

        });

    }

    resetPagination();

    renderVideoGrid();

}

DOM.categories.forEach(button=>{

    button.addEventListener("click",()=>{

        filterCategory(

            button.dataset.category

        );

    });

});

/*=========================================================
 SORTING
=========================================================*/

function sortVideos(type){

    switch(type){

        case "latest":

            APP.filteredVideos.sort((a,b)=>

                new Date(b.publishedAt)

                -

                new Date(a.publishedAt)

            );

        break;

        case "oldest":

            APP.filteredVideos.sort((a,b)=>

                new Date(a.publishedAt)

                -

                new Date(b.publishedAt)

            );

        break;

        case "title":

            APP.filteredVideos.sort((a,b)=>

                a.title.localeCompare(b.title)

            );

        break;

    }

    renderVideoGrid();

}

if(DOM.sort){

    DOM.sort.addEventListener(

        "change",

        (e)=>{

            sortVideos(e.target.value);

        }

    );

}

/*=========================================================
 LOAD MORE
=========================================================*/

if(DOM.loadMore){

    DOM.loadMore.addEventListener(

        "click",

        ()=>{

            APP.currentPage++;

            renderVideoGrid();

        }

    );

}

/*=========================================================
 KEYBOARD SHORTCUTS
=========================================================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="/"){

        if(DOM.search){

            e.preventDefault();

            DOM.search.focus();

        }

    }

});

/*=========================================================
 NO RESULT MESSAGE
=========================================================*/

function showNoResults(){

    if(APP.filteredVideos.length>0) return;

    DOM.videoContainer.innerHTML=`

        <div class="no-results">

            <h2>

                😔 No Videos Found

            </h2>

            <p>

                Try another keyword.

            </p>

        </div>

    `;

}

const oldRenderGrid=renderVideoGrid;

renderVideoGrid=function(){

    oldRenderGrid();

    showNoResults();

};

/*=========================================================
 MODULE 5
 PERFORMANCE & PROFESSIONAL FEATURES
=========================================================*/

/*=========================================================
 BACK TO TOP
=========================================================*/

function initializeBackToTop(){

    if(!DOM.backTop) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>400){

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
 STICKY HEADER
=========================================================*/

function initializeHeader(){

    const header=document.querySelector(".header");

    if(!header) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>30){

            header.classList.add("sticky");

        }else{

            header.classList.remove("sticky");

        }

    });

}

/*=========================================================
 SCROLL REVEAL
=========================================================*/

function initializeReveal(){

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("active");

                observer.unobserve(entry.target);

            }

        });

    },{

        threshold:.15

    });

    document.querySelectorAll(".reveal").forEach(item=>{

        observer.observe(item);

    });

}

/*=========================================================
 LAZY IMAGE LOADING
=========================================================*/

function initializeLazyImages(){

    const images=document.querySelectorAll("img[data-src]");

    if(images.length===0) return;

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                const img=entry.target;

                img.src=img.dataset.src;

                img.removeAttribute("data-src");

                observer.unobserve(img);

            }

        });

    });

    images.forEach(img=>{

        observer.observe(img);

    });

}

/*=========================================================
 ONLINE / OFFLINE
=========================================================*/

function initializeNetworkStatus(){

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
 AUTO CACHE REFRESH
=========================================================*/

function initializeAutoRefresh(){

    setInterval(async()=>{

        console.log("Refreshing YouTube Cache...");

        try{

            await refreshVideos();

            renderWebsite();

        }

        catch(error){

            console.error(error);

        }

    },CONFIG.CACHE_DURATION);

}

/*=========================================================
 GLOBAL IMAGE FALLBACK
=========================================================*/

document.addEventListener("error",(event)=>{

    if(event.target.tagName==="IMG"){

        event.target.src=CONFIG.DEFAULT_IMAGE;

    }

},true);

/*=========================================================
 GLOBAL JS ERROR
=========================================================*/

window.addEventListener("error",(event)=>{

    console.error(

        "JavaScript Error:",

        event.message

    );

});

/*=========================================================
 PROMISE ERROR
=========================================================*/

window.addEventListener(

    "unhandledrejection",

    event=>{

        console.error(

            event.reason

        );

    }

);

/*=========================================================
 PERFORMANCE
=========================================================*/

window.addEventListener("load",()=>{

    console.log(

        "Loaded in",

        Math.round(performance.now()),

        "ms"

    );

});

/*=========================================================
 START APPLICATION
=========================================================*/

async function startApplication(){

    try{

        showLoader();

        await startYouTubeEngine();

        renderWebsite();

        initializeBackToTop();

        initializeHeader();

        initializeReveal();

        initializeLazyImages();

        initializeNetworkStatus();

        initializeAutoRefresh();

        hideLoader();

        console.log(

            "AK Kids Video Website Ready"

        );

    }

    catch(error){

        hideLoader();

        showError(error.message);

    }

}

/*=========================================================
 REPLACE INITIALIZER
=========================================================*/

document.removeEventListener(

    "DOMContentLoaded",

    initializeWebsite

);

document.addEventListener(

    "DOMContentLoaded",

    startApplication

);

