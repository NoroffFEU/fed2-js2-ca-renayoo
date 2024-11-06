import { API_SOCIAL_POSTS } from '../constants.js'; 
import { headers } from '../headers.js'; 

document.addEventListener("DOMContentLoaded", function () {
    init(); 
});

// Check if user is logged in
function isUserLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

// Get logged-in user's ID (assuming it's stored in localStorage)
function getLoggedInUserId() {
    return localStorage.getItem('userId');
}

// Show login message if user is not logged in
function showLoginMessage() {
    const postDetailsContainer = document.querySelector('.post-details');
    postDetailsContainer.innerHTML = `
        <h2>You must be logged in to see the post details</h2>
    `;
}

// Fetch post by ID with _author flag to get author details
async function fetchPostById(postId) {
    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}?_author=true&_comments=true&_reactions=true`, {
            method: 'GET',
            headers: headers(), 
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const responseData = await response.json();
        return responseData.data; 
    } catch (error) {
        console.error('Error fetching post:', error);
        return null; 
    }
}

// Retrieve logged-in user's name from localStorage
function getLoggedInUserName() {
    return localStorage.getItem('name');
}

// Display specific post by ID
async function showPost() {
    const postDetailsContainer = document.querySelector('.post-details');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postDetailsContainer.innerHTML = '<h2>No post ID specified.</h2>';
        return;
    }

    const post = await fetchPostById(postId);

    if (!post) {
        postDetailsContainer.innerHTML = '<h2>Post not found.</h2>';
        return;
    }

    const loggedInUserName = getLoggedInUserName();
    const isOwner = post.author && post.author.name === loggedInUserName;

    // Populate post details
    postDetailsContainer.innerHTML = `
        <h2>${post.title}</h2>
        ${post.media ? `<img src="${post.media.url}" alt="${post.media.alt}" />` : ''}
        <p><strong>Published on:</strong> ${new Date(post.created).toLocaleDateString()}</p>
        <p><strong>Last Updated on:</strong> ${new Date(post.updated).toLocaleDateString()}</p>
        <p><strong>Author:</strong> ${post.author ? post.author.name : 'Unknown'}</p>
        <p><strong>Body:</strong> ${post.body}</p>
        <p><strong>Categories:</strong> ${post.tags.join(', ')}</p>

        ${isOwner ? `
            <div>
                <button id="editPost">Edit Post</button>
                <button id="deletePost">Delete Post</button>
            </div>
        ` : ''}

        <h3>Reactions:</h3>
        <ul>
            ${post.reactions.length > 0 ? post.reactions.map(reaction => `
                <li>
                    <strong>${reaction.symbol}:</strong> ${reaction.count} (${reaction.reactors.join(', ')})
                </li>
            `).join('') : `<li>${post._count.reactions} reaction(s)</li>`}
        </ul>

        <h3>Comments:</h3>
        <p>${post._count.comments} comment(s)</p>
    `;

    if (isOwner) {
        document.getElementById('deletePost').addEventListener('click', () => deletePost(postId));
        document.getElementById('editPost').addEventListener('click', () => {
            window.location.href = `/post/edit/index.html?id=${postId}`;
        });
    }
}


// Initialize function
async function init() {
    if (isUserLoggedIn()) {
        await showPost(); // Show the post with specific ID
    } else {
        showLoginMessage(); // User must be logged in to see the post
    }
}

// Function to delete a post
async function deletePost(postId) {
    const confirmation = confirm('Are you sure you want to delete this post?'); // Confirm action
    if (!confirmation) return;

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
            method: 'DELETE',
            headers: headers(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete post');
        }

        alert('Post deleted successfully!');
        window.location.href = '/'; // Redirect to home page after deletion
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post: ' + error.message);
    }
}

