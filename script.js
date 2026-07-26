/*====================================================
 AK KIDS VIDEO WEBSITE
 script.js
 PART 1
====================================================*/

/*====================================================
 CONFIGURATION
====================================================*/

const CONFIG = {

    API_KEY: "AIzaSyD-5jqZ2WhKxAwzpVS7vrfAvRKifrLRyso",

    CHANNEL_ID: "UC0sQWWGBsCS6WJLbDOhRFZw",

    MAX_RESULTS: 12,

    CACHE_TIME: 30 * 60 * 1000,

    DEFAULT_THUMBNAIL: "assets/banner.jpg"

};

/*====================================================
 GLOBAL VARIABLES
====================================================*/

let uploadPlaylistId = "";

let allVideos = [];

let filteredVideos = [];

let currentPage = 1;

let videosPerPage = 12;

/*====================================================
 DOM ELEMENTS
====================================================*/

const videoContainer = document.getElementById("videoContainer");

const featuredVideo = document.getElementById("featuredVideo");

const loading = document.getElementById("loading");

const searchInput = document.getElementById("searchInput");

const loadMoreBtn = document.getElementById("loadMoreBtn");

const categoryButtons = document.querySelectorAll(".category-btn");

const sortVideos = document.getElementById("sortVideos");

const videoCount = document.getElementById("videoCount");

/*====================================================
 INITIALIZE WEBSITE
====================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeWebsite();

});

/*====================================================
 MAIN INITIALIZER
====================================================*/

async function initializeWebsite(){

    showLoader();

    try{

        const cached = getCachedVideos();

        if(cached){

            allVideos = cached;

            filteredVideos = [...allVideos];

            hideLoader();

            return;

        }

        uploadPlaylistId = await getUploadsPlaylist();

        await loadLatestVideos();

    }

    catch(error){

        console.error(error);

        showError(error.message);

    }

    finally{

        hideLoader();

    }

}

/*====================================================
 GET UPLOAD PLAYLIST
====================================================*/

async function getUploadsPlaylist(){

    const url =
`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CONFIG.CHANNEL_ID}&key=${CONFIG.API_KEY}`;

    const response = await fetch(url);

    if(!response.ok){

        throw new Error("Unable to connect to YouTube API.");

    }

    const data = await response.json();

    if(!data.items || !data.items.length){

        throw new Error("Channel not found.");

    }

    return data.items[0]
        .contentDetails
        .relatedPlaylists
        .uploads;

}

/*====================================================
 LOAD LATEST VIDEOS
====================================================*/

async function loadLatestVideos(){

    const url =
`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadPlaylistId}&maxResults=50&key=${CONFIG.API_KEY}`;

    const response = await fetch(url);

    if(!response.ok){

        throw new Error("Unable to load videos.");

    }

    const data = await response.json();

    allVideos = data.items.map(item=>{

        return{

            id:item.snippet.resourceId.videoId,

            title:item.snippet.title,

            description:item.snippet.description,

            published:item.snippet.publishedAt,

            thumbnail:
                item.snippet.thumbnails.high?.url ||
                item.snippet.thumbnails.medium?.url ||
                CONFIG.DEFAULT_THUMBNAIL

        };

    });

    filteredVideos=[...allVideos];

    cacheVideos(allVideos);

    updateCounter();

    /* Part 2 will continue here
       - Featured Video
       - Professional Cards
       - Rendering
    */

}

/*====================================================
 CACHE
====================================================*/

function cacheVideos(videos){

    const cache = {

        time:Date.now(),

        videos

    };

    localStorage.setItem(
        "akkids_cache",
        JSON.stringify(cache)
    );

}

function getCachedVideos(){

    const cache =
        localStorage.getItem("akkids_cache");

    if(!cache) return null;

    const data = JSON.parse(cache);

    if(Date.now()-data.time>CONFIG.CACHE_TIME){

        localStorage.removeItem("akkids_cache");

        return null;

    }

    return data.videos;

}

/*====================================================
 COUNTER
====================================================*/

function updateCounter(){

    if(videoCount){

        videoCount.textContent =
        `${filteredVideos.length} Videos`;

    }

}

/*====================================================
 LOADER
====================================================*/

function showLoader(){

    if(loading){

        loading.style.display="flex";

    }

}

function hideLoader(){

    if(loading){

        loading.style.display="none";

    }

}

/*====================================================
 ERROR
====================================================*/

function showError(message){

    if(videoContainer){

        videoContainer.innerHTML=`

        <div class="error-box">

            <h3>Oops!</h3>

            <p>${message}</p>

        </div>

        `;

    }

}

/*====================================================
 PART 2
 FEATURED VIDEO + VIDEO CARDS
====================================================*/

/*====================================================
 RENDER ALL VIDEOS
====================================================*/

function renderVideos() {

    if (!videoContainer) return;

    videoContainer.innerHTML = "";

    const end = currentPage * videosPerPage;

    const videos = filteredVideos.slice(0, end);

    videos.forEach(video => {

        videoContainer.appendChild(createVideoCard(video));

    });

    if (filteredVideos.length <= end) {

        loadMoreBtn.style.display = "none";

    } else {

        loadMoreBtn.style.display = "inline-flex";

    }

}

/*====================================================
 CREATE VIDEO CARD
====================================================*/

function createVideoCard(video) {

    const card = document.createElement("div");

    card.className = "video-card fade-in";

    const date = new Date(video.published);

    const publishDate =
        date.toLocaleDateString();

    card.innerHTML = `

<div class="video-thumbnail">

<img
src="${video.thumbnail}"
alt="${escapeHTML(video.title)}"
loading="lazy">

<div class="video-overlay">

<button
class="play-button"
onclick="openVideo('${video.id}')">

▶

</button>

</div>

<div class="duration-badge">

YouTube

</div>

</div>

<div class="video-content">

<h3 class="video-title">

${escapeHTML(video.title)}

</h3>

<p class="video-description">

${shortText(video.description,120)}

</p>

<div class="video-meta">

<span>

📅 ${publishDate}

</span>

<span>

AK Kids

</span>

</div>

<div class="video-actions">

<button
class="watch-btn"
onclick="openVideo('${video.id}')">

Watch

</button>

<a
class="youtube-btn"
target="_blank"
href="https://youtu.be/${video.id}">

YouTube

</a>

</div>

</div>

`;

    return card;

}

/*====================================================
 FEATURED VIDEO
====================================================*/

function renderFeaturedVideo() {

    if (!featuredVideo) return;

    if (!allVideos.length) return;

    const video = allVideos[0];

    featuredVideo.innerHTML = `

<div class="featured-thumbnail">

<img
src="${video.thumbnail}"
alt="${escapeHTML(video.title)}">

<div class="featured-play">

<button
onclick="openVideo('${video.id}')">

▶

</button>

</div>

</div>

<div class="featured-info">

<h3>

${escapeHTML(video.title)}

</h3>

<p>

${shortText(video.description,300)}

</p>

<a
class="primary-btn"
href="https://youtu.be/${video.id}"
target="_blank">

Watch on YouTube

</a>

</div>

`;

}

/*====================================================
 CONTINUE FROM PART 1
====================================================*/

function finishLoading() {

    renderFeaturedVideo();

    renderVideos();

    updateCounter();

}

/*====================================================
 UPDATE loadLatestVideos()
====================================================*/

/*
Replace the end of loadLatestVideos()

filteredVideos = [...allVideos];

cacheVideos(allVideos);

finishLoading();

*/

/*====================================================
 HELPERS
====================================================*/

function shortText(text, length) {

    if (!text) return "";

    if (text.length <= length) return text;

    return text.substring(0, length) + "...";

}

function escapeHTML(str) {

    if (!str) return "";

    return str
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#39;");

}

/*====================================================
 PART 3
 SEARCH • FILTER • SORT • POPUP • EVENTS
====================================================*/

/*====================================================
 VIDEO POPUP
====================================================*/

const videoModal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const closeVideoBtn = document.getElementById("closeVideo");

function openVideo(videoId){

    if(!videoModal || !videoFrame) return;

    videoFrame.src =
    `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    videoModal.classList.add("active");

    document.body.style.overflow = "hidden";

}

function closeVideo(){

    if(!videoModal || !videoFrame) return;

    videoModal.classList.remove("active");

    videoFrame.src = "";

    document.body.style.overflow = "";

}

if(closeVideoBtn){

    closeVideoBtn.addEventListener("click",closeVideo);

}

if(videoModal){

    videoModal.addEventListener("click",(e)=>{

        if(e.target===videoModal){

            closeVideo();

        }

    });

}

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeVideo();

    }

});

/*====================================================
 LIVE SEARCH
====================================================*/

function searchVideos(keyword){

    const text = keyword.toLowerCase().trim();

    filteredVideos = allVideos.filter(video=>{

        return (

            video.title.toLowerCase().includes(text) ||

            video.description.toLowerCase().includes(text)

        );

    });

    currentPage = 1;

    renderVideos();

    updateCounter();

}

if(searchInput){

    searchInput.addEventListener("input",(e)=>{

        searchVideos(e.target.value);

    });

}

/*====================================================
 CATEGORY FILTER
====================================================*/

function filterVideos(category){

    document.querySelectorAll(".category-btn")
    .forEach(btn=>btn.classList.remove("active"));

    const activeBtn =
    document.querySelector(
        `[data-category="${category}"]`
    );

    if(activeBtn){

        activeBtn.classList.add("active");

    }

    if(category==="all"){

        filteredVideos=[...allVideos];

    }

    else{

        filteredVideos = allVideos.filter(video=>{

            const title =
            video.title.toLowerCase();

            const desc =
            video.description.toLowerCase();

            return (

                title.includes(category) ||

                desc.includes(category)

            );

        });

    }

    currentPage = 1;

    renderVideos();

    updateCounter();

}

categoryButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        filterVideos(button.dataset.category);

    });

});

/*====================================================
 SORTING
====================================================*/

function sortVideoList(type){

    switch(type){

        case "latest":

            filteredVideos.sort((a,b)=>

                new Date(b.published)-

                new Date(a.published)

            );

        break;

        case "oldest":

            filteredVideos.sort((a,b)=>

                new Date(a.published)-

                new Date(b.published)

            );

        break;

        case "title":

            filteredVideos.sort((a,b)=>

                a.title.localeCompare(b.title)

            );

        break;

    }

    renderVideos();

}

if(sortVideos){

    sortVideos.addEventListener("change",(e)=>{

        sortVideoList(e.target.value);

    });

}

/*====================================================
 MOBILE MENU
====================================================*/

const mobileMenu =
document.querySelector(".mobile-menu");

const navbar =
document.querySelector(".navbar");

if(mobileMenu){

    mobileMenu.addEventListener("click",()=>{

        navbar.classList.toggle("show");

        mobileMenu.classList.toggle("active");

    });

}

/*====================================================
 CLOSE MOBILE MENU
====================================================*/

document.querySelectorAll(".navbar a")
.forEach(link=>{

    link.addEventListener("click",()=>{

        navbar.classList.remove("show");

        mobileMenu.classList.remove("active");

    });

});

/*====================================================
 SMOOTH NAVIGATION
====================================================*/

document.querySelectorAll('a[href^="#"]')
.forEach(anchor=>{

    anchor.addEventListener("click",(e)=>{

        const target =
        document.querySelector(
            anchor.getAttribute("href")
        );

        if(!target) return;

        e.preventDefault();

        window.scrollTo({

            top:target.offsetTop-80,

            behavior:"smooth"

        });

    });

});

/*====================================================
 UPDATE SEARCH AFTER FILTER
====================================================*/

function refreshGallery(){

    renderFeaturedVideo();

    renderVideos();

    updateCounter();

}

/*====================================================
 PART 4
 LOAD MORE • ANIMATIONS • PERFORMANCE
====================================================*/

/*====================================================
 LOAD MORE VIDEOS
====================================================*/

if(loadMoreBtn){

    loadMoreBtn.addEventListener("click",()=>{

        currentPage++;

        renderVideos();

    });

}

/*====================================================
 BACK TO TOP
====================================================*/

const backToTop =
document.getElementById("backToTop");

window.addEventListener("scroll",()=>{

    if(window.scrollY>500){

        backToTop.classList.add("show");

    }

    else{

        backToTop.classList.remove("show");

    }

});

if(backToTop){

    backToTop.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

/*====================================================
 STICKY HEADER
====================================================*/

const header =
document.querySelector(".header");

window.addEventListener("scroll",()=>{

    if(window.scrollY>50){

        header.classList.add("scrolled");

    }

    else{

        header.classList.remove("scrolled");

    }

});

/*====================================================
 PAGE LOADER
====================================================*/

window.addEventListener("load",()=>{

    const loader =
    document.getElementById("pageLoader");

    if(loader){

        setTimeout(()=>{

            loader.classList.add("hide");

        },500);

    }

});

/*====================================================
 SCROLL REVEAL
====================================================*/

const reveals =
document.querySelectorAll(".reveal");

function revealElements(){

    const trigger =
    window.innerHeight*0.85;

    reveals.forEach(element=>{

        const top =
        element.getBoundingClientRect().top;

        if(top<trigger){

            element.classList.add("active");

        }

    });

}

window.addEventListener("scroll",revealElements);

window.addEventListener("load",revealElements);

/*====================================================
 COUNTER ANIMATION
====================================================*/

function animateCounter(element,target){

    let count=0;

    const speed=Math.ceil(target/80);

    const timer=setInterval(()=>{

        count+=speed;

        if(count>=target){

            count=target;

            clearInterval(timer);

        }

        element.textContent=count+"+";

    },20);

}

window.addEventListener("load",()=>{

    const totalVideos=
    document.getElementById("totalVideos");

    if(totalVideos){

        animateCounter(totalVideos,100);

    }

});

/*====================================================
 IMAGE FALLBACK
====================================================*/

document.addEventListener("error",(event)=>{

    if(event.target.tagName==="IMG"){

        event.target.src=
        CONFIG.DEFAULT_THUMBNAIL;

    }

},true);

/*====================================================
 CLEAR EXPIRED CACHE
====================================================*/

function clearExpiredCache(){

    const cache=
    localStorage.getItem("akkids_cache");

    if(!cache) return;

    const data=JSON.parse(cache);

    if(Date.now()-data.time>CONFIG.CACHE_TIME){

        localStorage.removeItem("akkids_cache");

    }

}

clearExpiredCache();

/*====================================================
 SAVE USER SETTINGS
====================================================*/

function savePreference(key,value){

    localStorage.setItem(key,value);

}

function getPreference(key){

    return localStorage.getItem(key);

}

/*====================================================
 PERFORMANCE
====================================================*/

let resizeTimer;

window.addEventListener("resize",()=>{

    clearTimeout(resizeTimer);

    resizeTimer=setTimeout(()=>{

        renderVideos();

    },250);

});

/*====================================================
 ONLINE / OFFLINE STATUS
====================================================*/

window.addEventListener("offline",()=>{

    console.warn("Internet connection lost.");

});

window.addEventListener("online",()=>{

    console.log("Internet connection restored.");

});

/*====================================================
 EMPTY SEARCH MESSAGE
====================================================*/

function checkEmptyResults(){

    if(filteredVideos.length===0){

        videoContainer.innerHTML=`

        <div class="no-results">

            <h2>

            😔 No Videos Found

            </h2>

            <p>

            Try another search keyword.

            </p>

        </div>

        `;

    }

}

const originalRender=renderVideos;

renderVideos=function(){

    originalRender();

    checkEmptyResults();

};

/*====================================================
 LAZY SCROLL OPTIMIZATION
====================================================*/

let scrollTimeout;

window.addEventListener("scroll",()=>{

    clearTimeout(scrollTimeout);

    scrollTimeout=setTimeout(()=>{

        revealElements();

    },15);

});

/*====================================================
 DEBUG INFO
====================================================*/

console.log(

"AK Kids Video Website Loaded Successfully"

);

console.log(

"Videos Loaded:",

allVideos.length

);

/*====================================================
 PART 5
 FINAL INTEGRATION
====================================================*/

/*====================================================
 REFRESH CACHE
====================================================*/

function refreshVideos(){

    localStorage.removeItem("akkids_cache");

    initializeWebsite();

}

/*====================================================
 AUTO REFRESH EVERY 30 MINUTES
====================================================*/

setInterval(()=>{

    refreshVideos();

},CONFIG.CACHE_TIME);

/*====================================================
 KEYBOARD SHORTCUTS
====================================================*/

document.addEventListener("keydown",(e)=>{

    // Focus Search

    if(e.key==="/" && searchInput){

        e.preventDefault();

        searchInput.focus();

    }

    // Scroll to Top

    if(e.key==="Home"){

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }

});

/*====================================================
 PRELOAD IMAGES
====================================================*/

function preloadImages(){

    allVideos.forEach(video=>{

        const img=new Image();

        img.src=video.thumbnail;

    });

}

window.addEventListener("load",()=>{

    if(allVideos.length){

        preloadImages();

    }

});

/*====================================================
 INTERSECTION OBSERVER
====================================================*/

const observer=new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("fade-in");

        }

    });

},{
    threshold:.20
});

document.querySelectorAll(".video-card,.stat-card,.feature")
.forEach(item=>{

    observer.observe(item);

});

/*====================================================
 PERFORMANCE INFO
====================================================*/

window.addEventListener("load",()=>{

    if(window.performance){

        console.log(

            "Page Loaded in",

            Math.round(performance.now()),

            "ms"

        );

    }

});

/*====================================================
 API VALIDATION
====================================================*/

function validateConfig(){

    if(

        CONFIG.API_KEY==="YOUR_API_KEY" ||

        CONFIG.CHANNEL_ID==="YOUR_CHANNEL_ID"

    ){

        console.warn(

            "Please update API Key and Channel ID."

        );

    }

}

validateConfig();

/*====================================================
 GLOBAL ERROR HANDLER
====================================================*/

window.addEventListener("error",(event)=>{

    console.error(

        "JavaScript Error:",

        event.message

    );

});

/*====================================================
 UNHANDLED PROMISES
====================================================*/

window.addEventListener(

    "unhandledrejection",

    event=>{

        console.error(

            "Promise Error:",

            event.reason

        );

    }

);

/*====================================================
 CONNECTION STATUS
====================================================*/

function updateConnectionStatus(){

    if(navigator.onLine){

        console.log("Online");

    }else{

        console.warn("Offline");

    }

}

window.addEventListener(

    "online",

    updateConnectionStatus

);

window.addEventListener(

    "offline",

    updateConnectionStatus

);

updateConnectionStatus();

/*====================================================
 STARTUP MESSAGE
====================================================*/

console.log(
"%cAK Kids Video Website",
"color:#4F46E5;font-size:22px;font-weight:bold;"
);

console.log(
"%cProfessional Version Loaded",
"color:#22C55E;font-size:16px;"
);

/*====================================================
 FINAL INITIALIZATION
====================================================*/

window.addEventListener("load",()=>{

    revealElements();

    updateCounter();

    console.log("Website Ready");

});