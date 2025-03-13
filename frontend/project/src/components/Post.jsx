import React, { useState } from 'react';
import { Box, Image, Text, Flex, IconButton, Avatar, Input, Button, VStack, UnorderedList, ListItem, Heading, Divider, HStack } from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../constants';

const Post = ({ post, refreshPosts }) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showFullRecipe, setShowFullRecipe] = useState(false);
  
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
    try {
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
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/posts/${post.id}/comment/`,
        { text: comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComment('');
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    setShowComments(!showComments);
  };

  return (
    <Box as="div" borderWidth="1px" borderRadius="xl" overflow="hidden" mb={4} bg="white" boxShadow="md">
      {/* Post Header */}
      <Flex p={4} align="center" borderBottom="1px" borderColor="gray.100">
        <Link to={`/profile/${post.username}`}>
          <Avatar size="sm" mr={3} name={post.username} />
        </Link>
        <Link to={`/profile/${post.username}`}>
          <Text fontWeight="bold" fontSize="md" _hover={{ color: 'green.500' }}>{post.username}</Text>
        </Link>
      </Flex>
      
      {/* Post Image */}
      <Box position="relative" paddingBottom="56.25%" maxHeight="600px">
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
        <HStack spacing={4} mb={3}>
          <IconButton
            aria-label="Like"
            icon={post.liked_by_user ? <FaHeart color="red" /> : <FaRegHeart />}
            variant="ghost"
            onClick={handleLike}
            size="lg"
            colorScheme="red"
            _hover={{ bg: 'red.50' }}
            type="button"
            form="no-form"
            as="button"
          />
          <IconButton
            aria-label="Comment"
            icon={<FaComment />}
            variant="ghost"
            onClick={handleCommentClick}
            size="lg"
            colorScheme="blue"
            _hover={{ bg: 'blue.50' }}
            type="button"
            form="no-form"
            as="button"
          />
        </HStack>
        
        {/* Likes Count */}
        <Text fontWeight="bold" mb={3}>{post.likes_count} likes</Text>
        
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
      
      {/* Comments Section */}
      {showComments && (
        <Box px={4} pb={2} bg="gray.50">
          <Text color="gray.500" mb={2} fontWeight="medium">
            View {post.comments_count} comments
          </Text>
          {post.comments.map((comment) => (
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