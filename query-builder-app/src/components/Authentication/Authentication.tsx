// "use client"
import '../../app/globals.css';
import './Authentication.css';
import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Input, input } from '@nextui-org/react';
import { EyeFilledIcon } from './EyeFilledIcon';
import { EyeSlashFilledIcon } from './EyeSlashFilledIcon';
import {login, signup} from '../../app/authentication/actions'

export default function Authentication() {

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

  const loginUser = async (email: string, password: string) => {

    //sign into QBee server
    //call the sign-in API endpoint
    setLoading(true);
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management/gen-session-key`, {
      credentials: "include",
      method: "PUT",
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: email, password: password})
      })
  
    let responseData = await response.json();
    login(email, password);
  };

  const signUpUser = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);
    signup(firstName, lastName, email, password);
  };

  return (
    <>
      <Card className="text-black">
        <CardBody>
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

                <Button
                  isLoading={loading}
                  onClick={() => loginUser(loginEmail, loginPassword)}
                  variant="bordered"
                  isDisabled={isLoginEmailInvalid || isLoginPasswordInvalid}
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
                  <a id="cancelBTN2">Cancel</a>
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
                  <a id="cancelBTN" href="">
                    Cancel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
