import { headers } from '../headers.js'; // Ensure this imports correctly
import { API_SOCIAL_POSTS } from '../constants.js'; // Make sure this points to your posts API URL

export async function updatePost(id, { title, body, tags = [], media }) {
    // Log the data being sent for debugging
    console.log('Sending update with the following data:', {
        title,
        body,
        tags,
        media
    });

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${id}`, {
            method: 'PUT', 
            headers: headers(), 
            body: JSON.stringify({ title, body, tags, media }), 
        });

        if (!response.ok) {
            const errorText = await response.text(); 
            throw new Error(`Failed to update post: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.data; 
    } catch (error) {
        console.error('Error in updatePost function:', error);
        throw error; 
    }
}
