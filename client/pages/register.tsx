import { Formik, Form } from "formik";
import { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useMutation } from "urql";

const REGISTER_MUT = `mutation Register($username: String!, $password: String!) {
  register(options: {username: $username, password: $password}) {
  errors {
    field
    message
  }  
  user {
    id
    username
  }
  }
}`;

const Register = () => {
  const [, register] = useMutation(REGISTER_MUT);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          return register(values);
        }}
      >
        {() => (
          <Form>
            <InputField
              name="username"
              placeholder="Username"
              label="Username"
            />
            <InputField
              name="password"
              placeholder="Password"
              label="Password"
              type="Password"
            />
            <button
              type="submit"
              className="transition-color block rounded-md bg-teal-500 px-4 py-2 font-bold text-white hover:bg-teal-600"
            >
              Register
            </button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
