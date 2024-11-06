import { API_SOCIAL_PROFILES, API_SOCIAL_POSTS } from "../constants"; 
import { headers } from "../headers"; 

// Function to fetch user profile by name
async function fetchProfile(name) {
    try {
        // Fetch the profile data
        const response = await fetch(`${API_SOCIAL_PROFILES}/${name}`, {
            method: "GET",
            headers: headers(),
        });

        if (!response.ok) {
            throw new Error("Profile not found");
        }

        // Parse the response JSON
        const data = await response.json();
        const profile = data.data;  // Extract profile data

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
        await fetchUserPosts(profile.name, 1); // Fetch posts for page 1

    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

// Function to fetch posts made by the user (with pagination support)
async function fetchUserPosts(username, page = 1) {
    const postsPerPage = 5; // Set the limit to 5 posts per page

    try {
        const response = await fetch(`${API_SOCIAL_PROFILES}/${name}/posts?page=${page}&limit=${postsPerPage}`, {
            method: "GET",
            headers: headers(),
        });

        if (!response.ok) {
            throw new Error("Error fetching posts");
        }

        // Parse the response JSON
        const data = await response.json();
        const posts = data.data; 
        const meta = data.meta;  

        // Check if there are posts
        if (posts && posts.length > 0) {
            displayUserPosts(posts); // Display the posts
            renderPagination(meta); // Render pagination buttons
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
    postsContainer.innerHTML = ''; 

    // Loop through posts and create elements for each
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';

        const postTitle = document.createElement('h4');
        postTitle.textContent = post.title;
        postElement.appendChild(postTitle);

        const postBody = document.createElement('p');
        postBody.textContent = post.body.length > 100 ? post.body.substring(0, 100) + '...' : post.body;
        postElement.appendChild(postBody);

        const postDate = document.createElement('p');
        const date = new Date(post.created);
        postDate.textContent = `Published on: ${date.toLocaleDateString()}`;
        postElement.appendChild(postDate);

        // Add a button to view the post
        const viewPostButton = document.createElement('button');
        viewPostButton.textContent = 'View Post';
        viewPostButton.addEventListener('click', () => {
            window.location.href = `/post/index.html?id=${post.id}`;
        });
        postElement.appendChild(viewPostButton);

        postsContainer.appendChild(postElement);
    });
}

// Function to render pagination buttons
function renderPagination(meta) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; 

    const totalPages = meta.pageCount;

    // Create previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = !meta.isFirstPage; // Disavle btn if 1st page
    prevButton.addEventListener('click', () => {
        if (!meta.isFirstPage) {
            fetchUserPosts(localStorage.getItem('name'), meta.previousPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Create page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            fetchUserPosts(localStorage.getItem('name'), i);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Create next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = !meta.isLastPage; // Disable if on the last page
    nextButton.addEventListener('click', () => {
        if (!meta.isLastPage) {
            fetchUserPosts(localStorage.getItem('name'), meta.nextPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Get the name from localStorage 
const name = localStorage.getItem('name');

// If the user is logged in and their name is available, fetch their profile
if (name) {
    fetchProfile(name);  
} else {
    console.log('No user is logged in.');
    window.location.href = "/login";  // Redirect to the login page if not logged in
}
