// "use client"
import "../../app/globals.css"
import "./Authentication.css"
import React, { useState, useEffect } from "react";
import {Button, Spacer, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, Input} from "@nextui-org/react";

export default function Authentication(){

    // const {isOpen, onOpen, onOpenChange} = useDisclosure();
    useEffect(() => {
        const container = document.getElementById('authenticationContainer');
        const overlayBtn = document.getElementById('overlayBtn');

        if(container != null && overlayBtn != null)
            overlayBtn.addEventListener('click', ()=>{
                container.classList.toggle('right-panel-active');
            });
     
        // Cleanup function
        return () => {
            const container = document.getElementById('authenticationContainer');
            const overlayBtn = document.getElementById('overlayBtn');
            if(container!= null && overlayBtn != null)
            overlayBtn.removeEventListener('click', ()=>{
                container.classList.toggle('right-panel-active');
            });
        };
    }, []); 

    // Sign in
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signInEmailHasBeenFocused, setSignInEmailHasBeenFocused] = useState(false);
    const [usernameHasBeenFocused, setUsernameHasBeenFocused] = useState(false);
    const [passwordBeenFocused, setPasswordHasBeenFocused] = useState(false);

    const validateEmail = (value:any) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isEmailInvalid = React.useMemo(() => {
      if (email === "") return true;
  
      return validateEmail(email) ? false : true;
    }, [email]);

    const isPasswordInvalid = React.useMemo(() => {
        if (password === "") return true;
    
        return false;
    }, [password]);

    // Sign Up

    return (

        <>
            <Card className="text-black"><CardBody><div className="authenticationContainer" id="authenticationContainer">
                <div className="form-container sign-up-container">
                    <div className="form">
                        <h1>Create Account</h1>
                        <span>Use your email for registration</span><br/>
                        <span id="wrongInput"></span>
                        <div className="infield">
                            <input id="signUpFName" type="text" placeholder="First Name" name="FirstName"/>
                            <label></label>
                        </div>
                        <div className="infield">
                            <input id="signUpLName" type="text" placeholder="Surname" name="LastName"/>
                            <label></label>
                        </div>
                        <div className="infield">
                            <span>Date of Birth</span>
                            <input id="signUpDOB" type="date" value="2000-01-01" name="DOB"/>
                            <label></label>
                        </div>
                        <div className="infield">
                            <input id="signUpEmail" type="email" placeholder="Email" name="Email"/>
                            <label></label>
                        </div>
                        <div className="infield">
                            <input id="signUpCountry" type="text" placeholder="Country" name="Country" list="Countries"/>
                                <datalist id="Countries">
                                </datalist>
                            <label></label>
                        </div>
                        <div className="infield">
                            <input id="signUpCritic" type="text" placeholder="Critic authentication code" name="critic"/>
                            <label></label>
                        </div>
                        
                        <div className="infield">
                            <input id="signUpPassword" type="password" placeholder="Password" name="Password" />
                            <label></label>
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
                                onValueChange={setEmail}
                                onFocus={() => {setPasswordHasBeenFocused(false); setSignInEmailHasBeenFocused(true);}}
                                isInvalid={isEmailInvalid && signInEmailHasBeenFocused}
                                color={!signInEmailHasBeenFocused ? "primary" : (isEmailInvalid && signInEmailHasBeenFocused) ? "danger" : "success"}
                                errorMessage="Please enter a valid email/username"
                            />
                        </div>
                        <div className="infield">
                            <Input
                                isRequired
                                label="Password"
                                type="password"
                                variant="Border"
                                onValueChange={setPassword}
                                onFocus={() => {setPasswordHasBeenFocused(true); setSignInEmailHasBeenFocused(false);}}
                                isInvalid={isPasswordInvalid && passwordBeenFocused}
                                color={!passwordBeenFocused ? "primary" : isPasswordInvalid ? "danger" : "success"}
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
                            <button>Sign In</button>
                            <a  id="cancelBTN2" href="#">Cancel</a>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start the journey with us</p>
                            <button>Sign Up</button>
                            <a id='cancelBTN' href="#">Cancel</a>
                        </div>
                        
                    </div>
                    <button id="overlayBtn"></button>
                </div>
            </div></CardBody></Card>
        </>
    )

}