import React, { useState, useCallback } from 'react';
import {
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast,
  Box,
  Icon,
  Text,
  Center,
  Flex
} from '@chakra-ui/react';
import { FaTrash, FaEyeSlash } from 'react-icons/fa';
import { deletePost } from '../utils/postUtils';

/**
 * DeletePostButton component
 * @param {Object} props - Component props
 * @param {string} props.postId - ID of the post to delete
 * @param {Function} props.onDelete - Callback function after successful deletion
 * @param {boolean} props.isOwner - Whether the current user is the owner of the post
 * @returns {JSX.Element} - The DeletePostButton component
 */
const DeletePostButton = ({ postId, onDelete, isOwner }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  // If user is not the owner, don't render the button
  if (!isOwner) return null;

  const onClose = () => setIsOpen(false);

  // Use stopPropagation to prevent parent elements from capturing the event
  const handleButtonClick = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(true);
  }, []);

  const handleDelete = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log(`Starting hide process for post ID: ${postId}`);
    
    if (!postId) {
      console.error('Cannot hide: missing post ID');
      toast({
        title: 'Error',
        description: 'Cannot identify recipe to hide',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      const result = await deletePost(postId);
      
      // Close dialog
      onClose();
      
      // Show success toast - clarify this is a hide function
      toast({
        title: 'Recipe Hidden',
        description: 'This recipe has been hidden from your view. Currently, other users can still see it.',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      
      // Call the onDelete callback to update UI
      if (onDelete) {
        console.log('Calling onDelete callback with postId:', postId);
        onDelete(postId);
      } else {
        console.log('No onDelete callback provided');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      
      let errorMessage = 'Failed to hide recipe.';
      
      // Handle specific error cases
      if (error.message && error.message.includes('endpoint not found')) {
        errorMessage = 'Hide function is not currently available. Please try again later.';
      } else if (error.message && error.message.includes('permission')) {
        errorMessage = 'You do not have permission to hide this recipe.';
      } else {
        errorMessage = error.message || 'Failed to hide recipe. Please try again.';
      }
      
      toast({
        title: 'Cannot Hide Recipe',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      
      // Close the dialog in case of endpoint not found errors
      if (error.message && error.message.includes('endpoint not found')) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box 
      position="relative" 
      zIndex={1}
      onClick={(e) => e.stopPropagation()}
      className="delete-button-container"
    >
      <IconButton
        icon={<FaEyeSlash />}
        aria-label="Hide recipe"
        size="sm"
        colorScheme="red"
        variant="ghost"
        onClick={handleButtonClick}
        _hover={{
          bg: 'red.50',
          transform: 'scale(1.1)',
        }}
        borderRadius="full"
      />

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        preserveScrollBarGap
        motionPreset="scale"
      >
        <AlertDialogOverlay 
          bg="blackAlpha.800"
          backdropFilter="blur(8px)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <AlertDialogContent
            borderRadius="lg"
            boxShadow="xl"
            maxW="320px"
            overflow="hidden"
            onClick={(e) => e.stopPropagation()}
            position="relative"
            zIndex={10000}
            bg="white"
            padding={3}
            margin="auto"
          >
            <AlertDialogBody py={2} textAlign="center">
              <Text fontSize="md" fontWeight="medium" mb={2}>
                Hide this recipe?
              </Text>
              <Text fontSize="sm" color="gray.500" mb={3}>
                This recipe will be hidden from your view only. 
                Currently, the delete function is limited to hiding content from your view.
              </Text>
              
              <Flex justify="center" gap={3} mt={1}>
                <Button 
                  ref={cancelRef} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  size="sm"
                  borderRadius="md"
                  width="90px"
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleDelete} 
                  size="sm"
                  isLoading={isDeleting}
                  loadingText="Hiding"
                  borderRadius="md"
                  width="90px"
                  leftIcon={<FaEyeSlash size="12px" />}
                >
                  Hide
                </Button>
              </Flex>
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DeletePostButton; 