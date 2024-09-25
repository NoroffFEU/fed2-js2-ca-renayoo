import { API_SOCIAL_POSTS } from './api/constants.js'; 
import { headers } from './api/headers.js'; 

document.addEventListener("DOMContentLoaded", function () {
    init();
    setupLogoutButton(); 
});

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
        return responseData.data; 
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

// Display feed with published posts 
async function showFeed() {
    const feedContainer = document.querySelector('.feed');
    feedContainer.innerHTML = `
        <h2>New posts</h2>
        <p>Most recent posts:</p>
        <ul id="posts-container" class="posts-container"></ul>
    `;

    const posts = await fetchPosts(); 
    const postsContainer = document.getElementById('posts-container');

    if (posts.length === 0) {
        postsContainer.innerHTML = '<li>No posts available.</li>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('li');
        postElement.className = 'post';

        const titleElement = document.createElement('h4');
        titleElement.className = 'post-title';
        titleElement.textContent = post.title;

        const authorName = post.author ? post.author.name : 'Unknown Author';
        const authorElement = document.createElement('p');
        authorElement.className = 'post-author';
        authorElement.textContent = `By: ${authorName}`;

        const dateElement = document.createElement('p');
        dateElement.className = 'post-date';
        const date = new Date(post.created);
        dateElement.textContent = `Published on: ${date.toLocaleDateString()}`;

        // Only create the image element if there is an image in the post
        if (post.media && post.media.url) {
            const imgElement = document.createElement('img');
            imgElement.src = post.media.url; 
            imgElement.alt = post.media.alt || 'Post image'; 
            imgElement.addEventListener('click', () => {
                window.location.href = `/post/index.html?id=${post.id}`;
            });
            postElement.appendChild(imgElement); // Append image to post if there is one
        }

        const bodyElement = document.createElement('p');
        bodyElement.className = 'post-body';
        bodyElement.textContent = post.body;

        const tagsElement = document.createElement('p');
        tagsElement.className = 'post-tags';
        tagsElement.textContent = `Categories: ${post.tags.join(', ')}`;

        // Create a "View Post" button
        const viewPostButton = document.createElement('button');
        viewPostButton.textContent = 'View Post';
        viewPostButton.className = 'view-post-button';
        viewPostButton.addEventListener('click', () => {
            window.location.href = `/post/index.html?id=${post.id}`;
        });

        postElement.appendChild(titleElement);
        postElement.appendChild(authorElement);
        postElement.appendChild(dateElement);
        postElement.appendChild(bodyElement);
        postElement.appendChild(tagsElement);
        postElement.appendChild(viewPostButton);

        postsContainer.appendChild(postElement);
    });
}

async function handleLogout() {
    try {
        localStorage.removeItem('accessToken');
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
    if (isUserLoggedIn()) {
        await showFeed();
        updateMenuForLoggedInUser();
    } else {
        showLoginMessage();
        updateMenuForLoggedOutUser();
    }
}
