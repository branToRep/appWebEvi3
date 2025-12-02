const API_BASE = 'http://localhost:5068/api/blog';

//Get all blog posts
async function getAllPosts() {
    try {
        const response = await fetch(API_BASE);
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

//Get specific post by ID
async function getPostById(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Post not found');
        const post = await response.json();
        return post;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

async function createPost(postData) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) throw new Error('Failed to create post');
        const newPost = await response.json();
        return newPost;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

//UI functions
async function displayPosts() {
    const posts = await getAllPosts();
    const container = document.getElementById('postsContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>By ${post.author} on ${new Date(post.createdDate).toLocaleDateString()}</small>
            <br>
            <small>ID: ${post.id}</small>
        `;
        container.appendChild(postElement);
    });
}

//Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('postForm');
    
    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const postData = {
                title: document.getElementById('title').value,
                content: document.getElementById('content').value,
                author: document.getElementById('author').value
            };

            try {
                await createPost(postData);
                alert('Post created successfully!');
                postForm.reset();
                await displayPosts(); //Refresh the posts list
            } catch (error) {
                alert('Error creating post');
            }
        });
    }
    
    //Load posts when page loads
    displayPosts();
});

//Make functions available globally if needed
window.blogAPI = {
    getAllPosts,
    getPostById,
    createPost,
    displayPosts
};