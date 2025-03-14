import React, { useState, useEffect } from 'react';
import { Box, Image, Text, Flex, IconButton, Avatar, Input, Button, VStack, UnorderedList, ListItem, Heading, Divider, HStack } from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';
import DeletePostButton from './DeletePostButton';
import { isPostOwner } from '../utils/postUtils';

const Post = ({ post, refreshPosts, onDelete }) => {
  const [comment, setComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [showFullRecipe, setShowFullRecipe] = useState(false);
  const [isLiked, setIsLiked] = useState(post.liked_by_user);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [currentUsername, setCurrentUsername] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  // Number of preview comments to show
  const PREVIEW_COMMENTS_COUNT = 3;
  
  // Get current user info from token in a more robust way
  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
          const decoded = jwtDecode(token);
          console.log('Token decoded:', decoded);
          
          // Get username/user_id from token, trying different possible fields
          let userId = null;
          
          // Try all possible fields where user info might be stored
          if (decoded.username) {
            userId = decoded.username;
          } else if (decoded.user_id) {
            userId = decoded.user_id;
          } else if (decoded.sub) {
            userId = decoded.sub;
          } else if (decoded.id) {
            userId = decoded.id;
          }
          
          console.log('Current user ID extracted from token:', userId);
          setCurrentUsername(userId);
        } else {
          console.log('No access token found');
          setCurrentUsername(null);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        setCurrentUsername(null);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Update the ownership check effect
  useEffect(() => {
    // Check if the current user is the post owner whenever currentUsername changes
    if (currentUsername && post) {
      // Use the utility function for checking ownership
      const userIsPostOwner = isPostOwner(post, currentUsername);
      console.log(`Post ownership result: ${userIsPostOwner ? 'Yes' : 'No'}`, { 
        postId: post.id,
        currentUsername 
      });
      setIsOwner(userIsPostOwner);
    } else {
      setIsOwner(false);
    }
  }, [currentUsername, post]);
  
  // Get the comments to display based on whether showing all or just preview
  const commentsToDisplay = showAllComments ? comments : comments.slice(-PREVIEW_COMMENTS_COUNT);
  
  // Parse recipe data from caption if it's JSON formatted
  const parseRecipeData = () => {
    try {
      return JSON.parse(post.caption);
    } catch (e) {
      // If parsing fails, treat the caption as plain text
      return {
        title: '',
        ingredients: [],
        instructions: post.caption
      };
    }
  };
  
  const recipeData = parseRecipeData();
  const isStructuredRecipe = recipeData.ingredients && recipeData.ingredients.length > 0;
  
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update UI immediately for a responsive feel
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prevCount => newIsLiked ? prevCount + 1 : prevCount - 1);
    
    try {
      console.log('Attempting to like post with ID:', post.id);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/posts/${post.id}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Successfully liked/unliked post');
      // We don't need to call refreshPosts() here as we've already updated the UI
    } catch (error) {
      console.error('Error liking post:', error.response ? error.response.data : error.message);
      console.error('Full error:', error);
      // Revert UI changes if the API call fails
      setIsLiked(!newIsLiked);
      setLikesCount(prevCount => !newIsLiked ? prevCount + 1 : prevCount - 1);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // Use the currentUsername state or fallback to stored username
    const username = currentUsername || localStorage.getItem('username') || 'user';
    
    const newComment = {
      id: Date.now(), // Temporary ID until server response
      username: username,
      text: comment,
      created_at: new Date().toISOString()
    };
    
    // Update UI immediately for a responsive feel
    setComments(prevComments => [...prevComments, newComment]);
    setCommentsCount(prevCount => prevCount + 1);
    
    // Clear input right away
    setComment('');
    
    try {
      console.log('Attempting to comment on post with ID:', post.id);
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/posts/${post.id}/comment/`,
        { text: newComment.text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Successfully commented on post, response:', response.data);
      
      // If you need to update with the server response (e.g., to get the real ID)
      if (response.data && response.data.id) {
        setComments(prevComments => 
          prevComments.map(c => 
            c.id === newComment.id ? {...c, id: response.data.id} : c
          )
        );
      }
      
    } catch (error) {
      console.error('Error commenting on post:', error.response ? error.response.data : error.message);
      console.error('Full error:', error);
      // Remove the optimistically added comment if there's an error
      setComments(prevComments => prevComments.filter(c => c.id !== newComment.id));
      setCommentsCount(prevCount => prevCount - 1);
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    setShowAllComments(!showAllComments);
  };

  return (
    <Box as="div" borderWidth="1px" borderRadius="xl" overflow="hidden" mb={4} bg="white" boxShadow="md">
      {/* Post Header */}
      <Flex p={4} align="center" justify="space-between" borderBottom="1px" borderColor="gray.100" width="100%">
        <Flex align="center">
          <Link to={`/profile/${post.username}`} onClick={(e) => e.stopPropagation()}>
            <Avatar size="sm" mr={3} name={post.username} />
          </Link>
          <Link to={`/profile/${post.username}`} onClick={(e) => e.stopPropagation()}>
            <Text fontWeight="bold" fontSize="md" _hover={{ color: 'green.500' }}>{post.username}</Text>
          </Link>
        </Flex>
      </Flex>
      
      {/* Post Image */}
      <Box position="relative" paddingBottom="56.25%" maxHeight="600px" onClick={(e) => e.stopPropagation()}>
        <Image 
          src={post.image} 
          alt="Recipe" 
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          objectFit="contain"
          bg="gray.50"
        />
      </Box>
      
      {/* Post Actions and Content */}
      <Box p={4}>
        {/* Action Buttons */}
        <HStack spacing={4} mb={3} justify="space-between" width="100%">
          <HStack spacing={4}>
            <IconButton
              aria-label="Like"
              icon={isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
              variant="ghost"
              onClick={handleLike}
              size="xl" 
              fontSize="24px"
              colorScheme="red"
              _hover={{ bg: 'red.50' }}
              type="button"
              form="no-form"
              as="button"
              h="50px"
              w="50px"
            />
            <Flex align="center">
              <IconButton
                aria-label="Comment"
                icon={<FaComment />}
                variant="ghost"
                onClick={handleCommentClick}
                size="xl"
                fontSize="22px"
                colorScheme="blue"
                _hover={{ bg: 'blue.50' }}
                type="button"
                form="no-form"
                as="button"
                h="50px"
                w="50px"
              />
              {/* Show comment count even when zero */}
              <Text 
                color="gray.500" 
                fontWeight="medium" 
                ml={1} 
                fontSize="md"
                cursor="pointer"
                onClick={handleCommentClick}
                _hover={{ color: "blue.500" }}
              >
                {commentsCount}
              </Text>
            </Flex>
          </HStack>
          
          {/* Delete button aligned with action buttons */}
          {isOwner && currentUsername && (
            <Box>
              <DeletePostButton 
                postId={post.id} 
                isOwner={isOwner} 
                onDelete={onDelete || refreshPosts} 
              />
            </Box>
          )}
        </HStack>
        
        {/* Likes Count */}
        <Text fontWeight="bold" mb={3}>{likesCount} likes</Text>
        
        {/* Recipe Content */}
        {isStructuredRecipe ? (
          <VStack align="stretch" spacing={3}>
            <Heading size="md" color="#2D3748" fontWeight="bold" fontSize="2xl">{recipeData.title || "Untitled Recipe"}</Heading>
            
            <Button 
              size="md" 
              colorScheme="green" 
              variant="outline"
              onClick={() => setShowFullRecipe(!showFullRecipe)}
              borderRadius="xl"
              width="full"
              py={2}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
                bg: "green.50",
                borderColor: "green.400",
                color: "green.600"
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "md"
              }}
              transition="all 0.2s"
              borderWidth="2px"
              fontWeight="semibold"
              letterSpacing="wide"
              textTransform="uppercase"
              fontSize="sm"
              type="button"
              form="no-form"
              as="button"
            >
              {showFullRecipe ? (
                <HStack spacing={2}>
                  <Text>Hide Recipe Details</Text>
                  <Text as="span" fontSize="xs">▼</Text>
                </HStack>
              ) : (
                <HStack spacing={2}>
                  <Text>View Recipe Details</Text>
                  <Text as="span" fontSize="xs">▶</Text>
                </HStack>
              )}
            </Button>
            
            {showFullRecipe && (
              <>
                <Box>
                  <Heading size="sm" mb={2} color="#2D3748">Ingredients:</Heading>
                  <UnorderedList spacing={1}>
                    {recipeData.ingredients.map((ingredient, index) => (
                      <ListItem key={index} color="#4A5568">
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={2} color="#2D3748">Instructions:</Heading>
                  <Text whiteSpace="pre-line" color="#4A5568">{recipeData.instructions}</Text>
                </Box>
              </>
            )}
          </VStack>
        ) : (
          <Text color="#4A5568">
            <Link to={`/profile/${post.username}`}>
              <Text as="span" fontWeight="bold" mr={2} _hover={{ color: 'green.500' }}>
                {post.username}
              </Text>
            </Link>
            {post.caption}
          </Text>
        )}
      </Box>
      
      {/* Comments Section - Only show if there are comments OR user has expanded comments */}
      {(commentsCount > 0 || showAllComments) && (
        <Box px={4} py={2} bg="gray.50">
          {/* Only show "View all comments" if there are more than the preview amount */}
          {commentsCount > PREVIEW_COMMENTS_COUNT && !showAllComments && (
            <Text 
              color="gray.500" 
              mb={2} 
              fontWeight="medium" 
              cursor="pointer" 
              onClick={handleCommentClick}
              _hover={{ color: "blue.500" }}
            >
              View all {commentsCount} comments
            </Text>
          )}
          
          {/* Only show when expanded AND we have more than preview amount */}
          {showAllComments && commentsCount > PREVIEW_COMMENTS_COUNT && (
            <Text 
              color="gray.500" 
              mb={2} 
              fontWeight="medium" 
              cursor="pointer" 
              onClick={handleCommentClick}
              _hover={{ color: "blue.500" }}
            >
              Show fewer comments
            </Text>
          )}

          {/* Status messages - only show when expanded */}
          {showAllComments && (
            <>
              {commentsCount === 0 && (
                <Text color="gray.500" mb={2} fontWeight="medium">No comments yet</Text>
              )}
              {commentsCount > 0 && commentsCount <= PREVIEW_COMMENTS_COUNT && (
                <Text color="gray.500" mb={2} fontWeight="medium">Showing all comments</Text>
              )}
            </>
          )}

          {/* Comment list - always display if we have comments */}
          {commentsCount > 0 && commentsToDisplay.map((comment) => (
            <Text key={comment.id} mb={1} color="#4A5568">
              <Link to={`/profile/${comment.username}`}>
                <Text as="span" fontWeight="bold" mr={2} _hover={{ color: 'green.500' }}>
                  {comment.username}
                </Text>
              </Link>
              {comment.text}
            </Text>
          ))}
        </Box>
      )}
      
      {/* Add Comment */}
      <Box as="form" onSubmit={handleComment} p={4} borderTop="1px" borderColor="gray.100">
        <Flex>
          <Input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="unstyled"
            mr={2}
            color="#4A5568"
          />
          <Button 
            type="submit" 
            size="sm" 
            colorScheme="green" 
            isDisabled={!comment.trim()}
            borderRadius="xl"
          >
            Post
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Post; 