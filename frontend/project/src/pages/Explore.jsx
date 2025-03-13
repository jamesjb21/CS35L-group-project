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
  Container
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
        <Spinner size="xl" color="#7ac142" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Container maxW="1200px" py={8} px={4}>
      <Box mb={8}>
        <Heading 
          fontSize={{ base: "1.8rem", md: "2.2rem" }}
          fontWeight="900"
          bgGradient="linear(to-r, #7ac142, #68a939)"
          bgClip="text"
          letterSpacing="tight"
          lineHeight="1.2"
        >
          Discover New Recipes!
        </Heading>
      </Box>
      
      {posts.length > 0 ? (
        <Grid 
          templateColumns={{ 
            base: 'repeat(1, 1fr)', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }} 
          gap={6}
        >
          {posts.map((post) => (
            <GridItem 
              key={post.id} 
              onClick={() => openPostModal(post)} 
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                transform: 'translateY(-4px)',
                shadow: 'lg',
              }}
            >
              <Box 
                position="relative" 
                paddingBottom="100%" 
                overflow="hidden"
                borderRadius="xl"
                boxShadow="base"
                bg="white"
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
                  transition="all 0.3s"
                  _hover={{
                    transform: 'scale(1.05)',
                  }}
                />
              </Box>
              {post.caption && (
                <Box 
                  mt={2} 
                  px={2}
                  py={1}
                >
                  <Text 
                    fontSize="md" 
                    fontWeight="medium"
                    noOfLines={2}
                    color="gray.700"
                  >
                    {(() => {
                      try {
                        const recipeData = JSON.parse(post.caption);
                        return recipeData.title || 'Untitled Recipe';
                      } catch (e) {
                        return post.caption;
                      }
                    })()}
                  </Text>
                </Box>
              )}
            </GridItem>
          ))}
        </Grid>
      ) : (
        <Flex 
          justify="center" 
          align="center" 
          height="50vh"
          direction="column"
          bg="gray.50"
          borderRadius="xl"
          p={8}
        >
          <Text 
            fontSize="xl"
            color="gray.600"
            fontWeight="medium"
            textAlign="center"
          >
            No recipes available yet.
            <br />
            Be the first to share your delicious recipe!
          </Text>
        </Flex>
      )}
      
      {/* Recipe Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        isCentered
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay 
          bg="blackAlpha.700"
          backdropFilter="blur(8px)"
        />
        <ModalContent 
          maxW="600px"
          w="95%"
          maxH="90vh"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="2xl"
          bg="white"
          mx="auto"
        >
          <ModalCloseButton 
            position="absolute"
            top={3}
            right={3}
            zIndex={2}
            color="white"
            bg="blackAlpha.600"
            borderRadius="full"
            size="md"
            _hover={{
              bg: "blackAlpha.800",
              transform: "scale(1.1)"
            }}
            transition="all 0.2s"
          />
          <ModalBody p={0} overflow="auto">
            {selectedPost && (
              <Post post={selectedPost} refreshPosts={fetchExplorePosts} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Explore; 