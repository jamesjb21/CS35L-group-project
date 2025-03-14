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
  useDisclosure,
  VStack,
  useColorModeValue,
  Container,
  Icon
} from '@chakra-ui/react';
import axios from 'axios';
import { API_URL } from '../constants';
import Post from '../components/Post';
import { GiCook } from 'react-icons/gi';
import { deletePost, getHiddenPosts } from '../utils/postUtils';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const parseRecipeData = (caption) => {
    try {
      return JSON.parse(caption);
    } catch (e) {
      return {
        title: caption,
        ingredients: [],
        instructions: ''
      };
    }
  };

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

  const fetchExplorePosts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/explore/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter out any posts that were previously "deleted" by the user
      const filteredPosts = filterHiddenPosts(response.data);
      setPosts(filteredPosts);
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

  const handleHidePost = (postId) => {
    console.log(`Hiding post ID ${postId} from Explore page UI`);
    
    // Remove the post from the local state to update the UI
    setPosts(prevPosts => {
      const newPosts = prevPosts.filter(post => post.id !== postId);
      console.log(`Explore: Hidden post. Posts count before: ${prevPosts.length}, after: ${newPosts.length}`);
      return newPosts;
    });
    
    // Close the modal after removing the post
    onClose();
  };

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" color="#7ac142" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Container maxW="900px" py={8} px={4}>
      <Box mb={8}>
        <Heading 
          as="h1"
          fontSize="32px"
          bgGradient="linear(to-r, #7ac142, #68a939)"
          bgClip="text"
          letterSpacing="tight"
          fontWeight="900"
          mb={4}
        >
          Discover new recipes!
        </Heading>
      </Box>
      
      {posts.length > 0 ? (
        <Grid 
          templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} 
          gap={6}
        >
          {posts.map((post) => {
            const recipeData = parseRecipeData(post.caption);
            return (
              <GridItem key={post.id} onClick={() => openPostModal(post)} cursor="pointer">
                <Box 
                  position="relative" 
                  paddingBottom="100%" 
                  overflow="hidden"
                  borderRadius="xl"
                  boxShadow="md"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  <Image 
                    src={post.image} 
                    alt={recipeData.title} 
                    position="absolute"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg="rgba(0,0,0,0.7)"
                    p={3}
                    color="white"
                  >
                    <Text fontWeight="bold" noOfLines={1}>
                      {recipeData.title || 'Tasty Recipe'}
                    </Text>
                    {recipeData.ingredients && recipeData.ingredients.length > 0 && (
                      <Text fontSize="sm" noOfLines={1}>
                        {recipeData.ingredients.length} Ingredients
                      </Text>
                    )}
                  </Box>
                </Box>
              </GridItem>
            );
          })}
        </Grid>
      ) : (
        <Box textAlign="center" py={10}>
          <Icon as={GiCook} boxSize={12} color="#7ac142" mb={4} />
          <Text 
            fontSize="2xl" 
            fontWeight="900" 
            color="#2D3748"
            mb={4}
          >
            No Recipes Available
          </Text>
        </Box>
      )}
      
      {/* Recipe Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="2xl" 
        isCentered
        blockScrollOnMount={false}
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.700" 
          backdropFilter="blur(5px)"
        />
        <ModalContent 
          bg="white"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="2xl"
          maxW="800px"
          mx={{ base: "4", md: "auto" }}
          my="auto"
          position="relative"
          top={{ base: "10%", md: "0" }}
          transform="translate(0, 0)"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalCloseButton 
            size="lg"
            color="gray.500"
            _hover={{ color: 'gray.700' }}
            position="absolute"
            right={4}
            top={4}
            zIndex={100}
          />
          <ModalBody p={0} position="relative">
            {selectedPost && (
              <Post 
                post={selectedPost} 
                refreshPosts={fetchExplorePosts}
                onDelete={(postId) => {
                  handleHidePost(postId);
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Explore; 