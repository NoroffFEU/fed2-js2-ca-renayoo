import { API_SOCIAL_PROFILES, API_SOCIAL_POSTS, API_BASE } from "../constants"; 
import { headers } from "../headers"; 

// Function to fetch the profile of a user
async function fetchProfile(name) {
    try {
        const response = await fetch(`${API_SOCIAL_PROFILES}/${name}`, {
            method: "GET",
            headers: headers(),
        });

        if (!response.ok) {
            throw new Error("Profile not found");
        }

        const data = await response.json();
        const profile = data.data;

        // Update the profile information in the DOM
        document.getElementById('banner').src = profile.banner.url;
        document.getElementById('banner').alt = profile.banner.alt;
        document.getElementById('avatar').src = profile.avatar.url;
        document.getElementById('avatar').alt = profile.avatar.alt;
        document.getElementById('name').textContent = profile.name;
        document.getElementById('email').textContent = profile.email;
        document.getElementById('bio').textContent = profile.bio;
        document.getElementById('posts-count').textContent = profile._count.posts;
        document.getElementById('followers-count').textContent = profile._count.followers;
        document.getElementById('following-count').textContent = profile._count.following;

        // Fetch the posts made by the user
        fetchUserPosts(profile.name); // Fetch posts for the viewed profile

        // Handle the follow button logic
        handleFollowButton(profile);

        // Create and render 'Back to Feed' button dynamically with spacing
        const backToFeedButtonContainer = document.getElementById('profile-container'); // The container where the button will be added
        const backToFeedButton = document.createElement('button');
        backToFeedButton.textContent = 'Back to Feed';
        backToFeedButton.className = 'bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 mt-4 mb-6'; // Tailwind classes for green button with margin

        backToFeedButton.addEventListener('click', () => {
            window.location.href = '/';  // Navigate to the feed page
        });

        // Append the 'Back to Feed' button to the profile container
        backToFeedButtonContainer.insertBefore(backToFeedButton, backToFeedButtonContainer.firstChild);  // Insert at the top of the container

    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

// Function to fetch all posts made by the user 
async function fetchUserPosts(username) {
    try {
        const response = await fetch(`${API_SOCIAL_PROFILES}/${username}/posts`, {
            method: "GET",
            headers: headers(),
        });

        if (!response.ok) {
            throw new Error("Error fetching posts");
        }

        // Parse the response JSON
        const data = await response.json();
        const posts = data.data;

        // Check if there are posts
        if (posts && posts.length > 0) {
            displayUserPosts(posts); // Display the posts
        } else {
            document.getElementById('posts-list').innerHTML = '<p>No posts available.</p>';
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

// Function to display the list of posts
function displayUserPosts(posts) {
    const postsContainer = document.getElementById('posts-list');
    postsContainer.innerHTML = '';  // Clear previous posts

    // Loop through posts and create elements for each
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item mb-6 p-4 bg-white rounded-lg shadow-md';

        const postTitle = document.createElement('h4');
        postTitle.className = 'text-xl font-semibold text-gray-800';
        postTitle.textContent = post.title;
        postElement.appendChild(postTitle);

        const postBody = document.createElement('p');
        postBody.className = 'text-gray-600';
        postBody.textContent = post.body.length > 100 ? post.body.substring(0, 100) + '...' : post.body;
        postElement.appendChild(postBody);

        const postDate = document.createElement('p');
        postDate.className = 'text-sm text-gray-500 mt-2';
        const date = new Date(post.created);
        postDate.textContent = `Published on: ${date.toLocaleDateString()}`;
        postElement.appendChild(postDate);

        // Add a button to view the post
        const viewPostButton = document.createElement('button');
        viewPostButton.textContent = 'View Post';
        viewPostButton.addEventListener('click', () => {
            window.location.href = `/post/index.html?id=${post.id}`;
        });
        
        // Tailwind classes for "View Post" button
        viewPostButton.className = 'mt-4 px-6 py-2 bg-lilac-500 text-white font-semibold rounded-lg hover:bg-lilac-600 transition duration-300';

        postElement.appendChild(viewPostButton);

        postsContainer.appendChild(postElement);
    });
}

function handleFollowButton(profile) {
    const followButton = document.getElementById('follow-btn');

    // Check if the follow button exists
    if (!followButton) {
        console.error('Follow button not found!');
        return; // Exit early if the button doesn't exist
    }

    // Get the logged-in user's name
    const loggedInUserName = localStorage.getItem('name');

    // If the profile belongs to the logged-in user, hide the follow button
    if (profile.name === loggedInUserName) {
        followButton.style.display = 'none';
        return;
    }

    // Check localStorage for follow status
    const followStatus = JSON.parse(localStorage.getItem('followStatus')) || {};
    let isFollowing = followStatus[profile.name] || false;  // Use `let` here

    // Set the button text based on whether the user is following
    followButton.textContent = isFollowing ? 'Unfollow' : 'Follow';

    // Add event listener for follow/unfollow action
    followButton.removeEventListener('click', followUnfollowAction);
    followButton.addEventListener('click', followUnfollowAction);

    // Action for follow/unfollow
    async function followUnfollowAction() {
        if (isFollowing) {
            await unfollowUser(profile.name);
            followButton.textContent = 'Follow';
            const followersCount = document.getElementById('followers-count');
            followersCount.textContent = parseInt(followersCount.textContent) - 1;

            // Update follow status in localStorage
            followStatus[profile.name] = false;
            localStorage.setItem('followStatus', JSON.stringify(followStatus));
        } else {
            await followUser(profile.name);
            followButton.textContent = 'Unfollow';
            const followersCount = document.getElementById('followers-count');
            followersCount.textContent = parseInt(followersCount.textContent) + 1;

            // Update follow status in localStorage
            followStatus[profile.name] = true;
            localStorage.setItem('followStatus', JSON.stringify(followStatus));
        }

        // Update the isFollowing state after the action
        isFollowing = !isFollowing; 
    }
}


// Function to follow a user
async function followUser(name) {
    try {
        const response = await fetch(`${API_BASE}/social/profiles/${name}/follow`, {
            method: "PUT",
            headers: headers(),
        });

        if (!response.ok) {
            const errorResponse = await response.json(); 
            console.error("Error response:", errorResponse.errors); // Log the error details for debugging
            throw new Error("Error following the user");
        }

    } catch (error) {
        console.error("Error following user:", error);
    }
}

// Function to unfollow a user
async function unfollowUser(name) {
    try {
        const response = await fetch(`${API_BASE}/social/profiles/${name}/unfollow`, {
            method: "PUT",
            headers: headers(),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Error response:", errorResponse.errors);
            throw new Error("Error unfollowing the user");
        }

    } catch (error) {
        console.error("Error unfollowing user:", error);
    }
}

// Get the profile name from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const profileName = urlParams.get('name');  

// If 'name' exists, fetch that user's profile other else, fetch the logged-in user's profile
if (profileName) {
    fetchProfile(profileName);
} else {
    const loggedInUserName = localStorage.getItem('name');
    fetchProfile(loggedInUserName);
}
