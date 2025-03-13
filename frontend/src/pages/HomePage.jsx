import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import axios from 'axios';
import { API_URL } from '../constants';
import Post from '../components/Post';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/feed/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Box maxW="600px" mx="auto" py={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">TasteBuds Feed</Heading>
        <Button as={Link} to="/create" colorScheme="blue">
          Add Recipe
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" my={10}>
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Text color="red.500" textAlign="center">{error}</Text>
      ) : posts.length === 0 ? (
        <Box textAlign="center" my={10}>
          <Text fontSize="lg" mb={4}>No recipes in your feed yet.</Text>
          <Text>Follow users or create your first recipe!</Text>
          <Button as={Link} to="/explore" colorScheme="blue" mt={4}>
            Explore Recipes
          </Button>
        </Box>
      ) : (
        <VStack spacing={6} align="stretch">
          {posts.map((post) => (
            <Post key={post.id} post={post} refreshPosts={fetchPosts} />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default HomePage;