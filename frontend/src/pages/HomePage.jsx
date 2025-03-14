import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Button, Flex, Spinner, Text, Icon } from '@chakra-ui/react';
import axios from 'axios';
import { API_URL } from '../constants';
import Post from '../components/Post';
import { Link } from 'react-router-dom';
import { GiCook } from "react-icons/gi";
import { IoAddCircle } from "react-icons/io5";
import { getHiddenPosts } from '../utils/postUtils';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update the filterHiddenPosts function to use getHiddenPosts
  const filterHiddenPosts = (postsArray) => {
    try {
      // Get hidden posts using the utility function
      const hiddenPosts = getHiddenPosts();
      
      if (hiddenPosts.length === 0) {
        return postsArray; // No filtering needed
      }
      
      // Filter out hidden posts
      return postsArray.filter(post => !hiddenPosts.includes(post.id));
    } catch (error) {
      console.error('Error filtering hidden posts:', error);
      return postsArray; // Return original array if there's an error
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/feed/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter out any posts that were previously "deleted" by the user
      const filteredPosts = filterHiddenPosts(response.data);
      setPosts(filteredPosts);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleHidePost = (postId) => {
    console.log(`Hiding post ID ${postId} from UI`);
    setPosts(posts.filter(post => post.id !== postId));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Box maxW="800px" mx="auto" py={8} px={4}>
      <Flex 
        justify="space-between" 
        align="center" 
        mb={8}
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="md"
      >
        <Flex align="center" gap={4}>
          <Icon as={GiCook} boxSize={10} color="#7ac142" />
          <Heading 
            size="xl" 
            bgGradient="linear(to-r, #7ac142, #68a939)" 
            bgClip="text"
            letterSpacing="tight"
            fontWeight="900"
            fontSize="3xl"
          >
            Your TasteBuds Feed
          </Heading>
        </Flex>
        <Button
          as={Link}
          to="/create"
          colorScheme="green"
          size="lg"
          leftIcon={<IoAddCircle size="24px" />}
          borderRadius="xl"
          fontWeight="bold"
          px={6}
          py={4}
          boxShadow="md"
          width="auto"
          minW="fit-content"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            bg: 'green.500'
          }}
          _active={{
            transform: 'translateY(0)',
            boxShadow: 'sm'
          }}
          transition="all 0.2s"
          bg="#7ac142"
          color="white"
        >
          Add Recipe
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" my={10}>
          <Spinner size="xl" color="#7ac142" thickness="4px" />
        </Flex>
      ) : error ? (
        <Text color="red.500" textAlign="center" fontSize="xl" fontWeight="bold" letterSpacing="wide">{error}</Text>
      ) : posts.length === 0 ? (
        <Box 
          textAlign="center" 
          my={10} 
          p={10} 
          bg="white" 
          borderRadius="2xl" 
          boxShadow="md"
        >
          <Icon as={GiCook} boxSize={16} color="#7ac142" mb={6} />
          <Text 
            fontSize="3xl" 
            fontWeight="900" 
            mb={4} 
            color="#2D3748"
            letterSpacing="wide"
          >
            No recipes in your feed yet
          </Text>
          <Text 
            fontSize="xl" 
            color="#4A5568" 
            mb={8}
            fontWeight="600"
            letterSpacing="wide"
          >
            Follow users or create your first recipe to get started!
          </Text>
          <Button
            as={Link}
            to="/explore"
            colorScheme="green"
            size="lg"
            fontSize="lg"
            fontWeight="bold"
            borderRadius="xl"
            px={8}
            py={6}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            Explore Recipes
          </Button>
        </Box>
      ) : (
        <VStack spacing={6} align="stretch">
          {posts.map((post) => (
            <Post 
              key={post.id} 
              post={post} 
              refreshPosts={fetchPosts}
              onDelete={handleHidePost}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default HomePage;