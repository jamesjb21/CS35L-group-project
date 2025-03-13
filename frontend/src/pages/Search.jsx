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
  useToast
} from '@chakra-ui/react';
import { IoSearch } from 'react-icons/io5';
import axios from 'axios';
import { API_URL } from '../constants';
import { useNavigate } from 'react-router-dom';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/users/search/?query=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users. Please try again.',
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

  return (
    <Box maxW="600px" mx="auto" py={6} px={4}>
      <Heading size="lg" mb={6}>Search Users</Heading>
      
      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none" color="gray.400">
            <IoSearch />
          </InputLeftElement>
          <Input 
            placeholder="Search for users by username" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            pl="40px"
          />
        </InputGroup>
        <Button ml={2} colorScheme="blue" onClick={handleSearch} isLoading={loading}>
          Search
        </Button>
      </Flex>
      
      {loading ? (
        <Flex justify="center" my={10}>
          <Spinner size="xl" />
        </Flex>
      ) : (
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
                _hover={{ bg: 'gray.50' }}
              >
                <Avatar 
                  size="md" 
                  name={user.username} 
                  src={user.profile_image} 
                  mr={4} 
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
            <Text textAlign="center" color="gray.500">No users found matching "{searchTerm}"</Text>
          ) : null}
        </VStack>
      )}
    </Box>
  );
}

export default Search;