import React, { useState, useEffect } from 'react';
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
  Divider,
  Image,
  Grid,
  GridItem,
  SimpleGrid,
  Stack,
  Center,
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

  // Set up a debounce function for the search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        // Clear results if search term is empty
        setUsers([]);
        setRecipes([]);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Make both API calls in parallel
      const [usersResponse, recipesResponse] = await Promise.all([
        axios.get(`${API_URL}/api/users/search/?query=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_URL}/api/recipes/search/?query=${query}`, {
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

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
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
    <Box maxW="1200px" mx="auto" py={6} px={4}>
      <Heading 
        size="xl" 
        mb={6} 
        textAlign="center"
        bgGradient="linear(to-r, green.400, teal.500)" 
        bgClip="text"
        fontWeight="bold"
      >
        Find Users & Recipes
      </Heading>
      
      <Center mb={8} width="100%">
        <Box width="100%" maxW="1100px">
          <InputGroup size="lg" width="100%">
            <InputLeftElement pointerEvents="none" color="gray.400" height="100%">
              <IoSearch size={24} />
            </InputLeftElement>
            <Input 
              placeholder="Search for users or recipes..." 
              value={searchTerm} 
              onChange={handleInputChange}
              pl="50px"
              py={4}
              size="lg"
              fontSize="lg"
              borderRadius="md"
              boxShadow="md"
              border="2px solid"
              borderColor="green.400"
              _focus={{ boxShadow: "0 0 0 2px #7ac142" }}
              width="100%"
            />
          </InputGroup>
        </Box>
      </Center>
      
      {loading ? (
        <Flex justify="center" my={10}>
          <Spinner size="xl" color="green.400" thickness="4px" />
        </Flex>
      ) : (
        searchTerm ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Recipes Section (Left) */}
            <Box>
              <Heading size="md" mb={4} color="green.600" display="flex" alignItems="center">
                <GiCook style={{marginRight: '8px'}} /> 
                Recipes ({recipes.length})
              </Heading>
              
              {recipes.length > 0 ? (
                <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={6}>
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
                          height="100%"
                        >
                          <Box position="relative" height="150px">
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
              ) : (
                <Text textAlign="center" color="gray.500" fontSize="lg" py={6}>
                  No recipes found matching "{searchTerm}"
                </Text>
              )}
            </Box>
            
            {/* Users Section (Right) */}
            <Box>
              <Heading size="md" mb={4} color="green.600" display="flex" alignItems="center">
                <Box as="span" mr={2}>👤</Box> 
                Users ({users.length})
              </Heading>
              
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
                ) : (
                  <Text textAlign="center" color="gray.500" py={6}>No users found matching "{searchTerm}"</Text>
                )}
              </VStack>
            </Box>
          </SimpleGrid>
        ) : (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            py={12} 
            color="gray.500"
          >
            <GiCook size={80} color="#7ac142" />
            <Text mt={6} fontSize="xl" fontWeight="medium">
              Search for users or delicious recipes
            </Text>
            <Text fontSize="md" mt={2}>
              Start typing to search for username or recipe titles
            </Text>
          </Flex>
        )
      )}
    </Box>
  );
}

export default Search;