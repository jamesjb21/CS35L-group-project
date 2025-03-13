import React from 'react';
import { Box } from '@chakra-ui/react';
import CreatePost from '../components/CreatePost';

function CreateRecipe() {
    return (
        <Box maxW="800px" mx="auto" py={6}>
            <CreatePost />
        </Box>
    );
}

export default CreateRecipe;