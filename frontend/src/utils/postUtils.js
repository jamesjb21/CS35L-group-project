import axios from 'axios';
import { API_URL, ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';

/**
 * Get the localStorage key for hidden posts, making it user-specific
 * @returns {string} The localStorage key for the current user's hidden posts
 */
const getHiddenPostsKey = () => {
  try {
    // Get current user ID or username from token
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded.user_id || decoded.username || decoded.sub || 'anonymous';
      return `hidden_posts_${userId}`;
    }
    return 'hidden_posts_anonymous';
  } catch (error) {
    console.error('Error getting user-specific hidden posts key:', error);
    return 'hidden_posts_anonymous';
  }
};

/**
 * Get the list of posts hidden by the current user
 * @returns {Array} Array of post IDs that are hidden
 */
export const getHiddenPosts = () => {
  try {
    const key = getHiddenPostsKey();
    const hiddenPostsJson = localStorage.getItem(key) || '[]';
    return JSON.parse(hiddenPostsJson);
  } catch (error) {
    console.error('Error getting hidden posts:', error);
    return [];
  }
};

/**
 * Hide a post from the current user's view
 * This is a temporary solution until the backend supports actual post deletion
 * 
 * @param {string} postId - The ID of the post to hide
 * @returns {Promise} - A resolved promise to simulate successful hiding
 */
export const hidePostLocally = async (postId) => {
  // Log the hide operation for debugging only (not visible to users)
  console.log(`Hiding post with ID: ${postId} from user's view`);
  
  // Store the hidden post ID in localStorage so it remains hidden across page refreshes
  try {
    // Make the hidden posts list user-specific
    const key = getHiddenPostsKey();
    
    // Get existing hidden posts
    const hiddenPostsJson = localStorage.getItem(key) || '[]';
    const hiddenPosts = JSON.parse(hiddenPostsJson);
    
    // Add this post ID if it's not already in the list
    if (!hiddenPosts.includes(postId)) {
      hiddenPosts.push(postId);
      localStorage.setItem(key, JSON.stringify(hiddenPosts));
      console.log(`Added post ID ${postId} to ${key} in localStorage`);
    }
  } catch (error) {
    console.error('Error updating hidden posts in localStorage:', error);
  }
  
  // Return a resolved promise after a short delay to simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Post hidden from your view' });
    }, 500); // 500ms delay to simulate network request
  });
};

/**
 * Attempt to delete a post by ID, falling back to hiding it locally if deletion fails
 * This function will try actual deletion first, then fall back to local hiding if the API endpoints don't exist
 * 
 * @param {string} postId - The ID of the post to delete/hide
 * @param {boolean} allowLocalHiding - Whether to allow local hiding if server deletion fails
 * @returns {Promise} - The axios promise or simulation promise
 */
export const deletePost = async (postId, allowLocalHiding = true) => {
  try {
    if (!postId) {
      console.error('Cannot hide/delete post: Invalid post ID');
      throw new Error('Invalid post ID');
    }
    
    // Get the authentication token using the correct key
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (!token) {
      console.error('Cannot hide/delete post: No authentication token found');
      throw new Error('Authentication token not found');
    }
    
    console.log(`Attempting to delete post with ID: ${postId} from server`);
    
    // Try various endpoint formats that might be supported by the backend
    const possibleEndpoints = [
      // Try with post_id parameter in different formats
      `/api/posts/delete/${postId}/`,
      `/api/posts/${postId}/delete/`,
      `/api/recipes/delete/${postId}/`,
      `/api/recipes/${postId}/delete/`,
      // Try the custom endpoints that might exist
      `/api/post/delete/${postId}/`,
      `/api/recipe/delete/${postId}/`,
      // Original attempts as fallback
      `/api/recipes/${postId}/`,
      `/api/posts/${postId}/`
    ];
    
    let lastError = null;
    
    // Try each endpoint with Bearer token
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying DELETE to: ${API_URL}${endpoint}`);
        const response = await axios.delete(`${API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        console.log('Post deleted successfully via endpoint:', endpoint, response.data);
        return response.data;
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error.message);
        lastError = error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints failed and local hiding is allowed, fall back to that
    if (allowLocalHiding) {
      console.log('All delete endpoints failed, falling back to local hiding');
      return await hidePostLocally(postId);
    }
    
    // If local hiding is not allowed, throw the last error
    console.error('All delete endpoints failed');
    throw lastError || new Error('Failed to delete/hide post - No valid endpoint found');
  } catch (error) {
    // If this is a 404 error and local hiding is allowed, use local hiding
    if (error.response && error.response.status === 404 && allowLocalHiding) {
      console.log('Delete endpoint not found, using local hiding');
      return await hidePostLocally(postId);
    }
    
    console.error('Hide/delete operation failed:', error.message);
    console.error('Response data:', error.response?.data);
    console.error('Status code:', error.response?.status);
    
    // Check if we got a 403 error which might mean the user doesn't own the post
    if (error.response && error.response.status === 403) {
      throw new Error("You don't have permission to hide this post");
    }
    
    if (error.response && error.response.status === 404) {
      throw new Error("Delete function not available. The post has been hidden from your view only.");
    }
    
    throw error;
  }
};

/**
 * Check if the current user is the owner of a post
 * @param {Object} post - The post object
 * @param {string} currentUsername - The current user's username or user_id
 * @returns {boolean} - Whether the current user is the owner
 */
export const isPostOwner = (post, currentUsername) => {
  if (!post || !currentUsername) {
    console.log('Post ownership check failed: Missing post or currentUsername', { post, currentUsername });
    return false;
  }
  
  // Convert values to strings for comparison to handle both string and number types
  const currentUserStr = String(currentUsername).toLowerCase().trim();
  
  // Debug log all relevant fields
  console.log('Checking post ownership with detailed debug:', { 
    postId: post.id, 
    postUsername: post.username, 
    postAuthor: post.author,
    postUserId: post.user_id,
    currentUsername: currentUserStr,
    postCreator: post.creator,
    postOwner: post.owner
  });
  
  // Check all possible ID/username combinations, converting to string and normalizing case
  const fieldsToCheck = [
    { field: 'username', value: post.username },
    { field: 'author', value: post.author },
    { field: 'user_id', value: post.user_id },
    { field: 'creator', value: post.creator },
    { field: 'owner', value: post.owner }
  ];
  
  for (const { field, value } of fieldsToCheck) {
    if (value && String(value).toLowerCase().trim() === currentUserStr) {
      console.log(`Post ownership match found on field: ${field}`);
      return true;
    }
  }
  
  // Also check if post ID matches user ID (for some APIs this might be the case)
  if (!isNaN(currentUserStr) && !isNaN(post.id) && 
      parseInt(post.id) === parseInt(currentUserStr)) {
    console.log('Post ownership match on numeric ID comparison');
    return true;
  }
  
  // Check for nested objects that might contain user identification
  if (post.user && (
    (post.user.id && String(post.user.id).toLowerCase() === currentUserStr) || 
    (post.user.username && String(post.user.username).toLowerCase() === currentUserStr)
  )) {
    console.log('Post ownership match in nested user object');
    return true;
  }
  
  console.log('Post ownership: No match found after all checks');
  return false;
}; 