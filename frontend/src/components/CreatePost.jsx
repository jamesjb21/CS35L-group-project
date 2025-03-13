import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Textarea, 
  Input,
  VStack,
  Image,
  useToast,
  HStack,
  Select,
  Text,
  IconButton,
  Divider,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  NumberInput,
  NumberInputField,
  Heading
} from '@chakra-ui/react';
import { IoAdd } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../constants';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [instructions, setInstructions] = useState('');
  
  // Ingredient related state
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentUnit, setCurrentUnit] = useState('tbsp');
  
  const toast = useToast();
  const navigate = useNavigate();

  const unitOptions = [
    'tbsp', 'tsp', 'cup', 'oz', 'g', 'kg', 'lb', 'ml', 'L', 'pinch', 'to taste', 'count'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    if (!currentIngredient.trim()) {
      toast({
        title: 'Ingredient required',
        description: 'Please enter an ingredient name',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newIngredient = {
      id: Date.now(),
      name: currentIngredient.trim(),
      quantity: currentQuantity,
      unit: currentUnit
    };

    setIngredients([...ingredients, newIngredient]);
    setCurrentIngredient('');
    setCurrentQuantity(1);
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      toast({
        title: 'Image required',
        description: 'Please select an image of your recipe to upload',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (ingredients.length === 0) {
      toast({
        title: 'Ingredients required',
        description: 'Please add at least one ingredient',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Format recipe data for submission
      const recipeData = {
        title: caption,
        ingredients: ingredients,
        instructions: instructions
      };
      
      // Convert to JSON string and include in the caption
      const recipeJson = JSON.stringify(recipeData);
      
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', recipeJson);
      
      await axios.post(
        `${API_URL}/api/posts/create/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      toast({
        title: 'Recipe posted',
        description: 'Your recipe has been shared successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to share recipe. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Recipe Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <Box mt={4}>
                <Image src={imagePreview} alt="Preview" maxH="300px" />
              </Box>
            )}
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Recipe Title</FormLabel>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a title for your recipe..."
            />
          </FormControl>

          <Divider />
          
          <FormControl isRequired>
            <FormLabel>Ingredients</FormLabel>
            
            <HStack mb={3}>
              <Input
                placeholder="Search for an ingredient..."
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                flex="2"
              />
              
              <NumberInput 
                min={0.1} 
                precision={2} 
                step={0.5} 
                value={currentQuantity}
                onChange={(valueString) => setCurrentQuantity(valueString)}
                flex="1"
              >
                <NumberInputField />
              </NumberInput>
              
              <Select 
                value={currentUnit} 
                onChange={(e) => setCurrentUnit(e.target.value)}
                flex="1"
              >
                {unitOptions.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </Select>
              
              <IconButton
                icon={<IoAdd />}
                onClick={addIngredient}
                colorScheme="green"
                aria-label="Add ingredient"
              />
            </HStack>
            
            <Box>
              {ingredients.length > 0 ? (
                <VStack align="stretch" spacing={2} mt={2}>
                  <Heading size="sm" mb={2}>Added Ingredients:</Heading>
                  {ingredients.map(ingredient => (
                    <Flex 
                      key={ingredient.id} 
                      p={2} 
                      bg="gray.50" 
                      borderRadius="md" 
                      align="center"
                      justify="space-between"
                    >
                      <Text>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </Text>
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeIngredient(ingredient.id)}
                        aria-label="Remove ingredient"
                      />
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500" mt={2}>No ingredients added yet</Text>
              )}
            </Box>
          </FormControl>

          <Divider />
          
          <FormControl isRequired>
            <FormLabel>Cooking Instructions</FormLabel>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Share detailed cooking instructions..."
              resize="vertical"
              minH="150px"
            />
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            isDisabled={!image || ingredients.length === 0}
            size="lg"
          >
            Share Recipe
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreatePost; 