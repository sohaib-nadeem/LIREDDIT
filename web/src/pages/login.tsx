import React from 'react'
import Wrapper from '../components/Wrapper';
import { Formik, Form } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import { InputField } from '../components/InputField';
import { useMutation } from 'urql';
import { graphql } from '../graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface loginProps {

}

const LOGIN_MUT = graphql(`
  mutation Login($username: String!, $password: String!) {
    login(options: {username: $username, password: $password}) {
      user {
        id
        username
      }
      errors {
        field
        message
      }
    }
  }
`);

export const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter();  
  const [{}, login] = useMutation(LOGIN_MUT);
  return (
    <Wrapper variant='small'>
      <Formik 
        initialValues={{username: '', password: ''}} 
        onSubmit = {async (values, {setErrors}) => { 
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          }
          else if (response.data?.login.user) {
            router.push('/')
          }
        }}
      >
        { ({ isSubmitting }) => (
          <Form>
            <InputField label='Username' placeholder='username' name='username' />
            <Box mt={4}>
              <InputField label='Password' placeholder='password' name='password' type='password' />
            </Box>
            <Button mt={4} type="submit" colorScheme='green' isLoading={isSubmitting}>Login</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Login;