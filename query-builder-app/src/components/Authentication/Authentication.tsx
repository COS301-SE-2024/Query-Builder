// "use client"
import '../../app/globals.css';
import './Authentication.css';
import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Input, useDisclosure, Modal, ModalContent, ModalBody, Spacer } from '@nextui-org/react';
import { EyeFilledIcon } from './EyeFilledIcon';
import { EyeSlashFilledIcon } from './EyeSlashFilledIcon';
import { login, navigateToSignedInHomePage, signup } from '../../app/authentication/actions'
import toast from 'react-hot-toast';
import { AuthError } from '@supabase/supabase-js';
import { createClient } from "./../../utils/supabase/client";
import { color } from 'framer-motion';
import ForgotPasswordModal from '../ForgotPasswordModal/ForgotPasswordModal';

export default function Authentication() {

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoginVisible, setLoginIsVisible] = useState(false);
  const toggleLoginVisibility = () => setLoginIsVisible(!isLoginVisible);
  const [loading, setLoading] = useState(false);

  // Sign in
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmailHasBeenFocused, setLoginEmailHasBeenFocused] =
    useState(false);
  const [loginPasswordBeenFocused, setLoginPasswordHasBeenFocused] =
    useState(false);

  const validateEmail = (value: any) =>
    value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const isLoginEmailInvalid = React.useMemo(() => {
    if (loginEmail === '') return true;

    return validateEmail(loginEmail) ? false : true;
  }, [loginEmail]);

  const isLoginPasswordInvalid = React.useMemo(() => {
    if (loginPassword === '') return true;

    return false;
  }, [loginPassword]);

  // Sign Up
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpFirstNameHasBeenFocused, setSignUpFirstNameHasBeenFocused] =
    useState(false);
  const [signUpLastNameHasBeenFocused, setSignUpLastNameHasBeenFocused] =
    useState(false);
  const [signUpEmailHasBeenFocused, setSignUpEmailHasBeenFocused] =
    useState(false);
  const [signUpPasswordBeenFocused, setSignUpPasswordHasBeenFocused] =
    useState(false);

  const isSignUpEmailInvalid = React.useMemo(() => {
    if (signUpEmail === '') return true;

    return validateEmail(signUpEmail) ? false : true;
  }, [signUpEmail]);

  const isSignUpPasswordInvalid = React.useMemo(() => {
    if (signUpPassword === '') return true;

    return false;
  }, [signUpPassword]);

  const isSignUpFirstNameInvalid = React.useMemo(() => {
    if (signUpFirstName === '') return true;

    return false;
  }, [signUpFirstName]);

  const isSignUpLastNameInvalid = React.useMemo(() => {
    if (signUpLastName === '') return true;

    return false;
  }, [signUpLastName]);

  const [view, setView] = useState('');
  const changeView = () => {
    setLoginPasswordHasBeenFocused(false);
    setLoginEmailHasBeenFocused(false);
    setSignUpPasswordHasBeenFocused(false);
    setSignUpEmailHasBeenFocused(false);
    setSignUpFirstNameHasBeenFocused(false);
    setSignUpLastNameHasBeenFocused(false);
    setIsVisible(false);
    setLoginIsVisible(false);
    setLoading(false);

    if (view == '') {
      setView('right-panel-active');
    } else {
      setView('');
    }
  };

  // This function gets the token from local storage.
  // Supabase stores the token in local storage so we can access it from there.
  const getToken = async () => {

    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token

    console.log(token)

    return token;
  };

  const loginUser = async (email: string, password: string) => {

    //sign into QBee server
    //call the sign-in API endpoint
    setLoading(true);
    try {
      let response;
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/gen-session-key`, {
          credentials: "include",
          method: "PUT",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email, password: password })
        });

        let responseData = await response.json();
      } catch (error) {
        toast.error("Failed to generate session token! Please try logging in again");
      }

      await login(email, password);

      let generateTestOrgResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/org-management/setup-test-scenario`, {
        credentials: "include",
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getToken()
        }
      });

      navigateToSignedInHomePage();

    } catch (error) {
      if (error instanceof AuthError) {
        toast.error("Failed to login in:\nInvalid Credentials, please check your email and password, and try again.");
        // console.log(error);
      }
      else if (error instanceof Error && error.message.includes("Confirm account")) {
        toast.error("Please check your emails and confirm your account.");
      }
      else if (error instanceof Error && error.message.includes("Invalid")) {
        toast.error("Failed to login in:\nPlease check your email and password, and try again.");
        // console.log(error);
      }
      else if (error instanceof Error && error.message.includes("Unexpected")) {
        toast.error("Failed to login in:\nPlease check your emails and confirm your account and try logging in again.");
        // console.log(error);
      }
      else {
        toast.error("Unexpected error, failed to login. Please try logging in again.");
      }
    }
    finally {
      setLoading(false);
    }

  };

  const signUpUser = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);
    try {
      await signup(firstName, lastName, email, password);
      toast.success("Successfully signed up, please check your emails and confirm your account.");
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error("Error while signing up, please try again!");
      }
      else if (error) {
        // console.error(error);
        if (error instanceof Error && error.message.includes("Too many sign-up attempts")) {
          toast.error("Confirmation email already sent please check your emails and confirm your account!");
        }
        else if (error instanceof Error && error.message.includes("This email is already taken.")) {
          toast.error("This email is already taken, please use another email address, or please sign in using your email address");
        }
        else if (error instanceof Error && error.message.includes("Confirm account")) {
          toast.error("This email is already taken, please use another email address, or please check your emails and confirm your account");
        }
        else {
          toast.error("An unexpected error occurred");
        }
      }
    }
    finally {
      setLoading(false);
    }


  };


  const [isModalOpen, setModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState<boolean>(false);

  const handleForgotPasswordClick = () => {
    onOpenChange();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
  };

  const handlePasswordReset = async (email: string) => {
    if (await checkEmailExists(email)) {
      const supabase = createClient();
  
      // Specify the redirect URL here
      const redirectTo = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset`; // Change this to your desired URL
  
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  
       if (error) {
        toast.error('Error sending password reset link, maybe try again later?');
      }else if (data) {
        toast.success('Password reset link sent successfully!');
        setModalOpen(false);
      }
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  async function checkEmailExists(email: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/get-user`, {
        credentials: "include",
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email }),
    });

    const result = await response.json();

    // Check if the response indicates that the user exists
    if (result.statusCode === 404) {
        return false; // User not found, email does not exist
    } else if (result.data?.length > 0) {
        return true; // User exists
    }

    throw new Error('Unexpected error.'); // Handle unexpected responses
}


  return (
    <>
      <Button onPress={onOpen}
        className="md:w-full md:m-2 mt-0 mb-1 bg-default-cl text-white"
        variant="solid"
        // color="primary"
        radius="full"
      >Get Started</Button>

      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        className="px-0 w-9/12 max-w-full"
        hideCloseButton
      // size='full'

      >
        <ModalContent
        >
          {(onClose: any) => (
            <>
              <ModalBody className='px-0' >
                <div
                  className={'authenticationContainer ' + view}
                  id="authenticationContainer"
                >
                  <div className="form-container sign-up-container">
                    <div className="form">
                      <h1>Create Account</h1>
                      <span>Use your email for registration</span>
                      <br />
                      <div className="infield">
                        <Input
                          isRequired
                          label="First Name"
                          variant="bordered"
                          onValueChange={setSignUpFirstName}
                          onFocus={() => {
                            setSignUpPasswordHasBeenFocused(false);
                            setSignUpEmailHasBeenFocused(false);
                            setSignUpFirstNameHasBeenFocused(true);
                            setSignUpLastNameHasBeenFocused(false);
                            setLoginPasswordHasBeenFocused(false);
                            setLoginEmailHasBeenFocused(false);
                          }}
                          isInvalid={
                            isSignUpFirstNameInvalid && signUpFirstNameHasBeenFocused
                          }
                          color={
                            !signUpFirstNameHasBeenFocused
                              ? 'primary'
                              : isSignUpFirstNameInvalid
                                ? 'danger'
                                : 'success'
                          }
                          errorMessage="Please enter a username"
                        />
                      </div>
                      <div className="infield">
                        <Input
                          isRequired
                          label="Last Name"
                          variant="bordered"
                          onValueChange={setSignUpLastName}
                          onFocus={() => {
                            setSignUpPasswordHasBeenFocused(false);
                            setSignUpEmailHasBeenFocused(false);
                            setSignUpFirstNameHasBeenFocused(false);
                            setSignUpLastNameHasBeenFocused(true);
                            setLoginPasswordHasBeenFocused(false);
                            setLoginEmailHasBeenFocused(false);
                          }}
                          isInvalid={
                            isSignUpLastNameInvalid && signUpLastNameHasBeenFocused
                          }
                          color={
                            !signUpLastNameHasBeenFocused
                              ? 'primary'
                              : isSignUpLastNameInvalid
                                ? 'danger'
                                : 'success'
                          }
                          errorMessage="Please enter a username"
                        />
                      </div>
                      <div className="infield">
                        <Input
                          isRequired
                          label="Email"
                          variant="bordered"
                          type="email"
                          onValueChange={setSignUpEmail}
                          onFocus={() => {
                            setSignUpPasswordHasBeenFocused(false);
                            setSignUpEmailHasBeenFocused(true);
                            setSignUpFirstNameHasBeenFocused(false);
                            setSignUpLastNameHasBeenFocused(false);
                            setLoginPasswordHasBeenFocused(false);
                            setLoginEmailHasBeenFocused(false);
                          }}
                          isInvalid={
                            isSignUpEmailInvalid && signUpEmailHasBeenFocused
                          }
                          color={
                            !signUpEmailHasBeenFocused
                              ? 'primary'
                              : isSignUpEmailInvalid && signUpEmailHasBeenFocused
                                ? 'danger'
                                : 'success'
                          }
                          errorMessage="Please enter a valid email"
                        />
                      </div>
                      <div className="infield">
                        <Input
                          isRequired
                          label="Password"
                          variant="bordered"
                          onValueChange={setSignUpPassword}
                          onFocus={() => {
                            setSignUpPasswordHasBeenFocused(true);
                            setSignUpEmailHasBeenFocused(false);
                            setSignUpFirstNameHasBeenFocused(false);
                            setSignUpLastNameHasBeenFocused(false);
                            setLoginPasswordHasBeenFocused(false);
                            setLoginEmailHasBeenFocused(false);
                          }}
                          isInvalid={
                            isSignUpPasswordInvalid && signUpPasswordBeenFocused
                          }
                          color={
                            !signUpPasswordBeenFocused
                              ? 'primary'
                              : isSignUpPasswordInvalid
                                ? 'danger'
                                : 'success'
                          }
                          errorMessage="Please enter a password"
                          endContent={
                            <button
                              className="focus:outline-none"
                              type="button"
                              id="passwordVisibility"
                              onClick={toggleVisibility}
                            >
                              {isVisible ? (
                                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                              ) : (
                                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                              )}
                            </button>
                          }
                          type={isVisible ? 'text' : 'password'}
                        />
                      </div>
                      <Button
                        isLoading={loading}
                        onClick={() => {
                          signUpUser(
                            signUpFirstName,
                            signUpLastName,
                            signUpEmail,
                            signUpPassword,
                          );

                        }}
                        variant="bordered"
                        isDisabled={
                          isSignUpEmailInvalid ||
                          isSignUpFirstNameInvalid ||
                          isSignUpLastNameInvalid ||
                          isSignUpPasswordInvalid
                        }
                        spinner={
                          <svg
                            className="animate-spin h-5 w-5 text-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              fill="currentColor"
                            />
                          </svg>
                        }
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                  <div className="form-container sign-in-container">
                    <div className="form">
                      <h1>Sign in</h1>
                      <div className="infield">
                        <Input
                          isRequired
                          label="Email"
                          variant="bordered"
                          type="email"
                          onValueChange={setLoginEmail}
                          onFocus={() => {
                            setLoginPasswordHasBeenFocused(false);
                            setLoginEmailHasBeenFocused(true);
                            setSignUpPasswordHasBeenFocused(false);
                            setSignUpEmailHasBeenFocused(false);
                            setSignUpFirstNameHasBeenFocused(false);
                            setSignUpLastNameHasBeenFocused(false);
                          }}
                          isInvalid={isLoginEmailInvalid && loginEmailHasBeenFocused}
                          color={
                            !loginEmailHasBeenFocused
                              ? 'primary'
                              : isLoginEmailInvalid && loginEmailHasBeenFocused
                                ? 'danger'
                                : 'success'
                          }
                          errorMessage="Please enter a valid email"
                        />
                      </div>
                      <div className="infield">
                        <Input
                          isRequired
                          label="Password"
                          variant="bordered"
                          onValueChange={setLoginPassword}
                          onFocus={() => {
                            setLoginPasswordHasBeenFocused(true);
                            setLoginEmailHasBeenFocused(false);
                            setSignUpPasswordHasBeenFocused(false);
                            setSignUpEmailHasBeenFocused(false);
                            setSignUpFirstNameHasBeenFocused(false);
                            setSignUpLastNameHasBeenFocused(false);
                          }}
                          isInvalid={
                            isLoginPasswordInvalid && loginPasswordBeenFocused
                          }
                          color={
                            !loginPasswordBeenFocused
                              ? 'primary'
                              : isLoginPasswordInvalid
                                ? 'danger'
                                : 'success'
                          }
                          errorMessage="Please enter a password"
                          endContent={
                            <button
                              className="focus:outline-none"
                              type="button"
                              id="passwordVisibility"
                              onClick={toggleLoginVisibility}
                            >
                              {isLoginVisible ? (
                                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                              ) : (
                                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                              )}
                            </button>
                          }
                          type={isLoginVisible ? 'text' : 'password'}
                        />
                      </div>

                      <div className='item-end hover:underline' style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', zIndex: 1000 }}>
                        <a
                          href="#"
                          style={{
                            color: '#4e56b1',
                            textDecoration: 'none', // Optional: To remove underline
                          }}
                          onClick={handleForgotPasswordClick}
                        >
                          Forgot Password?
                        </a>
                      </div>

                      <Button
                        isLoading={loading}
                        onClick={() => loginUser(loginEmail, loginPassword)}
                        variant="bordered"
                        isDisabled={isLoginEmailInvalid || isLoginPasswordInvalid}
                        spinner={
                          <svg
                            className="animate-spin h-5 w-5 text-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              fill="currentColor"
                            />
                          </svg>
                        }
                      >
                        Login
                      </Button>
                    </div>
                  </div>
                  <div className="overlay-container" id="overlayCon">
                    <div className="overlay">
                      <div className="overlay-panel overlay-left">
                        <h1>Welcome Back!</h1>
                        <p>
                          To keep connected with us please login with your personal
                          info
                        </p>
                        <Button
                          color="primary"
                          onClick={() => changeView()}
                          variant="bordered"
                        >
                          Log in
                        </Button>
                        <Spacer />
                        <button id="cancelBTN" onClick={onClose}>
                          Cancel
                        </button>
                      </div>
                      <div className="overlay-panel overlay-right">
                        <h1>Hello, Friend!</h1>
                        <p>
                          Enter your personal details and start the journey with us
                        </p>
                        <Button
                          color="primary"
                          onClick={() => changeView()}
                          variant="bordered"
                        >
                          Create an account
                        </Button>
                        <Spacer />
                        <button id="cancelBTN" onClick={onClose}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <ForgotPasswordModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handlePasswordReset}
        />
    </>
  );
}
