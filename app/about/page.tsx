"use client";
import React, { useEffect, useRef } from "react";
import { Github } from "lucide-react";
import * as THREE from "three";
import { FaDiscord, FaLinkedin } from "react-icons/fa";
import NET from "vanta/dist/vanta.net.min";

const StoryPage = () => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = NET({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xffffff,
        backgroundColor: 0x000000,
        points: 20.0,
        maxDistance: 12.0,
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const devComments = [
    { comment: "Users can share their rejections, flops and failures from college rejections to startup shutdowns." },
    { comment: "Every post becomes a learning moment. Whether it's a resume that got ignored or a pitch that bombed, users can reflect, discuss and grow from real life experiences." },
    { comment: "The platform curates a custom feed based on your interests tech fails, career rejections, entrepreneurial setbacks so you’re always learning what not to do in your journey." },
    { comment: "A Raw & Real Community: It’s a judgment free zone where every rejection is a rite of passage." },
  ];

  return (
    <div ref={vantaRef} className="relative min-h-screen w-full text-primary overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-70 pointer-events-none z-10"></div>
      {/* Page Content */}
      <div className="relative z-20">
        <section className="py-16 px-4 sm:px-6 md:px-8 text-base">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-10 text-center text-white tracking-wide drop-shadow-lg">
            About Fail U Forward
          </h2>

          {[
            "The idea for Fail U Forward came from scrolling through LinkedIn where everyone’s success stories looked flawless but real growth happens through failure. I wanted to create a space that shows the messy, unfiltered side of the journey that LinkedIn rarely highlights.",
            "This platform is your no judgment zone to share your rejections, epic fails and the lessons you actually learned because failure is the ultimate teacher. Whether you flopped a project, bombed an interview or just had a bad day, Fail U Forward turns those moments into badges of honor.",
            "We’re here to normalize setbacks, build a community of real talk and remind everyone that every failure is just a stepping stone to something bigger. Because growth isn’t about never falling, it’s about getting up and sharing the story.",
          ].map((text, i) => (
            <p
              key={i}
              className="max-w-4xl mx-auto mb-5 md:mb-7 leading-7 sm:leading-8 text-base sm:text-lg text-gray-200 font-medium shadow-inner bg-white dark:bg-zinc-900 border border-gray-500 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-xl hover:bg-white/20"
            >
              {text}
            </p>
          ))}
        </section>
        {/* Features */}
        <section className="bg-black py-16 px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-10 text-center text-white tracking-wide drop-shadow-lg">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {devComments.map((dev, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center bg-white dark:bg-zinc-900 border border-gray-500 shadow-lg rounded-xl p-4 sm:p-6 transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-xl hover:bg-white/20"
              >
                <p className="text-gray-200 font-medium text-base sm:text-lg">{dev.comment}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Footer */}
        <div className="max-w-4xl mx-auto text-center w-full">
          <p className="text-base sm:text-lg sm:font-semibold mb-4 text-white font-bold">
            find more on
          </p>
          <div className="flex justify-center gap-4 sm:gap-6 text-xl sm:text-2xl mb-2">
            <a
              href="https://github.com/ruhilmansi/fail-u-forward"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-3 rounded-full bg-white hover:bg-gray-300 shadow transition duration-300 transform hover:-translate-y-1"
            >
              <Github size={24} className="text-black" />
            </a>
            {/* Add LinkedIn icon here */}
            <a
              href="https://www.linkedin.com/in/mansi-ruhil-7a00a0228/"  // Replace with the actual LinkedIn URL
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-3 rounded-full bg-white hover:bg-gray-300 shadow transition duration-300 transform hover:-translate-y-1"
            >
              <FaLinkedin size={24} className="text-black" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;