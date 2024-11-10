import { API_SOCIAL_POSTS } from './api/constants.js'; 
import { headers } from './api/headers.js'; 

document.addEventListener("DOMContentLoaded", function () {
    showFeed();  // Call showFeed directly
    setupLogoutButton();  // Setup logout button
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

// Function to render posts based on the current page
function renderPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; // Clear previous posts

    // Calculate posts to display
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsToDisplay = allPosts.slice(startIndex, endIndex);

    if (postsToDisplay.length === 0) {
        postsContainer.innerHTML = '<div>No posts available.</div>';
        return;
    }

    postsToDisplay.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post bg-white p-4 rounded-lg shadow-md';

        const titleElement = document.createElement('h4');
        titleElement.className = 'post-title text-xl font-semibold';
        titleElement.textContent = post.title;

        const dateElement = document.createElement('p');
        dateElement.className = 'post-date text-gray-500 text-sm';
        const date = new Date(post.created);
        dateElement.textContent = `Published on: ${date.toLocaleDateString()}`;

        // Image handling (clickable)
        if (post.media && post.media.url) {
            const imgElement = document.createElement('img');
            imgElement.src = post.media.url;
            imgElement.alt = post.media.alt || 'Post image';
            imgElement.className = 'w-full max-h-96 object-cover rounded-md cursor-pointer';  // Image size increased
            imgElement.addEventListener('click', () => {
                window.location.href = `/post/index.html?id=${post.id}`; // Redirect to the post when image is clicked
            });
            postElement.appendChild(imgElement);
        }

        const bodyElement = document.createElement('p');
        bodyElement.className = 'post-body text-gray-700 mt-2';
        bodyElement.textContent = post.body;

        const tagsElement = document.createElement('p');
        tagsElement.className = 'post-tags text-gray-500 text-sm';
        tagsElement.textContent = `Categories: ${post.tags.join(', ')}`;

        // Comments count
        const commentsCountElement = document.createElement('p');
        commentsCountElement.className = 'post-comments-count text-gray-500 text-sm';
        commentsCountElement.textContent = `Comments: ${post._count.comments || 0}`;

        // Add all elements to the post container
        postElement.appendChild(titleElement);
        postElement.appendChild(dateElement);
        postElement.appendChild(bodyElement);
        postElement.appendChild(tagsElement);
        postElement.appendChild(commentsCountElement);

        postsContainer.appendChild(postElement);
    });
}


function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; // Clear existing pagination

    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    const pageButtons = [];

    // Previous page button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600';
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPosts();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        }
    });

    pageButtons.push(prevButton);

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-button bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300';
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('bg-blue-500', 'text-white');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderPosts();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        });
        pageButtons.push(pageButton);
    }

    // Next page button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600';
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPosts();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        }
    });

    pageButtons.push(nextButton);

    // Add all pagination buttons to the container
    pageButtons.forEach(button => {
        paginationContainer.appendChild(button);
    });
}


// setupLogoutButton function
function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            window.location.href = 'auth/login/index.html'; // Redirect to login page
        });
    }
}
