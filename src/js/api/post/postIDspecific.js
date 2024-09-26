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
        console.log('Fetched post data:', responseData); 
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
    const comments = Array.isArray(post.comments) ? post.comments : [];

    // Populate post details
    postDetailsContainer.innerHTML = `
        <h2>${post.title}</h2>
        ${post.media ? `
            <img src="${post.media.url}" alt="${post.media.alt}" />
        ` : ''}
        <p><strong>Published on:</strong> ${new Date(post.created).toLocaleDateString()}</p>
        <p><strong>Last Updated on:</strong> ${new Date(post.updated).toLocaleDateString()}</p>
        <p><strong>Body:</strong> ${post.body}</p>
        <p><strong>Categories:</strong> ${post.tags.join(', ')}</p>
        
        <h3>Reactions:</h3>
        <ul>
            ${reactions.length > 0 ? reactions.map(reaction => `
                <li>
                    <strong>${reaction.symbol}:</strong> ${reaction.count} (${reaction.reactors.join(', ')})
                </li>
            `).join('') : `<li>${post._count.reactions} reaction(s)</li>`}
        </ul>
        
        <h3>Comments:</h3>
        <ul id="commentList">
            ${comments.length > 0 ? comments.map(comment => `
                <li>
                    <p><strong>${comment.author.name}:</strong> ${comment.body}</p>
                    <p><small>Posted on: ${new Date(comment.created).toLocaleDateString()}</small></p>
                </li>
            `).join('') : `<li>${post._count.comments} comment(s)</li>`}
        </ul>

        <div>
            <textarea id="commentBody" placeholder="Write your comment here..."></textarea>
            <button id="submitComment">Submit Comment</button>
        </div>
    `;

    // Add event listener for the comment submission
    document.getElementById('submitComment').addEventListener('click', () => submitComment(postId));
}

// Function to submit a comment
async function submitComment(postId) {
    const commentBody = document.getElementById('commentBody').value;
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        alert('You must be logged in to submit a comment.');
        return;
    }

    if (!commentBody.trim()) {
        alert('Comment cannot be empty.');
        return;
    }

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}/comment`, {
            method: 'POST',
            headers: {
                ...headers(),
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    body: commentBody,
                    replyToId: null, // Adjust if you are implementing replies
                    postId: postId,
                    owner: JSON.parse(atob(accessToken.split('.')[1])).sub, // Use the user ID from the token
                },
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to submit comment');
        }

        // Clear the textarea
        document.getElementById('commentBody').value = '';

        // Optionally, refresh the post view to show the new comment
        await showPost(); // Refresh the post to get updated comments
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Failed to submit comment: ' + error.message);
    }
}

async function init() {
    if (isUserLoggedIn()) {
        await showPost(); // Showing post with specific ID
    } else {
        showLoginMessage(); // You must be logged in to see post
    }
}

