"use client";
import "../../app/globals.css";
import "./LandingPage.css";
import { Button } from "@nextui-org/react";
import React, { useEffect, useRef } from 'react';
import {LogoIcon} from "../../images/Logo";
import Link from "next/link";
import Authentication from '@/components/Authentication/Authentication';

interface ConsoleTextProps {
    words: string[];
    colors?: string[];
}

const ConsoleText = ({ words, colors = ['#fff'] }: ConsoleTextProps) => {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const conRef = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
      if (targetRef.current && conRef.current)
      {
    
        let letterCount = 1;
        let x = 1;
        let waiting = false;
        let visible = true;
        const totalWords = [...words];
        const totalColors = [...colors];
        targetRef.current.setAttribute('data-testid', 'test-console-change');
    
        const intervalId = window.setInterval(() => {
            if ((letterCount === 0) && !waiting) {
            waiting = true;
            if (targetRef.current){
                targetRef.current.innerHTML = totalWords[0].substring(0, letterCount);

                
                window.setTimeout(() => {
                    const usedColor = totalColors.shift();
                    if (usedColor) totalColors.push(usedColor);
                    
                    const usedWord = totalWords.shift();
                    if (usedWord) totalWords.push(usedWord);
                    
                    x = 1;
                    if (targetRef.current){
                        targetRef.current.setAttribute('style', 'color:' + totalColors[0]);
                        letterCount += x;
                        waiting = false;
                    } 
                }, 150);
            }
            } else if (letterCount === totalWords[0].length + 1 && !waiting) {
            waiting = true;
    
            window.setTimeout(() => {
                x = -1;
                letterCount += x;
                waiting = false;
            }, 50);
            } else if (!waiting) {
                if (targetRef.current){
                    targetRef.current.innerHTML = totalWords[0].substring(0, letterCount);
                    letterCount += x;
                }
            }
        }, 100);
    
        const underscoreIntervalId = window.setInterval(() => {
            if (visible) {
                if (conRef.current){
                    conRef.current.className = 'console-underscore hidden';
                    visible = false;
                }
            } else {
                if (conRef.current){
                    conRef.current.className = 'console-underscore';
                    visible = true;
                }
            }
        }, 100);
    
        return () => {
            window.clearInterval(intervalId);
            window.clearInterval(underscoreIntervalId);
        }
      }
    }, [words, colors]);
  
    return (
      <div>
        <div ref={targetRef} style={{ color: colors[0] }}></div>
        <div ref={conRef} className="console-underscore"></div>
      </div>
    );
};

// import Authentication from "../Authentication/Authentication";

export default function StartPage() {
    return (
        <div className="flex flex-col md:flex-row w-full h-screen m-0 p-0">
           <div className="absolute top-0 left-0 m-10 z-30 font-console font-bold text-lg text-default-cl sm:text-logo">QBee</div>
           <div className="justify-center sm:basis-2/5 md:basis-3/5 hidden sm:flex sm:flex-col h-screen m-0 p-0 bg-cover bg-center bg-start-page">
                <div data-testid="console-text" className="flex flex-row justify-center lg:justify-start m-20 mr-25 z-10 font-console font-black text-xl md:text-5xl lg:text-6xl">
                    <ConsoleText 
                        words={["Welcome to QBee!", "Unlock the full potential of your data with QBee today!","Don't waste time typing boring old queries!", "Simply ask, and QBee delivers!" ]} 
                        colors={['lightblue','lightblue','lightblue']} 
                        
                    />
                </div>
           </div>
           <div className="sm:basis-3/5 md:basis-2/5 flex flex-col h-screen justify-center place-content-center bg-white z-20">
                <div className="basis-5/6 flex flex-col p-20 md:p-10 lg:p-10 justify-center">
                    <div className="logoContainer flex flex-row justify-center mb-10">
                        <LogoIcon/>
                    </div>
                    <span className="text-center font-console font-medium mb-4 text-2xl">Welcome to QBee</span>
                    <div className="flex flex-col md:flex-row justify-center">
                        <Authentication/>
                    </div>
                </div>
                <div className="basis-1/6">
                    <div className="flex flex-col justify-end">
                        <div className="flex flex-col text-center justify-center text-policy-link">
                            <span className="">QBee</span>
                            <span className=""><Link className="hover:underline hover:text-default-cl" href="/cookies">Cookie Policy</Link> | <Link className="hover:underline hover:text-default-cl" href="/privacy">Privacy Policy</Link></span>
                        </div>
                    </div>
                </div>
           </div>
        </div>
    );
}