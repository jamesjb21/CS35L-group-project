import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Avatar, 
  Button, 
  Grid, 
  GridItem,
  Image,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Badge,
  Icon,
  HStack,
  VStack,
  Code
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, ACCESS_TOKEN } from '../constants';
import Post from '../components/Post';
import { jwtDecode } from 'jwt-decode';
import { GiCook } from 'react-icons/gi';

/**
 * Profile Component
 * 
 * Displays a user's profile page with their information and posts.
 * Features:
 * - Shows user details (username, avatar, etc.)
 * - Displays the user's recipe posts in a grid
 * - Allows viewing individual posts in a modal
 * - Handles different states: loading, error, and data display
 * - Shows different UI for own profile vs. other users' profiles
 */
const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Determine if the current logged-in user is viewing their own profile
  // This is used to conditionally render edit buttons and other user-specific features
  let currentUsername = null;
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      const decodedToken = jwtDecode(token);
      currentUsername = decodedToken.username;
      console.log("Token decoded, username:", currentUsername);
    } else {
      console.log("No access token found in localStorage");
    }
  } catch (e) {
    console.error("Error decoding token:", e);
    // Don't set error here, just log it
  }
  
  // If no username in URL params, use the current user's username
  const profileUsername = username || currentUsername;
  const isOwnProfile = currentUsername === profileUsername;

  console.log("Profile component rendering with:", { 
    profileUsername, 
    currentUsername, 
    isOwnProfile,
    paramUsername: username
  });

  const fetchProfile = async () => {
    try {
      console.log("Fetching profile for:", profileUsername);
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        throw new Error("No auth token available");
      }
      
      const response = await axios.get(`${API_URL}/api/user_data/${profileUsername}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Profile data received:", response.data);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Don't invalidate on 401/403 errors - allows the user to see they need to log in
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setError("You need to log in to view this profile. Please go to the login page.");
      } else {
        setError("Failed to load profile: " + (error.response?.data?.error || error.message));
      }
      
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts for:", profileUsername);
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        throw new Error("No auth token available");
      }
      
      const response = await axios.get(`${API_URL}/api/user/${profileUsername}/posts/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Posts received:", response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Don't set error message for posts - we already show error for profile
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      await axios.post(
        `${API_URL}/api/user/${profileUsername}/follow/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow/unfollow user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    onOpen();
  };

  useEffect(() => {
    // Reset state on new profile load
    setLoading(true);
    setError(null);
    
    // Check for profileUsername
    if (!profileUsername) {
      setError("No username provided. Please go to a specific profile or log in.");
      setLoading(false);
      return;
    }
    
    // Attempt to load profile data even if token might be invalid
    // This lets the user see the error without being redirected
    fetchProfile();
    fetchPosts();
  }, [profileUsername]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" justify="center" align="center" height="80vh">
        <Heading size="md" mb={4} color="red.500">Error Loading Profile</Heading>
        <Text align="center" maxW="500px" mb={6}>{error}</Text>
        <HStack spacing={4}>
          <Button onClick={() => navigate('/home')} colorScheme="blue">
            Go to Home
          </Button>
          <Button onClick={() => navigate('/login')} colorScheme="purple">
            Log In
          </Button>
        </HStack>
      </Flex>
    );
  }

  // Debug section - remove in production
  if (!profile) {
    return (
      <Box maxW="900px" mx="auto" py={6} px={4}>
        <Heading size="md" mb={4} color="orange.500">Profile Data Debug</Heading>
        <Text>Profile Username: {profileUsername}</Text>
        <Text>Current Username: {currentUsername}</Text>
        <Text>Is Own Profile: {isOwnProfile ? "Yes" : "No"}</Text>
        <Text>URL Parameter Username: {username || "None (viewing own profile)"}</Text>
        <Text>Access Token: {localStorage.getItem(ACCESS_TOKEN) ? "Present" : "Missing"}</Text>
        <Divider my={4} />
        <Text fontWeight="bold">Profile data is null. This might indicate an API error.</Text>
        <HStack spacing={4} mt={4}>
          <Button onClick={() => {
            setLoading(true);
            fetchProfile();
            fetchPosts();
          }} colorScheme="blue">
            Retry Loading
          </Button>
          <Button onClick={() => {
            navigate('/home');
          }} colorScheme="gray">
            Go to Home
          </Button>
          <Button onClick={() => {
            navigate('/login');
          }} colorScheme="purple">
            Go to Login
          </Button>
        </HStack>
      </Box>
    );
  }

  return (
    <Box maxW="900px" mx="auto" py={6} px={4}>
      {profile && (
        <>
          {/* Profile Header */}
          <Flex mb={8} direction={{ base: 'column', md: 'row' }} align="center">
            <Avatar 
              size="2xl" 
              src={profile.profile_image} 
              mr={{ base: 0, md: 8 }} 
              mb={{ base: 4, md: 0 }}
              icon={<Icon as={GiCook} color="white" boxSize="2.5rem" />}
              bg="#6246ea"
            />
            
            <Box flex="1">
              <Flex align="center" mb={4}>
                <Heading size="lg" mr={4}>{profile.username}</Heading>
                {!isOwnProfile && (
                  <Button 
                    colorScheme="blue" 
                    variant="outline"
                    onClick={handleFollow}
                  >
                    {profile.is_following ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
                {isOwnProfile && (
                  <Button 
                    colorScheme="purple" 
                    variant="outline" 
                    onClick={() => navigate('/edit-profile')}
                    ml={2}
                  >
                    Edit Profile
                  </Button>
                )}
              </Flex>
              
              <Flex mb={4}>
                <Text mr={6}><strong>{posts.length}</strong> recipes</Text>
                <Text mr={6}><strong>{profile.follower_count || 0}</strong> followers</Text>
                <Text><strong>{profile.following_count || 0}</strong> following</Text>
              </Flex>
              
              <Text>{profile.bio || 'TasteBuds chef in the making! 👨‍🍳'}</Text>
            </Box>
          </Flex>
          
          <Divider mb={6} />
          
          {/* Recipe Tabs */}
          <Flex justifyContent="center" mb={6}>
            <HStack spacing={8}>
              <VStack>
                <Icon as={GiCook} boxSize="1.5rem" color="#6246ea" />
                <Text fontWeight="bold" color="#6246ea">Recipes</Text>
              </VStack>
            </HStack>
          </Flex>
          
          {/* Recipes Grid */}
          {posts && posts.length > 0 ? (
            <Grid 
              templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} 
              gap={4}
            >
              {posts.map((post) => (
                <GridItem key={post.id} onClick={() => openPostModal(post)} cursor="pointer">
                  <Box 
                    position="relative" 
                    paddingBottom="100%" 
                    overflow="hidden"
                    borderRadius="md"
                    boxShadow="md"
                  >
                    <Image 
                      src={post.image} 
                      alt={post.caption} 
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
                      p={2}
                      color="white"
                    >
                      <Text fontWeight="bold" noOfLines={1}>
                        {post.recipe_title || post.caption || 'Tasty Recipe'}
                      </Text>
                      {post.ingredients && post.ingredients.length > 0 && (
                        <Text fontSize="xs" noOfLines={1}>
                          {post.ingredients.length} ingredients
                        </Text>
                      )}
                    </Box>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={10}>
              <Icon as={GiCook} boxSize="4rem" color="gray.400" mb={4} />
              <Text fontSize="lg">No recipes yet</Text>
              {isOwnProfile && (
                <Button 
                  as="a" 
                  href="/create" 
                  colorScheme="purple" 
                  mt={4}
                  leftIcon={<Icon as={GiCook} />}
                >
                  Create Your First Recipe
                </Button>
              )}
            </Box>
          )}
          
          {/* Recipe Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody p={0}>
                {selectedPost && (
                  <Post post={selectedPost} refreshPosts={fetchPosts} />
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default Profile;