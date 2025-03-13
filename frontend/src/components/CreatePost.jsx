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
  Container,
  NumberInput,
  NumberInputField,
  Heading,
  Checkbox
} from '@chakra-ui/react';
import { IoAdd, IoChevronBack } from 'react-icons/io5';
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
  const [customUnit, setCustomUnit] = useState('');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [skipQuantity, setSkipQuantity] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  const unitOptions = [
    'tbsp', 'tsp', 'cup', 'oz', 'g', 'kg', 'lb', 'ml', 'L', 'pinch', 'to taste', 'count', 'other'
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

  const handleUnitChange = (e) => {
    const value = e.target.value;
    setCurrentUnit(value);
    setIsCustomUnit(value === 'other');
  };

  // Function to switch back from custom unit to standard dropdown
  const switchToStandardUnits = () => {
    setIsCustomUnit(false);
    setCurrentUnit('tbsp');
  };

  const addIngredient = () => {
    // Check if we have a valid ingredient name
    if (currentIngredient.trim()) {
      const newIngredient = {
        id: Date.now(),
        name: currentIngredient.trim(),
        quantity: skipQuantity ? 0 : currentQuantity,
        unit: skipQuantity ? '' : (isCustomUnit ? customUnit.trim() || 'custom' : currentUnit)
      };

      setIngredients([...ingredients, newIngredient]);
      setCurrentIngredient('');
      
      // Reset quantity if not skipping
      if (!skipQuantity) {
        setCurrentQuantity(1);
        if (isCustomUnit) {
          setCustomUnit('');
        }
      }
    } else {
      // Alert user that ingredient name is required
      toast({
        title: "Ingredient name required",
        description: "Please enter an ingredient name",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!caption.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your recipe',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
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
    
    if (!instructions.trim()) {
      toast({
        title: 'Instructions required',
        description: 'Please provide cooking instructions',
        status: 'error',
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

  // Display format for ingredients
  const formatIngredient = (ingredient) => {
    if (ingredient.quantity === 0 || !ingredient.unit) {
      return ingredient.name;
    }
    return `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
  };

  return (
    <Container maxW="900px" mx="auto" p={4}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={8} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="lg" fontWeight="bold">Recipe Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              p={2}
              size="lg"
            />
            {imagePreview && (
              <Box mt={4} position="relative">
                <Image 
                  src={imagePreview} 
                  alt="Preview" 
                  maxH="400px" 
                  width="100%" 
                  objectFit="cover" 
                  borderRadius="md" 
                />
              </Box>
            )}
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel fontSize="lg" fontWeight="bold">Recipe Title</FormLabel>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a delicious title for your recipe..."
              size="lg"
              fontSize="lg"
              p={5}
              borderRadius="md"
              boxShadow="sm"
              width="100%"
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
            />
          </FormControl>

          <Divider />
          
          <FormControl isRequired>
            <FormLabel fontSize="lg" fontWeight="bold">Ingredients</FormLabel>
            
            <VStack spacing={3} align="stretch">
              <HStack spacing={2} align="flex-end">
                <Input
                  placeholder="Enter an ingredient..."
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  flex="2"
                  size="lg"
                  fontSize="lg"
                  p={5}
                  borderRadius="md"
                  boxShadow="sm"
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                />
                
                {!skipQuantity && (
                  <>
                    <NumberInput 
                      min={0.1} 
                      precision={2} 
                      step={0.5} 
                      value={currentQuantity}
                      onChange={(valueString) => setCurrentQuantity(valueString)}
                      flex="1"
                      size="lg"
                    >
                      <NumberInputField 
                        p={5}
                        borderRadius="md"
                        boxShadow="sm"
                        _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                      />
                    </NumberInput>
                    
                    {!isCustomUnit ? (
                      <Select 
                        value={currentUnit} 
                        onChange={handleUnitChange}
                        flex="1"
                        size="lg"
                        p={2}
                        height="60px"
                        borderRadius="md"
                        boxShadow="sm"
                        _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                      >
                        {unitOptions.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </Select>
                    ) : (
                      <Flex flex="1">
                        <Input
                          placeholder="Custom unit"
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value)}
                          borderRightRadius="0"
                          size="lg"
                          p={5}
                          boxShadow="sm"
                          _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                        />
                        <IconButton
                          icon={<IoChevronBack />}
                          onClick={switchToStandardUnits}
                          colorScheme="blue"
                          aria-label="Back to standard units"
                          borderLeftRadius="0"
                          title="Switch back to standard units"
                          height="60px"
                        />
                      </Flex>
                    )}
                  </>
                )}
                
                <IconButton
                  icon={<IoAdd />}
                  onClick={addIngredient}
                  colorScheme="green"
                  aria-label="Add ingredient"
                  size="lg"
                  height="60px"
                  width="60px"
                />
              </HStack>
              
              <Checkbox 
                isChecked={skipQuantity} 
                onChange={(e) => setSkipQuantity(e.target.checked)}
                colorScheme="green"
                size="lg"
                p={2}
              >
                Add ingredient name only (no quantity/unit)
              </Checkbox>
            </VStack>
            
            <Box mt={4}>
              {ingredients.length > 0 ? (
                <VStack align="stretch" spacing={2} mt={2}>
                  <Heading size="sm" mb={2}>Added Ingredients:</Heading>
                  {ingredients.map(ingredient => (
                    <Flex 
                      key={ingredient.id} 
                      p={3} 
                      bg="gray.50" 
                      borderRadius="md" 
                      align="center"
                      justify="space-between"
                    >
                      <Text>
                        {formatIngredient(ingredient)}
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
            <FormLabel fontSize="lg" fontWeight="bold">Cooking Instructions</FormLabel>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Share detailed cooking instructions..."
              resize="vertical"
              minH="300px"
              size="lg"
              fontSize="md"
              p={5}
              borderRadius="md"
              boxShadow="sm"
              width="100%"
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
            />
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            size="lg"
            width="100%"
            fontSize="lg"
            py={7}
            mt={6}
          >
            Share Recipe
          </Button>
        </VStack>
      </form>
    </Container>
  );
};

export default CreatePost; 