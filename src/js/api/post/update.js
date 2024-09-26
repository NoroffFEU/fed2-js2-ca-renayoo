export async function updatePost(id, { title, body, tags, media }) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, body, tags, media }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const updatedPost = await response.json();
        // Handle successful update (e.g., show message or redirect)
        alert("Post updated successfully.");
        window.location.href = `/post?id=${id}`; // Redirect to updated post
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post: ' + error.message);
    }
}