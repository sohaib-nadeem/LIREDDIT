import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from 'next/link';
import { graphql } from '../graphql';
import { useQuery } from 'urql';

interface NavBarProps {

}

const ME_QUERY = graphql(`
  query Me {
    me {
        id
        username
    }
  }
`);

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{data, fetching}] = useQuery({query: ME_QUERY, variables: {}});

    let body = null;

    // data is loading
    if (fetching) {
        // body should be null
    }
    // user is not logged in
    else if (!data?.me) {
        body = (
            <>
                <NextLink href='/login'>
                    <Link mr={4}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link>Register</Link>
                </NextLink>
            </>
        )
    }
    // user is logged in
    else {
        body = (
            <Flex>
                <Box mr={4}>{data.me.username}</Box>
                <Button variant='link'>Logout</Button>
            </Flex>
        )

    }

    return (
        <Flex bg='green.300' p={4}>
            <Box ml='auto'>
                {body}
            </Box>
        </Flex>
    );
}