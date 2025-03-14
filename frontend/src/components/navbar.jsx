import { Text, Flex, HStack, Image, Box, Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

import { IoPersonOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaHouse } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { MdExplore } from "react-icons/md";
import { GiCook } from "react-icons/gi";
import { FaUtensils } from "react-icons/fa";

const Navbar = () => {
    const nav = useNavigate();

    const handleNavigate = (route) => {
        nav(`/${route}`)
    }
    
    // Safely navigate to profile without causing token issues
    const navigateToProfile = () => {
        // Try to get username from token - don't throw errors that might cause navigation issues
        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    // Check for either username or user_id in the token payload
                    const userIdentifier = decoded.username || decoded.user_id;
                    
                    if (userIdentifier) {
                        console.log("Navigating to profile for:", userIdentifier);
                        // Only navigate to specific profile if we have a valid identifier
                        nav(`/profile/${userIdentifier}`);
                        return;
                    } else {
                        console.log("Token decoded but no username or user_id found:", decoded);
                    }
                } catch (e) {
                    console.error("Error decoding token in navbar:", e);
                    // Continue to default profile route if token can't be decoded
                }
            } else {
                console.log("No access token found in localStorage when navigating to profile");
            }
        } catch (e) {
            console.error("Error in profile navigation:", e);
        }
        
        // Default fallback - go to generic profile route
        nav('/profile');
    }
    
    // Enhanced logout functionality 
    const handleLogout = () => {
        try {
            console.log("Logging out user");
            // Clear all auth tokens
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            
            // Create a custom event to notify other components
            window.dispatchEvent(new Event('logout'));
            
            // Dispatch a storage event to trigger the Layout component listener
            window.dispatchEvent(new StorageEvent('storage', {
                key: ACCESS_TOKEN,
                newValue: null
            }));
            
            // Navigate to login
            nav('/login');
        } catch (e) {
            console.error("Error during logout:", e);
            // If there's an error, still try to navigate to login
            nav('/login');
        }
    }

    return (
        <Flex w='100vw' h='70px' bg='#7ac142' borderBottom="1px" borderColor="gray.200" alignItems='center'>
            <HStack w='100%' px='4' justifyContent='space-between' color='white'>
                <HStack spacing='2'>
                    <GiCook size='26px' />
                    <Text fontSize='24px' fontWeight='bold' cursor="pointer" onClick={() => handleNavigate('home')}>
                        TasteBuds
                    </Text>
                </HStack>
                <HStack gap='32px'>
                    <Tooltip 
                        label="Home" 
                        hasArrow 
                        placement="bottom"
                        bg="#7ac142"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        borderRadius="md"
                        px={3}
                        py={2}
                        boxShadow="md"
                    >
                        <Box onClick={() => handleNavigate('home')} cursor="pointer">
                            <FaHouse size='26px' />
                        </Box>
                    </Tooltip>
                    <Tooltip 
                        label="Explore" 
                        hasArrow 
                        placement="bottom"
                        bg="#7ac142"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        borderRadius="md"
                        px={3}
                        py={2}
                        boxShadow="md"
                    >
                        <Box onClick={() => handleNavigate('explore')} cursor="pointer">
                            <MdExplore size='28px' />
                        </Box>
                    </Tooltip>
                    <Tooltip 
                        label="Create Recipe" 
                        hasArrow 
                        placement="bottom"
                        bg="#7ac142"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        borderRadius="md"
                        px={3}
                        py={2}
                        boxShadow="md"
                    >
                        <Box onClick={() => handleNavigate('create')} cursor="pointer">
                            <IoMdAddCircleOutline size='28px' />
                        </Box>
                    </Tooltip>
                    <Tooltip 
                        label="Search" 
                        hasArrow 
                        placement="bottom"
                        bg="#7ac142"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        borderRadius="md"
                        px={3}
                        py={2}
                        boxShadow="md"
                    >
                        <Box onClick={() => handleNavigate('search')} cursor="pointer">
                            <IoSearch size='26px' />
                        </Box>
                    </Tooltip>
                    <Tooltip 
                        label="Profile" 
                        hasArrow 
                        placement="bottom"
                        bg="#7ac142"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        borderRadius="md"
                        px={3}
                        py={2}
                        boxShadow="md"
                    >
                        <Box onClick={navigateToProfile} cursor="pointer">
                            <IoPersonOutline size='26px' />
                        </Box>
                    </Tooltip>
                    <Tooltip 
                        label="Logout" 
                        hasArrow 
                        placement="bottom"
                        bg="#7ac142"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        borderRadius="md"
                        px={3}
                        py={2}
                        boxShadow="md"
                    >
                        <Box onClick={handleLogout} cursor="pointer">
                            <IoIosLogOut size='26px' />
                        </Box>
                    </Tooltip>
                </HStack>
            </HStack>
        </Flex>
    )
}

export default Navbar;