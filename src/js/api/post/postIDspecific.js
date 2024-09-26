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

    // Event listeners 
    document.getElementById('deletePost').addEventListener('click', () => deletePost(postId));
    document.getElementById('editPost').addEventListener('click', () => showEditForm(post));

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
            headers: headers(),
            body: JSON.stringify({
                body: commentBody,
                owner: JSON.parse(atob(accessToken.split('.')[1])).sub, // Assuming this is correct
            }),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Capture detailed error response
            console.error('Error submitting comment:', errorData);
            throw new Error('Failed to submit comment: ' + (errorData.message || "Unknown error"));
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

// Function to display the edit form
function showEditForm(post) {
    const postDetailsContainer = document.querySelector('.post-details');
    postDetailsContainer.innerHTML = `
        <h2>Edit Post</h2>
        <form id="editPostForm">
            <label for="title">Title</label>
            <input type="text" id="title" value="${post.title}" required />

            <label for="body">Body</label>
            <textarea id="body" required>${post.body}</textarea>

            <label for="media">Media URL</label>
            <input type="text" id="media" value="${post.media?.url || ''}" required />

            <label for="alt">Media Alt Text</label>
            <input type="text" id="alt" value="${post.media?.alt || ''}" required />

            <label for="tags">Categories (comma separated)</label>
            <input type="text" id="tags" value="${post.tags.join(', ')}" required />

            <button type="submit">Save Changes</button>
        </form>
    `;

    document.getElementById('editPostForm').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form from submitting the usual way

        // Constructing updatedPost with correct structure
        const updatedPost = {
            title: document.getElementById('title').value,
            body: document.getElementById('body').value,
            media: {
                url: document.getElementById('media').value,
                alt: document.getElementById('alt').value // Adding the alt text
            },
            tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()),
        };

        // Logging the updatedPost object to verify its structure
        console.log('Updated post object:', updatedPost);

        // Call the editPost function with the constructed updatedPost object
        editPost(post.id, updatedPost);
    });

}

// The editPost function 
async function editPost(postId, updatedPost) {
    console.log('Sending update with the following data:', updatedPost);

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(updatedPost),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error updating post:', errorData);
            throw new Error('Failed to update post: ' + (errorData.errors ? errorData.errors.map(e => e.message).join(', ') : 'Unknown error'));
        }

        const responseData = await response.json();
        alert('Post updated successfully!');
        window.location.href = '/';
    } catch (error) {
        console.error('Error editing post:', error);
        alert('Failed to edit post: ' + error.message);
    }
}

