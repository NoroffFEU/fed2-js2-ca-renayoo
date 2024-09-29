import { API_SOCIAL_POSTS } from '../constants.js'; 
import { headers } from '../headers.js'; 

document.addEventListener("DOMContentLoaded", function () {
    init(); 
});

// User logged in check localStorage
function isUserLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

// If not logged in, show this message 
function showLoginMessage() {
    const postDetailsContainer = document.querySelector('.post-details');
    postDetailsContainer.innerHTML = `
        <h2>You must be logged in to see the post details</h2>
    `;
}

// Fetch ID post
async function fetchPostById(postId) {
    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
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

// Display a specific post by ID
async function showPost() {
    const postDetailsContainer = document.querySelector('.post-details');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postDetailsContainer.innerHTML = '<h2>No post ID specified.</h2>';
        return;
    }

    const post = await fetchPostById(postId); // Fetch the specific post

    if (!post) {
        postDetailsContainer.innerHTML = '<h2>Post not found.</h2>';
        return;
    }

    const reactions = Array.isArray(post.reactions) ? post.reactions : [];
    const commentsCount = post._count.comments || 0;

    // Populate post details
    postDetailsContainer.innerHTML = `
        <h2>${post.title}</h2>
        ${post.media ? `<img src="${post.media.url}" alt="${post.media.alt}" />` : ''}
        <p><strong>Published on:</strong> ${new Date(post.created).toLocaleDateString()}</p>
        <p><strong>Last Updated on:</strong> ${new Date(post.updated).toLocaleDateString()}</p>
        <p><strong>Body:</strong> ${post.body}</p>
        <p><strong>Categories:</strong> ${post.tags.join(', ')}</p>

        <!-- Edit and Delete buttons -->
        <div>
            <button id="editPost">Edit Post</button>
            <button id="deletePost">Delete Post</button>
        </div>

        <h3>Reactions:</h3>
        <ul>
            ${reactions.length > 0 ? reactions.map(reaction => `
                <li>
                    <strong>${reaction.symbol}:</strong> ${reaction.count} (${reaction.reactors.join(', ')})
                </li>
            `).join('') : `<li>${post._count.reactions} reaction(s)</li>`}
        </ul>

        <h3>Comments:</h3>
        <p>${commentsCount} comment(s)</p>
    `;

    // Event listeners 
    document.getElementById('deletePost').addEventListener('click', () => deletePost(postId));
    document.getElementById('editPost').addEventListener('click', () => {
        window.location.href = `/post/edit/index.html?id=${postId}`;
    });
}

// Initialize function
async function init() {
    if (isUserLoggedIn()) {
        await showPost(); // Showing post with specific ID
    } else {
        showLoginMessage(); // You must be logged in to see post
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
