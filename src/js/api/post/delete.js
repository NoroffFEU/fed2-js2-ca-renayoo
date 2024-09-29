export async function deletePost(id) {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`${API_SOCIAL_POSTS}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Handle successful deletion (e.g., redirect to feed or show message)
            alert("Post deleted successfully.");
            window.location.href = "/"; // Redirect to feed
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post: ' + error.message);
    }
}

