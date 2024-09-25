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

    // Get logged-in user's access token and extract user info
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error("No access token found");
        showLoginMessage(); // User must be logged in
        return;
    }

    // Decode the token to get user ID (Assuming it's stored in the sub field)
    const userId = JSON.parse(atob(accessToken.split('.')[1])).sub; // Adjust according to your token's structure

    console.log('User ID from token:', userId);  // Log the user ID for debugging
    console.log('Post author ID:', post.author ? post.author.id : 'No author ID'); // Log the post author ID

    // Check if the logged-in user ID matches the post's author ID
    const isAuthor = post.author && post.author.id === userId;

    // Populate post details
    postDetailsContainer.innerHTML = `
        <h2>${post.title}</h2>
        <img src="${post.media ? post.media.url : 'images/noroff-logo.png'}" alt="${post.media ? post.media.alt : 'No image available'}" />
        <p><strong>By:</strong> ${post.author ? post.author.name : 'Unknown Author'}</p>
        <p><strong>Published on:</strong> ${new Date(post.created).toLocaleDateString()}</p>
        <p>${post.body}</p>
        <p><strong>Categories:</strong> ${post.tags.join(', ')}</p>
    `;

    // Show edit and delete buttons if the user is the author
    if (isAuthor) {
        postDetailsContainer.innerHTML += `
            <button id="editPost" data-id="${postId}">Edit</button>
            <button id="deletePost" data-id="${postId}">Delete</button>
        `;

        document.getElementById('editPost').addEventListener('click', () => editPost(postId));
        document.getElementById('deletePost').addEventListener('click', () => deletePost(postId));
    } else {
        console.log("User is not the author of this post."); // Log for debugging
    }
}

// Function to edit a post
async function editPost(postId) {
    const post = await fetchPostById(postId);
    if (!post) return;

    // Simple prompt for editing (for demonstration purposes)
    const newTitle = prompt("Enter new title:", post.title);
    const newBody = prompt("Enter new body:", post.body);
    
    if (newTitle && newBody) {
        try {
            const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify({
                    title: newTitle,
                    body: newBody,
                    tags: post.tags, // Keep the same tags or update as needed
                    media: post.media, // Keep the same media or update as needed
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            const updatedPost = await response.json();
            console.log('Post updated successfully:', updatedPost.data);
            await showPost(); // Refresh the post view
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post: ' + error.message);
        }
    }
}

// Function to delete a post
async function deletePost(postId) {
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
            method: 'DELETE',
            headers: headers(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete post');
        }

        console.log('Post deleted successfully');
        window.location.href = '/'; // Redirect to home or feed after deletion
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post: ' + error.message);
    }
}

async function init() {
    if (isUserLoggedIn()) {
        await showPost(); // Showing post with specific ID
    } else {
        showLoginMessage(); // You must be logged in to see post
    }
}
