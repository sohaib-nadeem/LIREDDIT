import { Box } from '@chakra-ui/react';
import React from 'react'

interface WrapperProps {
  children: React.ReactNode;
  variant?: 'small' | 'regular';
}

export const Wrapper: React.FC<WrapperProps> = ({children, variant='regular'}) => {
  return (
    <Box w='100%' maxW={variant === 'regular' ? "md": "sm"} mt={8} mx="auto">
      {children}
    </Box>
  );
}

export default Wrapper;