import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Image, 
  Heading, 
  Spinner, 
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import axios from 'axios';
import { API_URL } from '../constants';
import Post from '../components/Post';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchExplorePosts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/explore/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching explore recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    onOpen();
  };

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" py={6} px={4}>
      <Heading size="lg" mb={6}>Explore Recipes</Heading>
      
      {posts.length > 0 ? (
        <Grid 
          templateColumns={{ 
            base: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          }} 
          gap={4}
        >
          {posts.map((post) => (
            <GridItem key={post.id} onClick={() => openPostModal(post)} cursor="pointer">
              <Box 
                position="relative" 
                paddingBottom="100%" 
                overflow="hidden"
                borderRadius="md"
              >
                <Image 
                  src={post.image} 
                  alt="Recipe" 
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
              </Box>
            </GridItem>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg">No recipes available</Text>
        </Box>
      )}
      
      {/* Recipe Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedPost && (
              <Post post={selectedPost} refreshPosts={fetchExplorePosts} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Explore; 