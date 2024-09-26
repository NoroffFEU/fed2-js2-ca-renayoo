import { API_SOCIAL_POSTS } from '../constants.js'; 
import { headers } from '../headers.js'; 

//Create post
export async function createPost({ title, body, tags, media }) {
    try {
        const postData = {
            title,
            body,
            tags: tags.split(',').map(tag => tag.trim())
        };

        // Only add media if both url and alt text are provided
        if (media.url && media.alt) {
            postData.media = {
                url: media.url,
                alt: media.alt,
            };
        }
        // Fetch api 
        const response = await fetch(API_SOCIAL_POSTS, {
            method: 'POST',
            headers: headers(true), 
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating post:', errorData);
            throw new Error('Failed to create post: ' + (errorData.message || "Unknown error"));
        }

        const responseData = await response.json();
        return responseData.data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;  
    }
}


// Event listener for creating a post
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createPost');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const title = document.getElementById('title').value;
            const body = document.getElementById('body').value;
            const tags = document.getElementById('tags').value;
            const mediaUrl = document.getElementById('media-url').value.trim(); 
            const mediaAlt = document.getElementById('media-alt').value.trim(); 

            // Construct media object
            const media = {
                url: mediaUrl || null,  
                alt: mediaAlt || null,  
            };

            // Check if media fields are empty
            if (!media.url || !media.alt) {
                console.warn('Media URL or Alt text is empty. Media will not be added.');
            }

            try {
                const createdPost = await createPost({
                    title,
                    body,
                    tags,
                    media
                });

            // Redirect or show confirmation message
            window.location.href = '/'; 
            } catch (error) {
                console.error('Failed to create post:', error.message);
                alert('Failed to create post: ' + error.message);
            }
        });
    }
});

