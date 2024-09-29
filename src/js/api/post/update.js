import { headers } from '../headers.js'; 
import { API_SOCIAL_POSTS } from '../constants.js'; 

const postId = new URLSearchParams(window.location.search).get('id');
const titleInput = document.getElementById('title');
const tagsInput = document.getElementById('tags');
const mediaUrlInput = document.getElementById('media-url');
const mediaAltInput = document.getElementById('media-alt');
const bodyInput = document.getElementById('body');
const saveButton = document.getElementById('save-changes-button');
const deleteButton = document.getElementById('delete-button');

// Fetch post and populate the form
async function fetchPost() {
    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
            headers: headers(), 
        });
        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }
        const postData = await response.json();
        populateForm(postData.data);
    } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post: ' + error.message);
    }
}

function populateForm(post) {
    document.getElementById('post-id').value = post.id;
    titleInput.value = post.title;
    tagsInput.value = post.tags.join(', '); 
    mediaUrlInput.value = post.media.url;
    mediaAltInput.value = post.media.alt;
    bodyInput.value = post.body;
}

// Update post function
async function updatePost() {
    const updatedPost = {
        title: titleInput.value,
        body: bodyInput.value,
        tags: tagsInput.value.split(',').map(tag => tag.trim()),
        media: {
            url: mediaUrlInput.value,
            alt: mediaAltInput.value,
        },
    };

    const requestHeaders = headers(true); // Pass true to set 'Content-Type'


    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
            method: 'PUT',
            headers: requestHeaders,
            body: JSON.stringify(updatedPost),
        });

        if (!response.ok) {
            throw new Error('Failed to update post');
        }

        alert('Post updated successfully!');
        window.location.href = '/'; // Redirect to home page after update
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post: ' + error.message);
    }
}

// Delete post function
async function deletePost() {
    const confirmation = confirm('Are you sure you want to delete this post?'); // Confirm action
    if (!confirmation) return;

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${postId}`, {
            method: 'DELETE',
            headers: headers(), // Use the headers function
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

// Event listeners
saveButton.addEventListener('click', updatePost);
deleteButton.addEventListener('click', deletePost);

// Fetch post on page load
fetchPost();
