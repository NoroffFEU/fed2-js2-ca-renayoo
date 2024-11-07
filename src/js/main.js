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
    const feedContainer = document.querySelector('.feed');
    feedContainer.innerHTML = `
        <h2>New posts</h2>
        <p>Most recent posts:</p>
        <div id="posts-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
    `;

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
        // Ensure reactions object is initialized
        if (!post.reactions) {
            post.reactions = {}; // Initialize if not present
        }

        // Initialize reaction counts for each symbol if not already initialized
        const reactionSymbols = ['👍', '❤️', '😂', '😮', '😢', '😡'];
        reactionSymbols.forEach(symbol => {
            if (post.reactions[symbol] === undefined) {
                post.reactions[symbol] = 0; // Default to 0 if not present
            }
        });

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
            imgElement.className = 'w-full h-48 object-cover rounded-md cursor-pointer'; // Added cursor-pointer for clickability
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

        // Reaction buttons and their counts
        const reactionsSection = document.createElement('div');
        reactionsSection.className = 'reaction-buttons flex space-x-2 mt-2';

        reactionSymbols.forEach(symbol => {
            const reactionButton = document.createElement('button');
            reactionButton.className = 'reaction-button bg-gray-200 text-lg p-2 rounded';
            reactionButton.textContent = symbol;

            // Create a counter display for each reaction
            const reactionCountElement = document.createElement('span');
            reactionCountElement.className = 'reaction-count text-sm ml-2';
            reactionCountElement.textContent = post.reactions[symbol]; // Use the reaction count for the symbol

            reactionButton.appendChild(reactionCountElement);

            // Add event listener to handle click
            reactionButton.setAttribute('data-symbol', symbol);
            reactionButton.addEventListener('click', async function () {
                // Update the reaction count on the server
                await addReactionToPost(post.id, symbol);

                // Update the counter dynamically without reloading
                reactionCountElement.textContent = (parseInt(reactionCountElement.textContent) + 1);
            });

            reactionsSection.appendChild(reactionButton);
        });

        const viewPostButton = document.createElement('button');
        viewPostButton.textContent = 'View Post';
        viewPostButton.className = 'view-post-button mt-4 bg-blue-500 text-white p-2 rounded-md';
        viewPostButton.addEventListener('click', () => {
            window.location.href = `/post/index.html?id=${post.id}`;
        });

        postElement.appendChild(titleElement);
        postElement.appendChild(dateElement);
        postElement.appendChild(bodyElement);
        postElement.appendChild(tagsElement);
        postElement.appendChild(commentsCountElement);
        postElement.appendChild(reactionsSection); // Append reactions section
        postElement.appendChild(viewPostButton);

        postsContainer.appendChild(postElement);
    });
}

// Pagination rendering logic
function renderPagination() {
    const feedContainer = document.querySelector('.feed');
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination mt-4 flex justify-center space-x-2';

    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

    // Create previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'bg-gray-300 p-2 rounded';
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
        pageButton.className = (i === currentPage) ? 'bg-blue-500 text-white p-2 rounded' : 'bg-gray-300 p-2 rounded';
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
    nextButton.className = 'bg-gray-300 p-2 rounded';
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

    // Append the pagination container to the feed
    feedContainer.appendChild(paginationContainer);
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling
    });
}

// Function to update the reaction count on the server
async function addReactionToPost(postId, symbol) {
    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}/react/${symbol}`, {
            method: 'PUT',
            headers: headers(),
        });

        if (!response.ok) {
            throw new Error('Failed to add reaction');
        }
    } catch (error) {
        console.error('Error adding reaction:', error);
    }
}

// Function to set up logout button functionality
function setupLogoutButton() {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            location.reload(); // Refresh the page after logging out
        });
    }
}

// Initialize the app
function init() {
    if (isUserLoggedIn()) {
        showFeed();
    } else {
        showLoginMessage();
    }
}



