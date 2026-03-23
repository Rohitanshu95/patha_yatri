import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-white text-[#111111] pt-28 pb-12 border-t border-neutral-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1/4 h-[400px] bg-[#b49a78]/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 cursor-pointer">
              <img 
                src="/assets/logo.png" 
                alt="Luxe Logo" 
                className="h-14 w-auto object-contain mix-blend-multiply" 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
              />
              <span className="hidden text-2xl font-serif font-bold text-[#111111] uppercase tracking-widest">Luxe</span>
            </div>
            
            <div className="flex items-center gap-5 mt-2">
              <img 
                src="/assets/state.png" 
                alt="Odisha Tourism" 
                className="h-12 w-auto object-contain" 
              />
              <img 
                src="/assets/otdc.png" 
                alt="OTDC" 
                className="h-12 w-auto object-contain" 
              />
            </div>
          </div>
          <p className="text-[#737373] text-sm leading-relaxed max-w-xs font-sans">
            We always make our customers happy by providing as many choices as possible.
          </p>
          <div className="flex gap-4 text-[#a3a3a3]">
            <a href="#" className="hover:text-[#b49a78] transition-colors bg-neutral-50 p-2.5 rounded-full border border-neutral-100">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="hover:text-[#b49a78] transition-colors bg-neutral-50 p-2.5 rounded-full border border-neutral-100">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="#" className="hover:text-[#b49a78] transition-colors bg-neutral-50 p-2.5 rounded-full border border-neutral-100">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4 font-sans">
          <h4 className="font-serif text-[#111111] text-xl mb-3 tracking-tight">About</h4>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">About Us</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Features</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">News</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Menu</a>
        </div>

        <div className="flex flex-col gap-4 font-sans">
          <h4 className="font-serif text-[#111111] text-xl mb-3 tracking-tight">Company</h4>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Why Horizone</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Partner with Us</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">FAQ</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Blog</a>
        </div>

        <div className="flex flex-col gap-4 font-sans">
          <h4 className="font-serif text-[#111111] text-xl mb-3 tracking-tight">Support</h4>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Account</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Support Center</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Feedback</a>
          <a href="#" className="text-[#a3a3a3] hover:text-[#b49a78] transition-colors text-xs tracking-widest uppercase font-bold">Contact Us</a>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 mt-20 pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center text-[#94a3b8] text-xs uppercase tracking-widest font-bold font-sans"
      >
        <p>&copy; {new Date().getFullYear()} Odisha Tourism Development Corporation. All rights reserved.</p>
        <div className="flex gap-10 mt-6 md:mt-0">
          <a href="#" className="hover:text-[#b49a78] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#b49a78] transition-colors">Terms of Service</a>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
