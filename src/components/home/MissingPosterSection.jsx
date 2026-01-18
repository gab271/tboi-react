import React from 'react';
import { MissingPoster } from './MissingPoster';
import { Fly, DoodleArrow, FloorItem } from './Decorations';

export const MissingPosterSection = () => {
  return (
    <section className="relative w-full flex justify-center py-24 bg-transparent overflow-hidden">
        {/* Decorations Wrapper (Absolute positioning within this section) */}
        
        {/* Left Side Clutter */}
        <Fly className="top-10 left-[10%] w-12 h-12" delay={0} />
        <Fly className="bottom-20 left-[15%] w-8 h-8 opacity-60" delay={1.5} />
        <FloorItem type="rock" className="bottom-10 left-[5%] transform rotate-12 scale-110" />

        {/* Right Side Clutter */}
        <Fly className="top-20 right-[15%] w-10 h-10" delay={0.5} />
        <FloorItem type="penny" className="top-40 right-[10%] transform -rotate-12" />

        {/* The Poster Itself */}
        <div className="relative z-10">
            <MissingPoster />
            
            {/* Arrow pointing to the Poster's Button Area (Approximation) */}
            <DoodleArrow 
                className="absolute -bottom-8 -right-12 md:-right-20 rotate-[-10deg] scale-125 hidden md:flex" 
                text="ESCAPE NOW!" 
            />
             <DoodleArrow 
                className="absolute top-10 -left-16 rotate-[45deg] scale-90 hidden md:flex opacity-60" 
                text="MISSING?" 
            />
        </div>

        {/* Background Subtle stains or details specific to this section */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-black opacity-[0.03] rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply"></div>

    </section>
  )
}
