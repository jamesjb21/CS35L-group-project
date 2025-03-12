import React, { useState } from 'react';
import { Box, Image, Text, Flex, IconButton, Avatar, Input, Button, VStack, UnorderedList, ListItem, Heading, Divider } from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
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
  
  const handleLike = async () => {
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

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb={4} bg="white">
      {/* Post Header */}
      <Flex p={4} align="center">
        <Avatar size="sm" mr={2} />
        <Text fontWeight="bold">{post.username}</Text>
      </Flex>
      
      {/* Post Image */}
      <Image src={post.image} alt="Recipe" objectFit="cover" width="100%" />
      
      {/* Post Actions */}
      <Flex p={4} align="center">
        <IconButton
          aria-label="Like"
          icon={post.liked_by_user ? <FaHeart color="red" /> : <FaRegHeart />}
          variant="ghost"
          onClick={handleLike}
          mr={2}
        />
        <IconButton
          aria-label="Comment"
          icon={<FaComment />}
          variant="ghost"
          onClick={() => setShowComments(!showComments)}
        />
      </Flex>
      
      {/* Likes Count */}
      <Box px={4} pb={2}>
        <Text fontWeight="bold">{post.likes_count} likes</Text>
      </Box>
      
      {/* Recipe Content */}
      <Box px={4} pb={4}>
        {isStructuredRecipe ? (
          <VStack align="stretch" spacing={3}>
            <Heading size="md">{recipeData.title || "Untitled Recipe"}</Heading>
            
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
              onClick={() => setShowFullRecipe(!showFullRecipe)}
            >
              {showFullRecipe ? "Hide Recipe Details" : "View Recipe Details"}
            </Button>
            
            {showFullRecipe && (
              <>
                <Box>
                  <Heading size="sm" mb={2}>Ingredients:</Heading>
                  <UnorderedList spacing={1}>
                    {recipeData.ingredients.map((ingredient, index) => (
                      <ListItem key={index}>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={2}>Instructions:</Heading>
                  <Text whiteSpace="pre-line">{recipeData.instructions}</Text>
                </Box>
              </>
            )}
          </VStack>
        ) : (
          <Text>
            <Text as="span" fontWeight="bold" mr={2}>
              {post.username}
            </Text>
            {post.caption}
          </Text>
        )}
      </Box>
      
      {/* Comments */}
      {showComments && (
        <Box px={4} pb={2}>
          <Text color="gray.500" mb={2}>
            View all {post.comments_count} comments
          </Text>
          {post.comments.map((comment) => (
            <Text key={comment.id} mb={1}>
              <Text as="span" fontWeight="bold" mr={2}>
                {comment.username}
              </Text>
              {comment.text}
            </Text>
          ))}
        </Box>
      )}
      
      {/* Add Comment */}
      <Flex as="form" onSubmit={handleComment} p={4} borderTop="1px" borderColor="gray.200">
        <Input
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          variant="unstyled"
          mr={2}
        />
        <Button type="submit" size="sm" colorScheme="blue" isDisabled={!comment.trim()}>
          Post
        </Button>
      </Flex>
    </Box>
  );
};

export default Post; 