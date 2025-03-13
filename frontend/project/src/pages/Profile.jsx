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
  Code,
  Input,
  Textarea,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
  ModalHeader,
  List,
  ListItem
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, ACCESS_TOKEN } from '../constants';
import Post from '../components/Post';
import { jwtDecode } from 'jwt-decode';
import { GiCook } from 'react-icons/gi';
import { FaEdit, FaUserFriends } from 'react-icons/fa';
import { IoSave } from 'react-icons/io5';

/**
 * Profile Component
 * 
 * Displays a user's profile page with the following features:
 * - User information (username, avatar, bio)
 * - Profile statistics (recipe count, followers, following)
 * - Grid of user's recipes/posts
 * - Follow/unfollow functionality for other users
 * - Bio editing for the user's own profile
 * - Modal to view followers
 * 
 * The component handles both viewing other users' profiles and the current user's own profile.
 * It differentiates between these cases to show appropriate actions (e.g., follow button or edit bio).
 */
const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  // State for followers modal functionality
  const [followers, setFollowers] = useState([]); // Stores the list of followers
  const [loadingFollowers, setLoadingFollowers] = useState(false); // Controls loading state in followers modal
  
  // Custom hook from Chakra UI for controlling the followers modal
  // isFollowersOpen: boolean state indicating if modal is open
  // onFollowersOpen: function to open the modal
  // onFollowersClose: function to close the modal
  const {
    isOpen: isFollowersOpen,
    onOpen: onFollowersOpen,
    onClose: onFollowersClose
  } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Get current user from token - but don't throw errors if token is invalid
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

  /**
   * Fetches the user profile data from the API
   * - Retrieves basic user information, follow status, and counts
   * - Handles authentication errors to show appropriate messages
   * - Updates profile state with the fetched data
   */
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

  /**
   * Fetches the user's posts/recipes from the API
   * - Retrieves all recipes created by the user
   * - Requires authentication token for access
   * - Updates posts state with the fetched data
   * - Sets loading state to false when complete
   */
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

  // Fetches the list of followers for the current profile
  // 1. Shows loading state immediately by opening modal
  // 2. Fetches followers data from API
  // 3. Updates followers state with result
  // 4. Handles errors with appropriate toast notifications
  const fetchFollowers = async () => {
    try {
      console.log("Followers clicked - opening modal and fetching data");
      setLoadingFollowers(true);
      setFollowers([]); // Reset followers state
      onFollowersOpen(); // Open modal immediately to show loading state
      
      console.log("Fetching followers for:", profileUsername);
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        throw new Error("No auth token available");
      }
      
      const response = await axios.get(`${API_URL}/api/user/${profileUsername}/followers/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Followers received:", response.data);
      setFollowers(response.data);
    } catch (error) {
      console.error('Error fetching followers:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to load followers: ' + (error.response?.data?.error || error.message),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingFollowers(false);
    }
  };

  /**
   * Handles following or unfollowing a user
   * - Prevents users from following themselves
   * - Sends API request to toggle follow status
   * - Refreshes profile data to update the UI
   * - Handles and displays any errors that occur
   */
  const handleFollow = async () => {
    try {
      // Prevent following yourself
      if (currentUsername === profileUsername) {
        setIsErrorModalOpen(true);
        return;
      }

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

  /**
   * Opens the modal to display a selected recipe/post in detail
   * @param {Object} post - The post object to display in the modal
   */
  const openPostModal = (post) => {
    // Parse recipe data when opening the modal
    try {
      const recipeData = JSON.parse(post.caption);
      setSelectedPost({ ...post, recipeData });
    } catch (e) {
      // If parsing fails, use caption as title
      setSelectedPost({ ...post, recipeData: { title: post.caption } });
    }
    onOpen();
  };

  /**
   * Updates the user's bio information
   * - Makes an API request to update the bio text
   * - Updates the local profile state with the new bio
   * - Exits editing mode when successful
   * - Displays success or error notifications
   */
  const handleUpdateBio = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      await axios.patch(
        `${API_URL}/api/user/${profileUsername}/update/`,
        { bio: editedBio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile({ ...profile, bio: editedBio });
      setIsEditingBio(false);
      toast({
        title: 'Success',
        description: 'Bio updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bio',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
        <Spinner size="xl" color="#7ac142" thickness="4px" />
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
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      {/* Error Modal */}
      <AlertDialog
        isOpen={isErrorModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsErrorModalOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cannot Follow Yourself
            </AlertDialogHeader>
            <AlertDialogBody>
              <Center flexDirection="column">
                <Icon as={GiCook} boxSize="2rem" color="#7ac142" mb={2} />
                <Text>You cannot follow your own profile!</Text>
              </Center>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsErrorModalOpen(false)} colorScheme="green">
                Got it
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {profile && (
        <>
          {/* Profile Header */}
          <Box 
            bg="white" 
            borderRadius="2xl" 
            boxShadow="md" 
            p={8} 
            mb={8}
          >
            <Flex direction={{ base: 'column', md: 'row' }} align="center">
              <Avatar 
                size="2xl" 
                src={profile.profile_image} 
                mr={{ base: 0, md: 8 }} 
                mb={{ base: 4, md: 0 }}
                icon={<Icon as={GiCook} color="white" boxSize="2.5rem" />}
                bg="#7ac142"
              />
              
              <Box flex="1">
                <Flex align="center" mb={4}>
                  <Heading 
                    size="xl" 
                    mr={4}
                    bgGradient="linear(to-r, #7ac142, #68a939)"
                    bgClip="text"
                    letterSpacing="tight"
                    fontWeight="900"
                    fontSize="2xl"
                  >
                    {profile.username}
                  </Heading>
                  {!isOwnProfile && (
                    <Button 
                      colorScheme="green" 
                      variant="outline"
                      onClick={handleFollow}
                      borderRadius="xl"
                      fontWeight="bold"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.2s"
                    >
                      {profile.is_following ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </Flex>
                
                {/* Profile Statistics Section */}
                <Flex mb={6} gap={8} align="center">
                  {/* Recipe count statistic */}
                  <Text fontSize="lg" fontWeight="bold">
                    <Text as="span" color="#7ac142">{posts.length}</Text> Recipes
                  </Text>
                  
                  {/* Followers count - clickable to show modal */}
                  <Text 
                    fontSize="lg" 
                    fontWeight="bold" 
                    onClick={fetchFollowers}
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    _hover={{ color: "#7ac142" }}
                    transition="all 0.2s"
                  >
                    <Text as="span" color="#7ac142" mr={1}>{profile.follower_count || 0}</Text> 
                    Followers
                    <Icon as={FaUserFriends} ml={1} color="#7ac142" />
                  </Text>
                  
                  {/* Following count statistic */}
                  <Text fontSize="lg" fontWeight="bold">
                    <Text as="span" color="#7ac142">{profile.following_count || 0}</Text> Following
                  </Text>
                </Flex>
                
                {isEditingBio ? (
                  <Flex gap={2}>
                    <Textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      placeholder="Write Something About Yourself..."
                      size="sm"
                      resize="vertical"
                      borderRadius="xl"
                      focusBorderColor="#7ac142"
                      fontSize="md"
                    />
                    <IconButton
                      icon={<IoSave />}
                      onClick={handleUpdateBio}
                      colorScheme="green"
                      aria-label="Save Bio"
                      borderRadius="xl"
                    />
                  </Flex>
                ) : (
                  <Flex align="center" gap={2}>
                    <Text fontSize="md" color="#4A5568" fontWeight="500">
                      {profile.bio || 'TasteBuds Chef In The Making! 👨‍🍳'}
                    </Text>
                    {isOwnProfile && (
                      <IconButton
                        icon={<FaEdit />}
                        onClick={() => {
                          setEditedBio(profile.bio || '');
                          setIsEditingBio(true);
                        }}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        aria-label="Edit Bio"
                      />
                    )}
                  </Flex>
                )}
              </Box>
            </Flex>
          </Box>

          {/* Recipes Section */}
          <Box bg="white" borderRadius="2xl" boxShadow="md" p={8}>
            <Flex justifyContent="center" mb={6}>
              <HStack spacing={8}>
                <VStack>
                  <Icon as={GiCook} boxSize="1.5rem" color="#7ac142" />
                  <Text 
                    fontWeight="900" 
                    color="#7ac142"
                    fontSize="xl"
                    letterSpacing="wide"
                  >
                    My Recipes
                  </Text>
                </VStack>
              </HStack>
            </Flex>
            
            {/* Recipes Grid */}
            {posts.length > 0 ? (
              <Grid 
                templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} 
                gap={6}
              >
                {posts.map((post) => {
                  // Parse recipe data for each post
                  let recipeData;
                  try {
                    recipeData = JSON.parse(post.caption);
                  } catch (e) {
                    recipeData = { title: post.caption };
                  }

                  return (
                    <GridItem key={post.id} onClick={() => openPostModal(post)} cursor="pointer">
                      <Box 
                        position="relative" 
                        borderRadius="xl"
                        overflow="hidden"
                        boxShadow="lg"
                        transition="all 0.2s"
                        _hover={{
                          transform: 'translateY(-4px)',
                          boxShadow: 'xl',
                        }}
                        bg="white"
                      >
                        <Box position="relative" paddingTop="56.25%">
                          <Image 
                            src={post.image} 
                            alt={recipeData.title || 'Recipe'} 
                            position="absolute"
                            top="0"
                            left="0"
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        </Box>
                        <Box p={4}>
                          <Heading size="md" mb={2} noOfLines={2}>
                            {recipeData.title || 'Untitled Recipe'}
                          </Heading>
                          {recipeData.ingredients && (
                            <Text fontSize="sm" color="gray.600">
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
                  No Recipes Yet
                </Text>
                {isOwnProfile && (
                  <Button 
                    as="a" 
                    href="/create" 
                    colorScheme="green" 
                    size="lg"
                    mt={4}
                    leftIcon={<Icon as={GiCook} />}
                    borderRadius="xl"
                    fontWeight="bold"
                    px={8}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Create Your First Recipe
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Recipe Details Modal */}
          <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            isCentered
            motionPreset="scale"
            size="xl"
          >
            <ModalOverlay 
              bg="blackAlpha.800" 
              backdropFilter="blur(8px)"
            />
            <ModalContent 
              borderRadius="2xl" 
              overflow="hidden"
              boxShadow="2xl"
              maxW="800px"
              w="90%"
              maxH="90vh"
              mx="auto"
              my="auto"
              position="relative"
              bg="white"
            >
              <ModalCloseButton
                position="absolute"
                top={2}
                right={2}
                zIndex={2}
                size="sm"
                color="white"
                bg="blackAlpha.400"
                borderRadius="full"
                _hover={{
                  bg: "blackAlpha.600",
                  transform: "scale(1.1)",
                }}
                transition="all 0.2s"
              />
              
              {selectedPost && (
                <>
                  <Box position="relative">
                    <Image
                      src={selectedPost.image}
                      alt={selectedPost.recipeData?.title || 'Recipe'}
                      width="100%"
                      height="350px"
                      objectFit="cover"
                    />
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
                      p={6}
                      pt={24}
                    >
                      <Heading size="xl" color="white" letterSpacing="tight">
                        {selectedPost.recipeData?.title || 'Untitled Recipe'}
                      </Heading>
                    </Box>
                  </Box>

                  <ModalBody 
                    p={8}
                    bg="white"
                    maxH="calc(90vh - 350px)"
                    overflowY="auto"
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#CBD5E0',
                        borderRadius: '20px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#A0AEC0',
                      },
                    }}
                  >
                    <VStack spacing={8} align="stretch">
                      {isOwnProfile && (
                        <Button
                          leftIcon={<FaEdit />}
                          colorScheme="green"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/create?edit=${selectedPost.id}`);
                            onClose();
                          }}
                          size="lg"
                          width="100%"
                          boxShadow="md"
                          _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                          mb={2}
                        >
                          Edit Recipe
                        </Button>
                      )}

                      {selectedPost.recipeData?.ingredients && selectedPost.recipeData.ingredients.length > 0 && (
                        <Box 
                          bg="gray.50" 
                          p={7} 
                          borderRadius="xl"
                          boxShadow="sm"
                          border="1px solid"
                          borderColor="gray.100"
                        >
                          <Heading size="lg" mb={5} color="#2D3748">
                            Ingredients
                          </Heading>
                          <VStack align="stretch" spacing={3}>
                            {selectedPost.recipeData.ingredients.map((ingredient, index) => (
                              <Text 
                                key={index}
                                fontSize="lg"
                                color="#4A5568"
                                display="flex"
                                alignItems="center"
                              >
                                <Box 
                                  as="span" 
                                  mr={3}
                                  color="#7ac142"
                                  fontSize="1.2em"
                                >
                                  •
                                </Box>
                                {ingredient.quantity} {ingredient.unit} {ingredient.name}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {selectedPost.recipeData?.instructions && (
                        <Box 
                          bg="gray.50" 
                          p={7} 
                          borderRadius="xl"
                          boxShadow="sm"
                          border="1px solid"
                          borderColor="gray.100"
                        >
                          <Heading size="lg" mb={5} color="#2D3748">
                            Instructions
                          </Heading>
                          <Text 
                            whiteSpace="pre-line"
                            fontSize="lg"
                            color="#4A5568"
                            lineHeight="1.8"
                          >
                            {selectedPost.recipeData.instructions}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}

      {/* Followers Modal - Displays list of users who follow this profile */}
      <Modal 
        isOpen={isFollowersOpen} 
        onClose={onFollowersClose} 
        isCentered 
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent 
          borderRadius="xl" 
          maxW="400px" 
          mx="auto"
          my="auto"
          position="relative"
          top="0"
          boxShadow="xl"
          bg="white"
        >
          {/* Modal Header with gradient background */}
          <ModalHeader 
            fontSize="lg" 
            fontWeight="bold" 
            textAlign="center"
            bgGradient="linear(to-r, #7ac142, #68a939)"
            color="white"
            borderTopRadius="xl"
          >
            <Flex align="center" justify="center">
              <Icon as={FaUserFriends} mr={2} />
              <Text>Followers of {profileUsername}</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            {/* Loading state */}
            {loadingFollowers ? (
              <Center py={8}>
                <Spinner size="lg" color="#7ac142" thickness="4px" />
              </Center>
            ) : followers.length > 0 ? (
              /* List of followers with their avatar and basic info */
              <List spacing={3}>
                {followers.map(follower => (
                  <ListItem key={follower.username} py={2}>
                    <Flex align="center" 
                      onClick={() => {
                        onFollowersClose();
                        navigate(`/profile/${follower.username}`);
                      }} 
                      cursor="pointer"
                      p={2}
                      borderRadius="md"
                      _hover={{ bg: "gray.50" }}
                      transition="all 0.2s"
                    >
                      <Avatar 
                        size="md" 
                        name={follower.username} 
                        src={follower.profile_image}
                        mr={3}
                        bg="#7ac142"
                        icon={<Icon as={GiCook} color="white" />}
                      />
                      <Box>
                        <Text fontWeight="bold">{follower.username}</Text>
                        <Text fontSize="sm" color="gray.500" noOfLines={1}>
                          {follower.bio || "TasteBuds User"}
                        </Text>
                      </Box>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            ) : (
              /* Empty state when user has no followers */
              <Center flexDirection="column" py={8}>
                <Icon as={FaUserFriends} boxSize="3rem" color="#7ac142" mb={4} />
                <Text fontWeight="medium" textAlign="center">
                  {profile?.username} doesn't have any followers yet.
                </Text>
              </Center>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;