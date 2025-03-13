import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import CreatePost from '../components/CreatePost';

function CreateRecipe() {
    return (
        <Box maxW="800px" mx="auto" py={6}>
            <Heading size="lg" mb={6} textAlign="center">Create New Recipe</Heading>
            <CreatePost />
        </Box>
    );
}

export default CreateRecipe;