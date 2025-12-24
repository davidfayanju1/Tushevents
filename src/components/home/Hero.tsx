"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Gift,
  Calendar,
  Heart,
  X,
  Leaf,
  Sparkles,
  Copy,
  Check,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [isEventloomModalOpen, setIsEventloomModalOpen] =
    useState<boolean>(false);
  const [isGroomModalOpen, setIsGroomModalOpen] = useState<boolean>(false);
  const [isBrideModalOpen, setIsBrideModalOpen] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<"groom" | "bride" | null>(
    null
  );
  const router = useRouter();

  const images: string[] = [
    "/images/COUPLE1.jpg",
    "/images/COUPLE2.jpg",
    "/images/COUPLE3.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev: number) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleImageClick = (index: number): void => {
    setCurrentImage(index);
  };

  const handleEventloomClick = (): void => {
    setIsEventloomModalOpen(true);
  };

  const handleGroomGiftClick = (): void => {
    setIsGroomModalOpen(true);
  };

  const handleBrideGiftClick = (): void => {
    setIsBrideModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsEventloomModalOpen(false);
    setIsGroomModalOpen(false);
    setIsBrideModalOpen(false);
  };

  // Bank account details (you can update these with actual details)
  const groomAccountDetails = {
    bankName: "First Bank Nigeria",
    accountName: "Obunikem Groom",
    accountNumber: "3101234567",
  };

  const brideAccountDetails = {
    bankName: "Guaranty Trust Bank",
    accountName: "Obunikem Bride",
    accountNumber: "0123456789",
  };

  const copyToClipboard = async (
    text: string,
    accountType: "groom" | "bride"
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(accountType);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Color Scheme: Emerald Green (#0D7A5F) + Gold (#E5C07B)
  const colors = {
    primaryGreen: "#0D7A5F", // Deep emerald
    secondaryGreen: "#1A9D7A", // Lighter emerald
    accentGold: "#E5C07B", // Warm gold
    darkBg: "#0A1A14", // Deep green-based dark
    lightGreen: "#2DD4A3", // Mint accent
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
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Function to render account details modal
  const renderAccountModal = (
    isOpen: boolean,
    person: "Groom" | "Bride",
    accountDetails: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    },
    accountType: "groom" | "bride"
  ) => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleCloseModal}
            style={{ backgroundColor: `${colors.darkBg}80` }}
          />

          <motion.div
            className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              className="rounded-2xl p-8 shadow-2xl border"
              style={{
                backgroundColor: colors.darkBg,
                borderColor: `${colors.accentGold}20`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${colors.primaryGreen}20` }}
                  >
                    <Gift
                      className="w-6 h-6"
                      style={{ color: colors.accentGold }}
                    />
                  </div>
                  <h3 className="text-xl font-light text-white">
                    Gift the {person}
                  </h3>
                </div>
                <button
                  type="button"
                  title="cancel"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-200"
                  style={{ color: colors.lightGreen }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="text-center space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <User
                      className="w-16 h-16"
                      style={{ color: colors.accentGold }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <h4
                  className="text-2xl font-light"
                  style={{ color: colors.accentGold }}
                >
                  {person}&apos;s Account Details
                </h4>

                <div className="space-y-4">
                  {/* Bank Name */}
                  <div className="text-left">
                    <p className="text-sm text-white/60 mb-1">Bank Name</p>
                    <div
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}20`,
                      }}
                    >
                      <p className="text-white font-medium">
                        {accountDetails.bankName}
                      </p>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="text-left">
                    <p className="text-sm text-white/60 mb-1">Account Name</p>
                    <div
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}20`,
                      }}
                    >
                      <p className="text-white font-medium">
                        {accountDetails.accountName}
                      </p>
                    </div>
                  </div>

                  {/* Account Number with Copy Button */}
                  <div className="text-left">
                    <p className="text-sm text-white/60 mb-1">Account Number</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 p-3 rounded-lg border"
                        style={{
                          backgroundColor: `${colors.primaryGreen}10`,
                          borderColor: `${colors.accentGold}20`,
                        }}
                      >
                        <p className="text-white font-mono font-bold text-lg">
                          {accountDetails.accountNumber}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            accountDetails.accountNumber,
                            accountType
                          )
                        }
                        className="p-3 rounded-lg border transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: colors.primaryGreen,
                          borderColor: colors.primaryGreen,
                          color: "white",
                        }}
                      >
                        {copiedAccount === accountType ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {copiedAccount === accountType && (
                      <p className="text-green-400 text-sm mt-2 animate-pulse">
                        ✓ Account number copied to clipboard!
                      </p>
                    )}
                  </div>
                </div>

                <p
                  className="font-light leading-relaxed text-sm"
                  style={{ color: `${colors.lightGreen}90` }}
                >
                  Thank you for your generous gift! Please send your
                  contribution to the account details above.
                </p>
              </div>

              {/* Footer */}
              <div
                className="mt-8 pt-6"
                style={{ borderTopColor: `${colors.primaryGreen}20` }}
              >
                <button
                  onClick={handleCloseModal}
                  className="w-full py-3 rounded-full font-medium transition-all duration-300"
                  style={{
                    backgroundColor: colors.primaryGreen,
                    color: "white",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        className="min-h-screen relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ backgroundColor: colors.darkBg }}
      >
        {/* Background Image Slider for Mobile */}
        <div className="lg:hidden absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <img
                src={images[currentImage]}
                alt="Wedding celebration"
                className="w-full h-full object-cover"
              />
              {/* Deep green overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `${colors.darkBg}CC` }}
              ></div>
            </motion.div>
          </AnimatePresence>

          {/* Image indicators for mobile */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
            {images.map((_, index: number) => (
              <div
                key={index}
                onClick={() => handleImageClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImage
                    ? `bg-[${colors.accentGold}] scale-125`
                    : "bg-white/30 hover:bg-white/50"
                }`}
                style={
                  index === currentImage
                    ? { backgroundColor: colors.accentGold }
                    : {}
                }
              />
            ))}
          </div>
        </div>

        {/* Background decorative elements for desktop */}
        <div className="hidden lg:block absolute inset-0 overflow-hidden">
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

          {/* Subtle leaf pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20">
              <Leaf
                className="w-24 h-24"
                style={{ color: colors.lightGreen }}
              />
            </div>
            <div className="absolute bottom-20 right-20">
              <Leaf
                className="w-32 h-32"
                style={{ color: colors.lightGreen }}
              />
            </div>
          </div>
        </div>

        {/* Main content container */}
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen py-8 lg:py-0">
            {/* Text Content */}
            <motion.div
              className="relative z-20 space-y-8 text-center lg:text-left flex flex-col justify-center min-h-[80vh] lg:min-h-[80vh]"
              variants={textVariants}
            >
              {/* Eventloom Badge */}
              <motion.div
                className="inline-flex items-center cursor-pointer md:w-[30%] gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                onClick={handleEventloomClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ borderColor: `${colors.accentGold}40` }}
              >
                <Heart
                  className="w-4 h-4"
                  style={{ color: colors.accentGold }}
                />
                <span
                  className="text-sm font-light tracking-wider"
                  style={{ color: colors.accentGold }}
                >
                  TUSHEVENTS
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
                  Obianuju &
                  <span
                    className="font-serif italic block mt-2"
                    style={{ color: colors.accentGold }}
                  >
                    Obunikem?
                  </span>
                </h1>

                {/* Wedding Date with Green Accent */}
                <motion.div
                  className="flex items-center justify-center lg:justify-start gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  style={{ color: colors.lightGreen }}
                >
                  <div className="relative">
                    <Calendar className="w-5 h-5" />
                    <Sparkles
                      className="absolute -top-1 -right-1 w-3 h-3"
                      style={{ color: colors.accentGold }}
                    />
                  </div>
                  <span className="font-light tracking-wide text-lg lg:text-base">
                    January 5, 2026
                  </span>
                </motion.div>
              </motion.div>

              {/* CTA Buttons - Now 3 Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                variants={buttonVariants}
              >
                {/* Primary Button - Save My Seat */}
                <motion.button
                  onClick={() => router.push(`/save-seat`)}
                  className="group flex items-center justify-center gap-3 px-6 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{ backgroundColor: colors.primaryGreen }}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-white">Save My Seat</span>
                  <div className="w-0 group-hover:w-5 h-px bg-white transition-all duration-300"></div>
                </motion.button>

                {/* Secondary Button - Gift the Groom */}
                <motion.button
                  onClick={handleGroomGiftClick}
                  className="group flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-full font-medium transition-all duration-300 backdrop-blur-sm"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{
                    borderColor: `${colors.accentGold}60`,
                    color: colors.accentGold,
                  }}
                >
                  <Gift className="w-5 h-5" />
                  Gift the Groom
                  <div
                    className="w-0 group-hover:w-5 h-px transition-all duration-300"
                    style={{ backgroundColor: colors.accentGold }}
                  ></div>
                </motion.button>

                {/* Tertiary Button - Gift the Bride */}
                <motion.button
                  onClick={handleBrideGiftClick}
                  className="group flex items-center justify-center gap-3 px-6 py-4 rounded-full font-medium transition-all duration-300 backdrop-blur-sm border-2"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{
                    backgroundColor: `${colors.secondaryGreen}30`,
                    borderColor: `${colors.secondaryGreen}60`,
                    color: colors.lightGreen,
                  }}
                >
                  <Heart className="w-5 h-5" />
                  Gift the Bride
                  <div
                    className="w-0 group-hover:w-5 h-px transition-all duration-300"
                    style={{ backgroundColor: colors.lightGreen }}
                  ></div>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Image Slider for Desktop */}
            <motion.div
              className="hidden lg:block relative h-[500px] lg:h-[600px] overflow-hidden rounded-2xl"
              variants={textVariants}
            >
              {/* Green glow effect */}
              <div
                className="absolute left-32 top-0 w-px h-full z-20 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${colors.secondaryGreen}40, transparent)`,
                }}
              ></div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
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
                      background: `linear-gradient(to right, ${colors.darkBg}30, ${colors.darkBg}10)`,
                    }}
                  ></div>
                </motion.div>
              </AnimatePresence>

              {/* Image indicators for desktop */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                {images.map((_, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImage
                        ? "scale-125"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                    style={
                      index === currentImage
                        ? { backgroundColor: colors.accentGold }
                        : {}
                    }
                  />
                ))}
              </div>

              {/* Decorative frame with green border */}
              <div
                className="absolute inset-4 border pointer-events-none rounded-xl"
                style={{ borderColor: `${colors.secondaryGreen}30` }}
              ></div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div
            className="w-px h-16"
            style={{
              background: `linear-gradient(to bottom, ${colors.accentGold}80, transparent)`,
            }}
          ></div>
        </motion.div>
      </motion.div>

      {/* Eventloom Modal */}
      <AnimatePresence>
        {isEventloomModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 backdrop-blur-sm z-50"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={handleCloseModal}
              style={{ backgroundColor: `${colors.darkBg}80` }}
            />

            <motion.div
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div
                className="rounded-2xl p-8 shadow-2xl border"
                style={{
                  backgroundColor: colors.darkBg,
                  borderColor: `${colors.accentGold}20`,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${colors.primaryGreen}20` }}
                    >
                      <Heart
                        className="w-6 h-6"
                        style={{ color: colors.accentGold }}
                      />
                    </div>
                    <h3 className="text-xl font-light text-white">EVENTLOOM</h3>
                  </div>
                  <button
                    type="button"
                    title="cancel"
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-200"
                    style={{ color: colors.lightGreen }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <div
                    className="w-16 h-1 mx-auto rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${colors.primaryGreen}, ${colors.accentGold})`,
                    }}
                  ></div>
                  <h4
                    className="text-2xl font-light"
                    style={{ color: colors.accentGold }}
                  >
                    Coming Soon
                  </h4>
                  <p
                    className="font-light leading-relaxed"
                    style={{ color: `${colors.lightGreen}90` }}
                  >
                    We&apos;re crafting something extraordinary for your special
                    moments. EVENTLOOM will be launching soon to help you create
                    unforgettable wedding experiences.
                  </p>
                </div>

                {/* Footer */}
                <div
                  className="mt-8 pt-6"
                  style={{ borderTopColor: `${colors.primaryGreen}20` }}
                >
                  <button
                    onClick={handleCloseModal}
                    className="w-full py-3 rounded-full font-medium transition-all duration-300"
                    style={{
                      backgroundColor: colors.primaryGreen,
                      color: "white",
                    }}
                  >
                    Got It
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Groom Account Modal */}
      {renderAccountModal(
        isGroomModalOpen,
        "Groom",
        groomAccountDetails,
        "groom"
      )}

      {/* Bride Account Modal */}
      {renderAccountModal(
        isBrideModalOpen,
        "Bride",
        brideAccountDetails,
        "bride"
      )}
    </>
  );
};

export default Hero;
