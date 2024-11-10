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


// Show post
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
        <p><strong>Author:</strong> <a href="javascript:void(0);" id="author-name" style="text-decoration: underline; color: blue; cursor: pointer;">${post.author.name}</a></p>
        <div class="post-body">
            ${post.body ? `<p>${post.body}</p>` : '<p>No content available for this post.</p>'}
        </div>
        ${isOwner ? `
            <div>
                <button id="editPost" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">Edit Post</button>
                <button id="deletePost" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Delete Post</button>
            </div>
        ` : ''}
        <h3>Reactions:</h3>
        <div class="reaction-buttons">
            <button class="reaction-button" data-symbol="👍">👍</button>
            <button class="reaction-button" data-symbol="❤️">❤️</button>
            <button class="reaction-button" data-symbol="😂">😂</button>
            <button class="reaction-button" data-symbol="😮">😮</button>
            <button class="reaction-button" data-symbol="😢">😢</button>
            <button class="reaction-button" data-symbol="😡">😡</button>
        </div>
        <ul>
            ${post.reactions.length > 0 ? post.reactions.map(reaction => `
                <li>
                    <strong>${reaction.symbol}:</strong> ${reaction.count} (${reaction.reactors.join(', ')})
                </li>
            `).join('') : `<li>${post._count.reactions} reaction(s)</li>`}
        </ul>
        <h3>Comments:</h3>
        <p>${post._count.comments} comment(s)</p>
        <ul class="comments-list">
            ${post.comments && post.comments.length > 0 ? post.comments.map(comment => `
                <li>
                    <p><strong>${comment.owner}:</strong> ${comment.body}</p>
                    <p><small>Posted on: ${new Date(comment.created).toLocaleDateString()}</small></p>
                    <button class="reply-button" data-comment-id="${comment.id}">Reply</button>
                    <ul class="replies-list">
                        ${comment.replies ? comment.replies.map(reply => `
                            <li><strong>${reply.owner}:</strong> ${reply.body}</li>
                        `).join('') : ''}
                    </ul>
                    <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
                        <textarea id="reply-body-${comment.id}" placeholder="Write a reply..."></textarea>
                        <button class="submit-reply" data-comment-id="${comment.id}">Submit Reply</button>
                    </div>
                </li>
            `).join('') : '<li>No comments available.</li>'}
        </ul>
        <h3>Leave a Comment:</h3>
        <div class="comment-form">
            <textarea id="commentBody" placeholder="Write your comment..."></textarea>
            <button id="submitComment">Submit Comment</button>
        </div>
    `;

    // Event listeners for reactions
    document.querySelectorAll('.reaction-button').forEach(button => {
        button.addEventListener('click', async function () {
            const symbol = button.getAttribute('data-symbol');
            await addReactionToPost(postId, symbol);
            await showPost(); // Refresh the post details after adding reaction
        });
    });

    // Handle comment submission
    document.getElementById('submitComment').addEventListener('click', async () => {
        const commentBody = document.getElementById('commentBody').value.trim();
        if (commentBody) {
            await submitComment(postId, commentBody);
            await showPost(); // Refresh the post details after adding the comment
        }
    });

    // Handle edit and delete buttons for the post owner
    if (isOwner) {
        document.getElementById('deletePost').addEventListener('click', () => deletePost(postId));
        document.getElementById('editPost').addEventListener('click', () => {
            window.location.href = `/post/edit/index.html?id=${postId}`;
        });
    }

    // Redirect to profile
    document.getElementById('author-name').addEventListener('click', () => {
        window.location.href = `/profile/index.html?name=${post.author.name}`; // Redirect to author's profile page
    });
}

// Add reaction to post
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


// Submit a comment - Not working (Authentication issues)
async function submitComment(postId, commentBody) {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("You must be logged in to comment.");
            return;
        }

        const requestBody = {
            body: commentBody
        };

        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Error response:', errorResponse);
            throw new Error('Failed to submit comment');
        }

        alert('Comment submitted successfully!');
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Error submitting comment: ' + error.message);
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
