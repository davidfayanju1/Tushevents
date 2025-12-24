"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Check,
  Sparkles,
  MessageCircle,
  Leaf,
  Flower,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import Confetti from "react-confetti";

const SaveSeat = () => {
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    representing: "bride",
    extra: "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [ivCode, setIvCode] = useState(null);

  const router = useRouter();

  // Emerald Green & Gold Color Scheme
  const colors = {
    primaryGreen: "#0D7A5F", // Deep emerald
    secondaryGreen: "#1A9D7A", // Lighter emerald
    accentGold: "#E5C07B", // Warm gold
    darkBg: "#0A1A14", // Deep green-based dark
    lightGreen: "#2DD4A3", // Mint accent
    darkGreen: "#052F1C", // Very dark green
  };

  const images: string[] = [
    "/images/COUPLE1.jpg",
    "/images/COUPLE2.jpg",
    "/images/COUPLE3.jpg",
  ];

  useEffect(() => {
    // Set window dimensions
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev: number) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log(formData, "Sent Payload");

    try {
      const response = await api.post(`guests`, formData);

      // Show success modal instead of toast
      setShowSuccessModal(true);
      setConfetti(true);

      console.log(response?.data?.data?.invitationCode, "Submit Response");

      // Reset form after successful submission
      if (response?.data) {
        setIvCode(response?.data?.data?.invitationCode);
      }

      setFormData({
        name: "",
        phone: "",
        representing: "bride",
        extra: "0",
      });

      // Stop confetti after 5 seconds
      setTimeout(() => setConfetti(false), 5000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message ?? "Failed to save your seat"
          : "Failed to save your seat";

      console.error(err, "Submit Error");
      toast.error("Failed to save your seat", {
        description: message || "Please try again later.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseSuccessModal = () => {
    console.log(ivCode, "IV code");
    setShowSuccessModal(false);
    setConfetti(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  };

  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Green-themed confetti colors
  const confettiColors = [
    colors.primaryGreen,
    colors.secondaryGreen,
    colors.accentGold,
    colors.lightGreen,
    "#FFD700",
    "#4ECDC4",
    "#A3D9B1",
    "#7CFC00",
  ];

  return (
    <>
      <motion.div
        className="min-h-screen flex items-center relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          background: `linear-gradient(135deg, ${colors.darkGreen}, ${colors.darkBg})`,
        }}
      >
        {/* Green & Gold Confetti */}
        {confetti && (
          <>
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              numberOfPieces={150}
              recycle={false}
              gravity={0.15}
              colors={confettiColors}
              style={{ position: "fixed", zIndex: 60 }}
              confettiSource={{
                x: windowDimensions.width / 2,
                y: windowDimensions.height / 2,
                w: 0,
                h: 0,
              }}
            />
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              numberOfPieces={100}
              recycle={false}
              gravity={0.3}
              initialVelocityX={15}
              initialVelocityY={30}
              colors={confettiColors}
              style={{ position: "fixed", zIndex: 60 }}
            />
          </>
        )}

        {/* Background decorative elements with green theme */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.primaryGreen}20` }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.accentGold}10` }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: `${colors.secondaryGreen}15` }}
          ></div>

          {/* Subtle leaf/floral patterns */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-20 left-20">
              <Leaf
                className="w-24 h-24"
                style={{ color: colors.lightGreen }}
              />
            </div>
            <div className="absolute bottom-20 right-20">
              <Flower
                className="w-32 h-32"
                style={{ color: colors.lightGreen }}
              />
            </div>
          </div>
        </div>

        {/* Back button with green theme */}
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-8 z-30 flex items-center gap-2 px-4 py-2 transition-colors duration-300 hover:bg-white/5 rounded-full"
          style={{ color: colors.accentGold }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Main content container */}
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Side - Save a Seat Form */}
            <motion.div
              className="relative z-20 space-y-8"
              variants={textVariants}
            >
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl font-light text-white mb-4">
                  Save Your Seat
                </h1>
                <p className="text-lg" style={{ color: colors.accentGold }}>
                  Join us in celebrating our special day
                </p>
              </div>

              <motion.div
                className="backdrop-blur-sm border rounded-2xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                style={{
                  backgroundColor: `${colors.primaryGreen}10`,
                  borderColor: `${colors.accentGold}20`,
                }}
              >
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                      placeholder="Enter your full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Phone Number Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      Whatsapp Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                      placeholder="Enter your phone number"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Representing Select */}
                  <div className="space-y-2">
                    <label
                      htmlFor="representing"
                      className="block text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      Representing
                    </label>
                    <select
                      id="representing"
                      name="representing"
                      value={formData.representing}
                      onChange={handleInputChange}
                      className="appearance-none w-full px-4 py-3 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                      disabled={isSubmitting}
                    >
                      <option value="bride" className="bg-[#0A1A14]">
                        Bride&apos;s Side
                      </option>
                      <option value="groom" className="bg-[#0A1A14]">
                        Groom&apos;s Side
                      </option>
                      <option value="both" className="bg-[#0A1A14]">
                        Both Sides
                      </option>
                      <option value="friend" className="bg-[#0A1A14]">
                        Family Friend
                      </option>
                    </select>
                  </div>

                  {/* Coming With Partner Select */}
                  <div className="space-y-2">
                    <label
                      htmlFor="extra"
                      className="block text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      Coming With Partner
                    </label>
                    <select
                      id="extra"
                      name="extra"
                      value={formData.extra}
                      onChange={handleInputChange}
                      className="appearance-none w-full px-4 py-3 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                      disabled={isSubmitting}
                    >
                      <option value="1" className="bg-[#0A1A14]">
                        Yes
                      </option>
                      <option value="0" className="bg-[#0A1A14]">
                        No
                      </option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isSubmitting
                        ? `${colors.primaryGreen}50`
                        : colors.primaryGreen,
                      color: "#0A1A14",
                    }}
                    whileHover={{
                      scale: isSubmitting ? 1 : 1.02,
                    }}
                    whileTap={{
                      scale: isSubmitting ? 1 : 0.98,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                          style={{ borderColor: colors.darkGreen }}
                        />
                        Saving Your Seat...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Confirm My Seat
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>

            {/* Right Side - Image Gallery */}
            <motion.div
              className="relative md:block hidden h-[500px] lg:h-[600px] overflow-hidden rounded-2xl"
              variants={imageVariants}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src={images[currentImage]}
                    alt="Wedding celebration"
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Green gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${colors.darkGreen}20, ${colors.darkGreen}10)`,
                    }}
                  ></div>
                </motion.div>
              </AnimatePresence>

              {/* Decorative frame with green border */}
              <div
                className="absolute inset-4 border rounded-xl pointer-events-none"
                style={{ borderColor: `${colors.secondaryGreen}30` }}
              ></div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Success Modal with Green Theme */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: `${colors.darkGreen}90` }}
          >
            {/* Modal Container */}
            <div className="flex items-center justify-center min-h-screen w-full py-8">
              <motion.div
                className="relative w-full max-w-2xl mx-auto my-8"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Modal Content */}
                <div
                  className="rounded-2xl border-2 shadow-2xl overflow-hidden relative"
                  style={{
                    backgroundColor: colors.darkBg,
                    borderColor: `${colors.accentGold}40`,
                  }}
                >
                  {/* Animated background elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div
                      className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-xl"
                      style={{ backgroundColor: `${colors.accentGold}10` }}
                    ></div>
                    <div
                      className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-xl"
                      style={{ backgroundColor: `${colors.primaryGreen}10` }}
                    ></div>
                  </div>

                  {/* Enhanced Floating sparkles with green tones */}
                  <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            i % 3 === 0 ? colors.accentGold : colors.lightGreen,
                        }}
                        initial={{
                          opacity: 0,
                          scale: 0,
                          x: Math.random() * 600 - 300,
                          y: Math.random() * 600 - 300,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.2,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                    ))}
                  </div>

                  {/* Modal Header */}
                  <div
                    className="relative p-8 text-center border-b"
                    style={{ borderColor: `${colors.primaryGreen}20` }}
                  >
                    {/* Enhanced Success Icon with ping animation */}
                    <div className="relative inline-block mb-6">
                      <div
                        className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: colors.accentGold }}
                      ></div>
                      <motion.div
                        className="relative rounded-full p-6 shadow-2xl transform transition-all duration-300 hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accentGold}, #FFD700)`,
                        }}
                        initial={{
                          scale: 0,
                          rotate: -180,
                        }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.2,
                        }}
                      >
                        <Check
                          className="w-16 h-16"
                          style={{ color: colors.darkGreen }}
                        />
                      </motion.div>
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{
                          scale: 0,
                          rotate: -180,
                        }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                        }}
                        transition={{ delay: 0.4 }}
                      >
                        <Heart
                          className="h-8 w-8"
                          style={{ color: colors.secondaryGreen }}
                        />
                      </motion.div>
                    </div>

                    <motion.h2
                      className="text-4xl font-bold mb-4"
                      style={{
                        background: `linear-gradient(to right, ${colors.accentGold}, ${colors.lightGreen})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Seat Confirmed!
                    </motion.h2>

                    <motion.p
                      className="text-xl font-semibold"
                      style={{ color: colors.accentGold }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      We&apos;re excited to have you! 🎉
                    </motion.p>
                  </div>

                  {/* Modal Body */}
                  <div className="relative p-8">
                    <motion.div
                      className="text-center space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p
                        className="text-lg"
                        style={{ color: `${colors.lightGreen}90` }}
                      >
                        Thank you for confirming your attendance,{" "}
                        <span
                          className="font-bold text-xl"
                          style={{ color: colors.accentGold }}
                        >
                          {formData.name}
                        </span>
                        !
                      </p>

                      {/* WhatsApp Notification Card */}
                      <div
                        className="rounded-2xl p-6 border"
                        style={{
                          backgroundColor: `${colors.primaryGreen}20`,
                          borderColor: `${colors.secondaryGreen}30`,
                        }}
                      >
                        <div className="flex items-center justify-center mb-4">
                          <MessageCircle
                            className="w-12 h-12"
                            style={{ color: colors.secondaryGreen }}
                          />
                        </div>
                        <h3
                          className="text-xl font-semibold mb-3"
                          style={{ color: colors.accentGold }}
                        >
                          Important Information
                        </h3>
                        <p
                          className="text-center"
                          style={{ color: `${colors.lightGreen}90` }}
                        >
                          You will receive all event details, including venue
                          information, timing, and access instructions via
                          WhatsApp <strong>10 days before the event</strong>.
                        </p>
                        <div
                          className="mt-4 p-4 rounded-lg border"
                          style={{
                            backgroundColor: `${colors.secondaryGreen}20`,
                            borderColor: `${colors.secondaryGreen}30`,
                          }}
                        >
                          <p
                            className="text-sm font-medium"
                            style={{ color: colors.lightGreen }}
                          >
                            📱 Keep an eye on your WhatsApp messages for
                            updates!
                          </p>
                        </div>
                      </div>

                      {/* Celebration Icons */}
                      <div className="flex justify-center gap-6 mt-6">
                        {["💚", "🌿", "💫", "✨", "🌱", "🥂"].map(
                          (icon, index) => (
                            <motion.span
                              key={index}
                              className="text-3xl"
                              initial={{
                                scale: 0,
                                rotate: -180,
                              }}
                              animate={{
                                scale: 1,
                                rotate: 0,
                              }}
                              whileHover={{
                                scale: 1.2,
                                rotate: 360,
                              }}
                              transition={{
                                delay: 0.8 + index * 0.1,
                                type: "spring",
                                stiffness: 200,
                              }}
                            >
                              {icon}
                            </motion.span>
                          )
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Modal Footer */}
                  <div
                    className="relative p-6 border-t"
                    style={{ borderColor: `${colors.primaryGreen}20` }}
                  >
                    <motion.button
                      onClick={handleCloseSuccessModal}
                      className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center justify-center gap-3 transform hover:scale-105"
                      style={{
                        background: `linear-gradient(to right, ${colors.primaryGreen}, ${colors.accentGold})`,
                        color: colors.darkGreen,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <Sparkles className="w-6 h-6" />
                      Continue Celebration
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SaveSeat;
