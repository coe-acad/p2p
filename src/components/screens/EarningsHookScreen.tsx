 import { useEffect, useState } from "react";
 import { motion } from "framer-motion";
 import { Sparkles, IndianRupee, Sun, ArrowRight } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { getOrCreateEarningsSuggestion } from "@/utils/earningsSuggestion";
 
 interface EarningsHookScreenProps {
   onContinue: () => void;
   embedded?: boolean;
 }
 
 const EarningsHookScreen = ({ onContinue, embedded = false }: EarningsHookScreenProps) => {
   const [showContent, setShowContent] = useState(false);
   
  const vcRaw = localStorage.getItem("samai_vc_data");
  let vcData: Record<string, unknown> | undefined;
  if (vcRaw) {
    try {
      vcData = JSON.parse(vcRaw);
    } catch {
      vcData = undefined;
    }
  }
  const suggestion = getOrCreateEarningsSuggestion(vcData);
  const solarCapacityKW = suggestion.capacityKw;
  const minEarnings = suggestion.minEarnings;
  const maxEarnings = suggestion.maxEarnings;
   
   useEffect(() => {
     // Slight delay before showing content for dramatic effect
     const timer = setTimeout(() => setShowContent(true), 500);
     return () => clearTimeout(timer);
   }, []);
 
   const containerClass = embedded
     ? "w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-6 overflow-hidden"
     : "fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center p-6 overflow-hidden";

   return (
     <div className={containerClass}>
       {/* Decorative background elements */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-300/30 to-orange-300/30 rounded-full blur-3xl" />
         <div className="absolute bottom-32 right-10 w-40 h-40 bg-gradient-to-br from-yellow-300/30 to-amber-300/30 rounded-full blur-3xl" />
         <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-orange-200/40 to-yellow-200/40 rounded-full blur-2xl" />
       </div>
       
       <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
         transition={{ duration: 0.8, ease: "easeOut" }}
         className="relative z-10 text-center max-w-sm mx-auto"
       >
         {/* Icon */}
         <motion.div
           initial={{ y: -20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.3, duration: 0.6 }}
           className="mb-8"
         >
           <div className="relative inline-flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-50 scale-150" />
             <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-full shadow-xl">
               <Sun className="w-10 h-10 text-white" />
             </div>
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute -inset-4"
             >
               <Sparkles className="absolute top-0 right-0 w-5 h-5 text-amber-500" />
               <Sparkles className="absolute bottom-0 left-0 w-4 h-4 text-orange-400" />
             </motion.div>
           </div>
         </motion.div>
         
         {/* Main earnings display */}
         <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.5, duration: 0.6 }}
           className="mb-6"
         >
           <p className="text-muted-foreground text-sm mb-3 font-medium">
             Based on your {solarCapacityKW} kW solar system
           </p>
           <div className="flex items-baseline justify-center gap-1 mb-2">
             <IndianRupee className="w-8 h-8 text-amber-600" />
             <span className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
               {minEarnings}–{maxEarnings}
             </span>
           </div>
           <p className="text-lg text-muted-foreground">
             per day
           </p>
         </motion.div>
         
         {/* English tagline */}
         <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.7, duration: 0.6 }}
           className="mb-4"
         >
           <p className="text-xl font-semibold text-foreground leading-relaxed">
             You will earn{" "}
             <span className="text-amber-600 font-bold">₹{minEarnings}–₹{maxEarnings}</span>{" "}
             everyday without any change to your daily habits.
           </p>
         </motion.div>
         
         {/* Hindi translation */}
         <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.9, duration: 0.6 }}
           className="mb-10"
         >
           <p className="text-lg text-muted-foreground leading-relaxed">
             आप रोज़{" "}
             <span className="text-amber-600 font-semibold">₹{minEarnings}–₹{maxEarnings}</span>{" "}
             कमाएंगे, बिना अपनी दिनचर्या बदले।
           </p>
         </motion.div>
         
         {/* CTA Button */}
         <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 1.1, duration: 0.6 }}
         >
           <Button
             onClick={onContinue}
             size="lg"
             className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 px-8 py-6 text-lg rounded-2xl"
           >
             See tomorrow's plan
             <ArrowRight className="ml-2 w-5 h-5" />
           </Button>
         </motion.div>
       </motion.div>
       
       {/* Bottom note */}
       <motion.p
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1.5, duration: 0.6 }}
         className="absolute bottom-8 text-xs text-muted-foreground/60 text-center px-6"
       >
         Estimated based on average market rates and your solar capacity
       </motion.p>
     </div>
   );
 };
 
 export default EarningsHookScreen;
