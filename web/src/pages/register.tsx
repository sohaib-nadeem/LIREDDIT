import React from 'react'
import Wrapper from '../components/Wrapper';
import { Formik, Form } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import { InputField } from '../components/InputField';
import { useMutation } from 'urql';
import { graphql } from '../graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface registerProps {

}

const REGISTER_MUT = graphql(`
  mutation Register($username: String!, $password: String!) {
    register(options: {username: $username, password: $password}) {
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

export const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();  
  const [{}, register] = useMutation(REGISTER_MUT);
  return (
    <Wrapper variant='small'>
      <Formik 
        initialValues={{username: '', password: ''}} 
        onSubmit = {async (values, {setErrors}) => { 
          const response = await register(values);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          }
          else if (response.data?.register.user) {
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
            <Button mt={4} type="submit" colorScheme='green' isLoading={isSubmitting}>Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;

