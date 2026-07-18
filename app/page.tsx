"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ThumbsDown, Users, Coffee } from "lucide-react";
import { useEffect } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import Link from "next/link";
import Head from "next/head";

export default function Home() {

  useEffect(() => {
    const vantaEffect = NET({
      el: "#vanta-bg",
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0xffffff,
      backgroundColor: 0x0,
      points: 20.0,
      maxDistance: 12.0,
    });
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <div
      id="vanta-bg"
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
    >
      <Head>
        <title>Fail U Forward : share setbacks, learn, and connect</title>
        <meta
          name="description"
          content="Fail U Forward helps you share failures, learn from them, and connect with a supportive community."
        />
        <meta property="og:title" content="Fail U Forward : share setbacks, learn, and connect" />
        <meta property="og:description" content="Share failures, learn from setbacks, and connect with others." />
        <meta property="og:image" content="https://fail-u-forward.vercel.app/og-image.png" />
        <meta property="og:url" content="https://failuforward.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>

      {/* MAIN SECTION */}
      <main className="container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 flex flex-col min-h-screen relative z-10">
        {/* Hero content */}
        <div className="flex-grow mt-16 sm:mt-20">
          <div className="text-center space-y-6 px-2">
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-white">
              Welcome To FailUForward
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5, type: "tween" }}
            className="text-center space-y-6"
          >
            <br />
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              fail. learn. connect.
            </p>
          </motion.div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 sm:mt-8 px-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 2 } }}
            >
              <Link href="/feed">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-black text-white border-black font-bold hover:bg-gray-800 hover:border-gray-800 text-xs sm:text-s"
                >
                  explore
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 2 } }}
            >
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-black border-gray-300 font-bold hover:bg-gray-50 hover:border-gray-400 text-xs sm:text-s"
                >
                  about
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-10 lg:mt-10"
        >
          {[
            {
              icon: <ThumbsDown className="h-12 w-12 text-black" />,
              title: "professional setbacks",
              desc: "share your rejected applications and celebrate career mishaps",
            },
            {
              icon: <Users className="h-12 w-12 text-black" />,
              title: "network",
              desc: "connect with others",
            },
            {
              icon: <Coffee className="h-12 w-12 text-black" />,
              title: "daily disappointments",
              desc: "share your daily struggles and workplace disasters",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl shadow-lg border bg-gradient-to-bl from-slate-300 via-slate-400 to-slate-500 flex flex-col items-center text-center hover:scale-105 transition-transform hover:shadow-indigo-400/40 hover:border-indigo-400"
            >
              <div className="mb-4">{card.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">
                  {card.title}
                </h3>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
