"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, LogOut, Settings, HelpCircle, Plus, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";
import { motion } from "framer-motion";
import { MdLogin } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth(firebaseApp);
      await signOut(auth);
      setIsMenuOpen(false); // Close mobile menu on logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (pathname === "/") {
    return null;
  }

  const navLinkClasses = "flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition";
  const dropdownItemClasses = "cursor-pointer hover:bg-zinc-700";

  return (
    <nav className="relative w-full backdrop-blur-sm bg-black/20 border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 via-black/40 to-gray-900/30"></div>
      
      <div className="relative container mx-auto px-4 flex h-16 justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 p-2 rounded-lg border border-white/20">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="font-bold text-2xl text-white group-hover:text-gray-200 transition-colors duration-300 leading none">
                Fail U Forward
              </span>
            </Link>
          </motion.div>
        </div>
        {/* Right side controls (Desktop) */}
        <div className="hidden md:flex items-center gap-3 justify-center w-full bg-transparent">
          {loggedIn ? (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" title="Menu"><Home className="h-[1.2rem] w-[1.2rem] stroke-white" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 text-white">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel><DropdownMenuSeparator />
                  <Link href="/feed"><DropdownMenuItem className={dropdownItemClasses}><Home className="mr-2 h-4 w-4" /><span>Feed</span></DropdownMenuItem></Link>
                  <Link href="/network"><DropdownMenuItem className={dropdownItemClasses}><Briefcase className="mr-2 h-4 w-4" /><span>Network</span></DropdownMenuItem></Link>
                  <Link href="/create-post"><DropdownMenuItem className={dropdownItemClasses}><Plus className="mr-2 h-4 w-4" /><span>Create Post</span></DropdownMenuItem></Link>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" title="User"><User className="h-[1.2rem] w-[1.2rem] stroke-white" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 text-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator />
                  <Link href="/profile"><DropdownMenuItem className={dropdownItemClasses}><User className="mr-2 h-4 w-4" /><span>Profile</span></DropdownMenuItem></Link>
                  <Link href="/settings"><DropdownMenuItem className={dropdownItemClasses}><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem></Link>
                  <Link href="/help"><DropdownMenuItem className={dropdownItemClasses}><HelpCircle className="mr-2 h-4 w-4" /><span>Help</span></DropdownMenuItem></Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className={dropdownItemClasses} onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}><Link href="/login"><Button size="sm" title="Login" className="relative overflow-hidden bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group"><MdLogin className="mr-2 relative z-10" /><span className="relative z-10 font-semibold">Login</span></Button></Link></motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}><Link href="/register"><Button size="sm" className="relative overflow-hidden bg-white/15 hover:bg-white/25 text-white border border-white/30 hover:border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 group"><span className="relative z-10 font-semibold">Sign Up</span></Button></Link></motion.div>
            </div>
          )}
        </div>

        {/* Right side controls (Mobile) */}
        <div className="md:hidden flex items-center space-x-2">
          {loggedIn ? (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMenuOpen(true)} className="p-2 text-white">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" /></svg>
            </motion.button>
          ) : (
            <Link href="/login" className="ml-2"><Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Login</Button></Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden" onClick={() => setIsMenuOpen(false)} />}
      <div className={`fixed top-0 left-0 z-50 w-[80vw] max-w-xs h-screen backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 text-black dark:text-white border-r border-white/20 dark:border-gray-700/50 transform transition-transform duration-500 ease-in-out shadow-2xl ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}>
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-xl font-bold tracking-wide text-gray-800 dark:text-white">Fail U Forward</h2>
          <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={24} /></button>
        </div>
        <div className="text-sm font-semibold text-gray-500 uppercase px-6 pt-6">Discover</div>
        <ul className="flex flex-col gap-3 px-6 py-4 text-base font-medium text-gray-800 dark:text-white">
          <li><Link href="/feed" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}><Home size={20} />Home</Link></li>
          <li><Link href="/network" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}><Briefcase size={20} />Network</Link></li>
          {loggedIn ? (
            <>
              <li><Link href="/profile" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}><User size={20} />Profile</Link></li>
              <li><button onClick={handleLogout} className={`w-full text-left ${navLinkClasses}`}><LogOut size={20} />Logout</button></li>
            </>
          ) : (
            <>
              <li><Link href="/login" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Login</Link></li>
              <li><Link href="/register" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
