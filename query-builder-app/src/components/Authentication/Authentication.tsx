// "use client"
import "../../app/globals.css"
import "./Authentication.css"
import React, { useState, useEffect } from "react";
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, Input} from "@nextui-org/react";

export default function Authentication(){

    // const {isOpen, onOpen, onOpenChange} = useDisclosure();
    // useEffect(() => {
    //     const container = document.getElementById('authenticationContainer');
    //     const overlayBtn = document.getElementById('overlayBtn');

    //     if(container != null && overlayBtn != null)
    //         overlayBtn.addEventListener('click', ()=>{
    //             container.classList.toggle('right-panel-active');
    //         });
     
    //     // Cleanup function
    //     return () => {
    //         const container = document.getElementById('authenticationContainer');
    //         const overlayBtn = document.getElementById('overlayBtn');
    //         if(container!= null && overlayBtn != null)
    //         overlayBtn.removeEventListener('click', ()=>{
    //             container.classList.toggle('right-panel-active');
    //         });
    //     };
    // }, []); 

    const [view, setView] = useState('');

    const changeView = () => {
        if(view == ''){
            setView('right-panel-active');
        }
        else{
            setView('');
        }
    }


    // Sign in
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginEmailHasBeenFocused, setLoginEmailHasBeenFocused] = useState(false);
    const [loginPasswordBeenFocused, setLoginPasswordHasBeenFocused] = useState(false);

    const validateEmail = (value:any) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isLoginEmailInvalid = React.useMemo(() => {
      if (loginEmail === "") return true;
  
      return validateEmail(loginEmail) ? false : true;
    }, [loginEmail]);

    const isLoginPasswordInvalid = React.useMemo(() => {
        if (loginPassword === "") return true;
    
        return false;
    }, [loginPassword]);

    // Sign Up
    const [signUpFirstName, setSignUpFirstName] = useState('');
    const [signUpLastName, setSignUpLastName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpFirstNameHasBeenFocused, setSignUpFirstNameHasBeenFocused] = useState(false);
    const [signUpLastNameHasBeenFocused, setSignUpLastNameHasBeenFocused] = useState(false);
    const [signUpEmailHasBeenFocused, setSignUpEmailHasBeenFocused] = useState(false);
    const [signUpPasswordBeenFocused, setSignUpPasswordHasBeenFocused] = useState(false);

    const isSignUpEmailInvalid = React.useMemo(() => {
      if (signUpEmail === "") return true;
  
      return validateEmail(signUpEmail) ? false : true;
    }, [signUpEmail]);

    const isSignUpPasswordInvalid = React.useMemo(() => {
        if (signUpPassword === "") return true;
    
        return false;
    }, [signUpPassword]);

    const isSignUpFirstNameInvalid = React.useMemo(() => {
        if (signUpFirstName === "") return true;
    
        return false;
    }, [signUpFirstName]);

    const isSignUpLastNameInvalid = React.useMemo(() => {
        if (signUpLastName === "") return true;
    
        return false;
    }, [signUpLastName]);

    return (

        <>
            <Card className="text-black"><CardBody><div className={"authenticationContainer " + (view)} id="authenticationContainer">
                <div className="form-container sign-up-container">
                    <div className="form">
                        <h1>Create Account</h1>
                        <span>Use your email for registration</span><br/>
                        <div className="infield">
                            <Input
                                isRequired
                                label="First Name"
                                variant="Border"
                                onValueChange={setSignUpFirstName}
                                onFocus={() => {setSignUpPasswordHasBeenFocused(false); setSignUpEmailHasBeenFocused(false);setSignUpFirstNameHasBeenFocused(true);setSignUpLastNameHasBeenFocused(false);}}
                                isInvalid={isSignUpFirstNameInvalid && signUpFirstNameHasBeenFocused}
                                color={!signUpFirstNameHasBeenFocused ? "primary" : isSignUpFirstNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a username"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Last Name"
                                variant="Border"
                                onValueChange={setSignUpLastName}
                                onFocus={() => {setSignUpPasswordHasBeenFocused(false); setSignUpEmailHasBeenFocused(false);setSignUpFirstNameHasBeenFocused(false);setSignUpLastNameHasBeenFocused(true);}}
                                isInvalid={isSignUpLastNameInvalid && signUpLastNameHasBeenFocused}
                                color={!signUpLastNameHasBeenFocused ? "primary" : isSignUpLastNameInvalid ? "danger" : "success"}
                                errorMessage="Please enter a username"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Email"
                                variant="Border"
                                type="email"
                                onValueChange={setSignUpEmail}
                                onFocus={() => {setSignUpPasswordHasBeenFocused(false); setSignUpEmailHasBeenFocused(true);setSignUpFirstNameHasBeenFocused(false);setSignUpLastNameHasBeenFocused(false);}}
                                isInvalid={isSignUpEmailInvalid && signUpEmailHasBeenFocused}
                                color={!signUpEmailHasBeenFocused ? "primary" : (isSignUpEmailInvalid && signUpEmailHasBeenFocused) ? "danger" : "success"}
                                errorMessage="Please enter a valid email"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Password"
                                type="password"
                                variant="Border"
                                onValueChange={setSignUpPassword}
                                onFocus={() => {setSignUpPasswordHasBeenFocused(true); setSignUpEmailHasBeenFocused(false);setSignUpFirstNameHasBeenFocused(false);setSignUpLastNameHasBeenFocused(false);}}
                                isInvalid={isSignUpPasswordInvalid && signUpPasswordBeenFocused}
                                color={!signUpPasswordBeenFocused ? "primary" : isSignUpPasswordInvalid ? "danger" : "success"}
                                errorMessage="Please enter a password"
                            />
                        </div>
                        <button id="signUpBtn">Sign Up</button>
                        
                    </div>
                </div>
                <div className="form-container sign-in-container">
                    <div className="form">
                        <h1>Sign in</h1>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Email"
                                variant="Border"
                                type="email"
                                onValueChange={setLoginEmail}
                                onFocus={() => {setLoginPasswordHasBeenFocused(false); setLoginEmailHasBeenFocused(true);}}
                                isInvalid={isLoginEmailInvalid && loginEmailHasBeenFocused}
                                color={!loginEmailHasBeenFocused ? "primary" : (isLoginEmailInvalid && loginEmailHasBeenFocused) ? "danger" : "success"}
                                errorMessage="Please enter a valid email"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Password"
                                type="password"
                                variant="Border"
                                onValueChange={setLoginPassword}
                                onFocus={() => {setLoginPasswordHasBeenFocused(true); setLoginEmailHasBeenFocused(false);}}
                                isInvalid={isLoginPasswordInvalid && loginPasswordBeenFocused}
                                color={!loginPasswordBeenFocused ? "primary" : isLoginPasswordInvalid ? "danger" : "success"}
                                errorMessage="Please enter a password"
                            />
                        </div>
                        
                        <button id="signInBtn" type="submit" name="submit">Sign In</button>
                    </div>
                </div>
                <div className="overlay-container" id="overlayCon">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <Button 
                                color="primary" 
                                onClick={() => changeView()}
                                variant="bordered"
                            >
                                Log in
                            </Button>
                            <a  id="cancelBTN2" href="#">Cancel</a>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start the journey with us</p>
                            <Button 
                                color="primary" 
                                onClick={() => changeView()}
                                variant="bordered"
                            >
                                Create an account
                            </Button>
                            <a id='cancelBTN' href="#">Cancel</a>
                        </div>
                        
                    </div>
                </div>
            </div></CardBody></Card>
        </>
    )

}