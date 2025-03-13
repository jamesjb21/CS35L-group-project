import React, { useState } from 'react';
import { 
  Box, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Heading, 
  VStack, 
  Avatar, 
  Text, 
  Flex, 
  Spinner,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Image,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { IoSearch } from 'react-icons/io5';
import { GiCook } from 'react-icons/gi';
import axios from 'axios';
import { API_URL } from '../constants';
import { useNavigate } from 'react-router-dom';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Make both API calls in parallel
      const [usersResponse, recipesResponse] = await Promise.all([
        axios.get(`${API_URL}/api/users/search/?query=${searchTerm}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_URL}/api/recipes/search/?query=${searchTerm}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);
      
      setUsers(usersResponse.data);
      setRecipes(recipesResponse.data);
    } catch (error) {
      console.error('Error during search:', error);
      toast({
        title: 'Error',
        description: 'Failed to search. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const viewProfile = (username) => {
    navigate(`/profile/${username}`);
  };
  
  // Parse recipe data from caption
  const parseRecipeData = (caption) => {
    try {
      return JSON.parse(caption);
    } catch (e) {
      // If parsing fails, treat the caption as plain text
      return {
        title: caption,
        ingredients: [],
        instructions: ''
      };
    }
  };

  return (
    <Box maxW="800px" mx="auto" py={6} px={4}>
      <Heading 
        size="xl" 
        mb={6} 
        textAlign="center"
        bgGradient="linear(to-r, green.400, teal.500)" 
        bgClip="text"
        fontWeight="bold"
      >
        Search
      </Heading>
      
      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none" color="gray.400">
            <IoSearch />
          </InputLeftElement>
          <Input 
            placeholder="Search for users or recipes..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            pl="40px"
            size="lg"
            borderRadius="md"
            boxShadow="sm"
            _focus={{ borderColor: "green.400", boxShadow: "outline" }}
          />
        </InputGroup>
        <Button 
          ml={2} 
          colorScheme="green" 
          onClick={handleSearch} 
          isLoading={loading}
          size="lg"
        >
          Search
        </Button>
      </Flex>
      
      {loading ? (
        <Flex justify="center" my={10}>
          <Spinner size="xl" color="green.400" thickness="4px" />
        </Flex>
      ) : (
        <Tabs variant="enclosed" colorScheme="green" mt={4}>
          <TabList>
            <Tab>Users ({users.length})</Tab>
            <Tab>Recipes ({recipes.length})</Tab>
          </TabList>
          
          <TabPanels>
            {/* Users Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {users.length > 0 ? (
                  users.map((user) => (
                    <Flex 
                      key={user.username} 
                      p={4} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      align="center"
                      cursor="pointer"
                      onClick={() => viewProfile(user.username)}
                      _hover={{ bg: 'gray.50', borderColor: "green.300" }}
                      boxShadow="sm"
                    >
                      <Avatar 
                        size="md" 
                        name={user.username} 
                        src={user.profile_image} 
                        mr={4} 
                        bg="#7ac142"
                        icon={<GiCook color="white" />}
                      />
                      <Box>
                        <Text fontWeight="bold">{user.username}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {user.follower_count} followers • {user.posts_count} posts
                        </Text>
                      </Box>
                    </Flex>
                  ))
                ) : searchTerm ? (
                  <Text textAlign="center" color="gray.500" py={8}>No users found matching "{searchTerm}"</Text>
                ) : (
                  <Text textAlign="center" color="gray.500" py={8}>Enter a search term to find users</Text>
                )}
              </VStack>
            </TabPanel>
            
            {/* Recipes Tab */}
            <TabPanel>
              {recipes.length > 0 ? (
                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                  {recipes.map((recipe) => {
                    const recipeData = parseRecipeData(recipe.caption);
                    return (
                      <GridItem 
                        key={recipe.id} 
                        onClick={() => viewProfile(recipe.username)}
                        cursor="pointer"
                      >
                        <Box 
                          borderWidth="1px" 
                          borderRadius="lg" 
                          overflow="hidden"
                          boxShadow="md"
                          transition="all 0.2s"
                          _hover={{ 
                            transform: "translateY(-4px)", 
                            boxShadow: "lg",
                            borderColor: "green.300"
                          }}
                        >
                          <Box position="relative" height="180px">
                            <Image 
                              src={recipe.image} 
                              alt={recipeData.title} 
                              objectFit="cover"
                              width="100%"
                              height="100%"
                            />
                          </Box>
                          <Box p={4}>
                            <Heading size="md" mb={2} noOfLines={1}>
                              {recipeData.title}
                            </Heading>
                            <Flex align="center" mb={2}>
                              <Text fontSize="sm" color="gray.500">
                                by {recipe.username}
                              </Text>
                            </Flex>
                            <Flex align="center" justify="space-between">
                              <Flex align="center">
                                <GiCook color="green" />
                                <Text ml={1} fontSize="sm" color="gray.600">
                                  {recipeData.ingredients ? recipeData.ingredients.length : 0} ingredients
                                </Text>
                              </Flex>
                              <Text fontSize="sm" color="gray.500">
                                {recipe.likes_count} likes
                              </Text>
                            </Flex>
                          </Box>
                        </Box>
                      </GridItem>
                    );
                  })}
                </Grid>
              ) : searchTerm ? (
                <Text textAlign="center" color="gray.500" fontSize="lg" py={8}>
                  No recipes found matching "{searchTerm}"
                </Text>
              ) : (
                <Flex 
                  direction="column" 
                  align="center" 
                  justify="center" 
                  py={8} 
                  color="gray.500"
                >
                  <GiCook size={60} />
                  <Text mt={4} fontSize="lg">
                    Search for delicious recipes by title
                  </Text>
                  <Text fontSize="md">
                    Try searching for "pizza", "pasta", or "cake"
                  </Text>
                </Flex>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
}

export default Search;