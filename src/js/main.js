import { API_SOCIAL_POSTS } from './api/constants.js'; 
import { headers } from './api/headers.js'; 

document.addEventListener("DOMContentLoaded", function () {
    init();
    setupLogoutButton(); 
});

// Constants for pagination
const POSTS_PER_PAGE = 12;
const TOTAL_POSTS = 60;

// Check accessToken in localStorage
function isUserLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

// Container if user not logged in
function showLoginMessage() {
    const feedContainer = document.querySelector('.feed');
    feedContainer.innerHTML = `
        <h2>You must be logged in to see the news feed</h2>
    `;
}

// Fetch posts
async function fetchPosts() {
    try {
        const response = await fetch(API_SOCIAL_POSTS, {
            method: 'GET',
            headers: headers(), 
        });

        if (!response.ok) {
            const errorDetails = await response.text(); 
            console.error('Response Error Details:', errorDetails); 
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log('Fetched Posts:', responseData.data); // Debugging output
        return responseData.data.slice(0, TOTAL_POSTS); // Limit to 60 posts
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

// Show Feed with Pagination
let currentPage = 1; // Track the current page
let allPosts = []; // Store all fetched posts

async function showFeed() {
    allPosts = await fetchPosts(); 
    renderPosts();
    renderPagination();
}

function renderPosts() {
    const feedContainer = document.querySelector('.feed');
    feedContainer.innerHTML = `
        <h2>New posts</h2>
        <p>Most recent posts:</p>
        <ul id="posts-container" class="posts-container"></ul>
    `;

    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; // Clear previous posts

    // Calculate posts to display
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsToDisplay = allPosts.slice(startIndex, endIndex);

    if (postsToDisplay.length === 0) {
        postsContainer.innerHTML = '<li>No posts available.</li>';
        return;
    }

    postsToDisplay.forEach(post => {
        const postElement = document.createElement('li');
        postElement.className = 'post';
    
        const titleElement = document.createElement('h4');
        titleElement.className = 'post-title';
        titleElement.textContent = post.title;
    
        const dateElement = document.createElement('p');
        dateElement.className = 'post-date';
        const date = new Date(post.created);
        dateElement.textContent = `Published on: ${date.toLocaleDateString()}`;
    
        // Image handling
        if (post.media && post.media.url) {
            const imgElement = document.createElement('img');
            imgElement.src = post.media.url; 
            imgElement.alt = post.media.alt || 'Post image'; 
            imgElement.addEventListener('click', () => {
                window.location.href = `/post/index.html?id=${post.id}`;
            });
            postElement.appendChild(imgElement);
        }
    
        const bodyElement = document.createElement('p');
        bodyElement.className = 'post-body';
        bodyElement.textContent = post.body;
    
        const tagsElement = document.createElement('p');
        tagsElement.className = 'post-tags';
        tagsElement.textContent = `Categories: ${post.tags.join(', ')}`;
        
        // Comments and reactions count
        const commentsCountElement = document.createElement('p');
        commentsCountElement.className = 'post-comments-count';
        commentsCountElement.textContent = `Comments: ${post._count.comments || 0}`;

        const reactionsCountElement = document.createElement('p');
        reactionsCountElement.className = 'post-reactions-count';
        reactionsCountElement.textContent = `Reactions: ${post._count.reactions || 0}`;
    
        const viewPostButton = document.createElement('button');
        viewPostButton.textContent = 'View Post';
        viewPostButton.className = 'view-post-button';
        viewPostButton.addEventListener('click', () => {
            window.location.href = `/post/index.html?id=${post.id}`;
        });
    
        postElement.appendChild(titleElement);
        postElement.appendChild(dateElement); 
        postElement.appendChild(bodyElement);
        postElement.appendChild(tagsElement);
        postElement.appendChild(commentsCountElement);
        postElement.appendChild(reactionsCountElement);
        postElement.appendChild(viewPostButton);
    
        postsContainer.appendChild(postElement);
    });    
}

function renderPagination() {
    const feedContainer = document.querySelector('.feed');
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    
    // Create previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1; // Disable if on the first page
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPosts();
            renderPagination();
            scrollToTop(); // Scroll to top on page change
        }
    });
    
    paginationContainer.appendChild(prevButton);
    
    // Create page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = (i === currentPage) ? 'active' : '';
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderPosts();
            renderPagination();
            scrollToTop(); // Scroll to top on page change
        });
        paginationContainer.appendChild(pageButton);
    }
    
    // Create next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPosts();
            renderPagination();
            scrollToTop(); // Scroll to top on page change
        }
    });
    
    paginationContainer.appendChild(nextButton);
    feedContainer.appendChild(paginationContainer);
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling
    });
}

async function handleLogout() {
    try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username'); 
        showLoginMessage();
        updateMenuForLoggedOutUser();
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

function setupLogoutButton() {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', async function () {
            await handleLogout();
        });
    } else {
        console.warn('Logout button not found'); 
    }
}

// Updated menu for logged out user
function updateMenuForLoggedOutUser() {
    const publishPostLink = document.querySelector('.SM-menu a[href="/post/create/index.html"]');
    const loginLink = document.querySelector('.SM-menu a[href="/auth/login/"]');
    const registerLink = document.querySelector('.SM-menu a[href="/auth/register/"]');
    const profileLink = document.querySelector('.SM-menu a[href="/profile/"]');
    const logoutButton = document.getElementById('logout');

    if (publishPostLink) publishPostLink.style.display = 'none'; 
    if (loginLink) loginLink.style.display = 'inline'; 
    if (registerLink) registerLink.style.display = 'inline'; 
    if (profileLink) profileLink.style.display = 'none'; 
    if (logoutButton) logoutButton.style.display = 'none'; 
}

// Showing and hiding menu for logged in user
function updateMenuForLoggedInUser() {
    const publishPostLink = document.querySelector('.SM-menu a[href="/post/create/index.html"]');
    const loginLink = document.querySelector('.SM-menu a[href="/auth/login/"]');
    const registerLink = document.querySelector('.SM-menu a[href="/auth/register/"]');
    const profileLink = document.querySelector('.SM-menu a[href="/profile/"]');
    const logoutButton = document.getElementById('logout');

    if (publishPostLink) publishPostLink.style.display = 'inline'; 
    if (loginLink) loginLink.style.display = 'none'; 
    if (registerLink) registerLink.style.display = 'none'; 
    if (profileLink) profileLink.style.display = 'inline'; 
    if (logoutButton) logoutButton.style.display = 'inline'; 
}

async function init() {
    const userIsLoggedIn = isUserLoggedIn();
    
    if (!userIsLoggedIn) {
        showLoginMessage(); 
    } else {
        await showFeed(); 
        updateMenuForLoggedInUser();
    }
}





