"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Gift,
  Heart,
  X,
  User,
  Phone,
  Users,
  Check,
  Copy,
  Loader2,
  Plus,
  Target,
  Mail,
  Leaf,
  Flower,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import dynamic from "next/dynamic";

interface Selection {
  id: string;
  name: string;
  phone: string;
  email: string;
  representing: string;
  amount: number;
  createdAt: string;
}

interface Contributor {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
}

interface GiftItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  imageUrl: string;
  type: "CONTRIBUTORY" | "REGULAR";
  raisedAmount: number;
  maxPerGuest: number | null;
  minPerGuest: number | null;
  isTaken: boolean;
  isCompleted: boolean;
  createdAt: string;
  selections: Selection[];
  progress: number;
  contributors: Contributor[];
}

interface ContributeFormData {
  name: string;
  phone: string;
  email: string;
  representing: string;
  amount: number;
}

interface TransactionResponse {
  success: boolean;
  message: string;
  data: {
    transactionNo: string;
    amount: number;
    gift: string;
  };
}

interface PaymentConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface DragEventInfo {
  offset: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
}

// Dynamically import PaymentInitiator with SSR disabled
const PaymentInitiator = dynamic(
  () => import("../../components/payment/PaymentInitiator"),
  {
    ssr: false,
  }
);

const GiftTheCouple = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [dragX, setDragX] = useState<number>(0);
  const [viewedCards, setViewedCards] = useState<number[]>([0]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showContributeForm, setShowContributeForm] = useState<boolean>(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [transactionNo, setTransactionNo] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const router = useRouter();

  const PAYSTACK_PK = process.env.NEXT_PUBLIC_PAYSTACK_PK;

  // Emerald Green & Gold Color Scheme
  const colors = {
    primaryGreen: "#0D7A5F", // Deep emerald
    secondaryGreen: "#1A9D7A", // Lighter emerald
    accentGold: "#E5C07B", // Warm gold
    darkBg: "#0A1A14", // Deep green-based dark
    lightGreen: "#2DD4A3", // Mint accent
    darkGreen: "#052F1C", // Very dark green
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

  const [formData, setFormData] = useState<ContributeFormData>({
    name: "",
    phone: "",
    email: "",
    representing: "",
    amount: 0,
  });

  const formatPrice = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  // Convert kobo to Naira for display
  const koboToNaira = (kobo: number): number => {
    return kobo / 100;
  };

  // Convert Naira to kobo for API calls
  const nairaToKobo = (naira: number): number => {
    return naira * 100;
  };

  const fetchAllGifts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get(`/gifts`);
      console.log(response.data, "All gifts");

      if (response.data.success) {
        setGifts(response.data.data);
        console.log("Gifts loaded successfully:", response.data.data);
      } else {
        console.error("Failed to fetch gifts:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGifts();
  }, []);

  const nextCard = (): void => {
    if (isAnimating || gifts.length === 0) return;
    setIsAnimating(true);
    const nextIndex = (currentIndex + 1) % gifts.length;
    setCurrentIndex(nextIndex);

    if (!viewedCards.includes(nextIndex)) {
      setViewedCards((prev) => [...prev, nextIndex]);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevCard = (): void => {
    if (isAnimating || gifts.length === 0) return;
    setIsAnimating(true);
    const prevIndex = (currentIndex - 1 + gifts.length) % gifts.length;
    setCurrentIndex(prevIndex);

    if (!viewedCards.includes(prevIndex)) {
      setViewedCards((prev) => [...prev, prevIndex]);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleGiftSelection = (gift: GiftItem): void => {
    if (gift.isCompleted) {
      toast.error(
        "This gift has been fully funded. Please choose another one."
      );
      return;
    }

    setSelectedGift(gift);
    setShowContributeForm(true);
    // Convert minPerGuest from kobo to Naira for display
    const minAmountInNaira = gift.minPerGuest
      ? koboToNaira(gift.minPerGuest)
      : 5000;

    setFormData({
      name: "",
      phone: "",
      email: "",
      representing: "",
      amount: minAmountInNaira,
    });
    setCustomAmount("");
  };

  const handleAmountSelection = (amount: number): void => {
    setFormData((prev) => ({ ...prev, amount }));
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string): void => {
    setCustomAmount(value);
    const amount = parseInt(value.replace(/\D/g, "")) || 0;
    setFormData((prev) => ({ ...prev, amount }));
  };

  const getSuggestedAmounts = (gift: GiftItem): number[] => {
    const baseAmounts = [5000, 10000, 25000, 50000];

    if (gift.minPerGuest) {
      // Convert minPerGuest from kobo to Naira for comparison
      const minInNaira = koboToNaira(gift.minPerGuest);
      return baseAmounts.filter((amount) => amount >= minInNaira);
    }

    return baseAmounts;
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedGift) return;

    // Debug logging
    console.log("Form submission started");
    console.log("Selected gift:", selectedGift);
    console.log("Form data:", formData);

    // Validate form data
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.representing.trim() ||
      formData.amount <= 0
    ) {
      toast.error("Please fill in all fields and select an amount");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Convert amount from Naira to kobo for validation and API calls
    const amountInKobo = nairaToKobo(formData.amount);

    console.log("Amount in Naira:", formData.amount);
    console.log("Amount in kobo:", amountInKobo);
    console.log("Min per guest (kobo):", selectedGift.minPerGuest);
    console.log("Max per guest (kobo):", selectedGift.maxPerGuest);

    // Validate amount constraints - compare in kobo
    if (selectedGift.minPerGuest && amountInKobo < selectedGift.minPerGuest) {
      toast.error(
        `Minimum contribution is ${formatPrice(
          koboToNaira(selectedGift.minPerGuest)
        )}`
      );
      return;
    }

    if (selectedGift.maxPerGuest && amountInKobo > selectedGift.maxPerGuest) {
      toast.error(
        `Maximum contribution is ${formatPrice(
          koboToNaira(selectedGift.maxPerGuest)
        )}`
      );
      return;
    }

    // Check if contribution would exceed gift amount
    const remainingAmount = selectedGift.amount - selectedGift.raisedAmount;
    if (amountInKobo > remainingAmount) {
      toast.error(
        `Maximum contribution for this gift is ${formatPrice(
          koboToNaira(remainingAmount)
        )}`
      );
      return;
    }

    setFormLoading(true);

    try {
      console.log("Calling contribute API...");

      // Call the contribute endpoint with amount in kobo
      const contributeResponse = await api.post<TransactionResponse>(
        `/gifts/${selectedGift.id}/contribute`,
        {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          representing: formData.representing,
          amount: amountInKobo, // Send amount in kobo
        }
      );

      console.log("Contribute response:", contributeResponse.data);

      if (contributeResponse.data.success) {
        const transactionNo = contributeResponse.data.data.transactionNo;
        setTransactionNo(transactionNo);

        // Now initialize payment with Paystack using the user's email
        // Paystack expects amount in kobo
        const paymentConfig: PaymentConfig = {
          reference: transactionNo,
          email: formData.email.trim(),
          amount: amountInKobo, // Already in kobo
          publicKey: PAYSTACK_PK as string,
        };

        console.log("Payment config:", paymentConfig);
        setPaymentConfig(paymentConfig);
        setShowContributeForm(false);
        setIsProcessingPayment(true);

        toast.success("Redirecting to payment...");
      } else {
        throw new Error(
          contributeResponse.data.message || "Failed to create contribution"
        );
      }
    } catch (error: unknown) {
      console.error("Error processing contribution:", error);
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message ||
          apiError.message ||
          "An error occurred while processing your request"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference: string): Promise<void> => {
    try {
      // Confirm the contribution payment with the transaction number
      const confirmResponse = await api.post(`/gifts/confirm`, {
        transactionNo: reference,
      });

      if (confirmResponse.data.success) {
        toast.success(
          `Thank you for your generous contribution! You've helped fund ${selectedGift?.title}.`
        );

        // Convert amount to kobo for consistent state update
        const amountInKobo = nairaToKobo(formData.amount);

        // Update the gift status in local state
        setGifts((prevGifts) =>
          prevGifts.map((gift) =>
            gift.id === selectedGift?.id
              ? {
                  ...gift,
                  raisedAmount: gift.raisedAmount + amountInKobo,
                  progress: Math.min(
                    100,
                    ((gift.raisedAmount + amountInKobo) / gift.amount) * 100
                  ),
                  isCompleted: gift.raisedAmount + amountInKobo >= gift.amount,
                }
              : gift
          )
        );

        setShowSuccessModal(true);
        setTransactionNo(reference);

        // Refresh gifts list to get updated data
        fetchAllGifts();
      } else {
        throw new Error(
          confirmResponse.data.message || "Failed to confirm payment"
        );
      }
    } catch (error: unknown) {
      console.error("Error confirming payment:", error);
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message ||
          apiError.message ||
          "Payment completed but confirmation failed"
      );
    } finally {
      setIsProcessingPayment(false);
      setPaymentConfig(null);
      setSelectedGift(null);
    }
  };

  const handlePaymentClose = (): void => {
    console.log("Payment window closed");
    toast.info("Payment was cancelled.");
    setIsProcessingPayment(false);
    setPaymentConfig(null);
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Transaction number copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy transaction number");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: DragEventInfo
  ): void => {
    setDragX(info.offset.x / 200);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: DragEventInfo
  ): void => {
    if (gifts.length === 0) return;

    const swipeThreshold = 50;
    const velocityThreshold = 300;

    const shouldSwipe =
      Math.abs(info.offset.x) > swipeThreshold ||
      Math.abs(info.velocity.x) > velocityThreshold;

    if (shouldSwipe) {
      if (info.offset.x > 0 || info.velocity.x > 0) {
        prevCard();
      } else {
        nextCard();
      }
    }

    setDragX(0);
  };

  type CardPosition = "active" | "viewed-left" | "unviewed-right" | "hidden";

  const getCardPosition = (
    index: number,
    dragOffset: number = 0
  ): CardPosition => {
    if (index === currentIndex) return "active";

    const isViewed = viewedCards.includes(index);
    const isBeforeCurrent =
      viewedCards.indexOf(index) < viewedCards.indexOf(currentIndex);

    if (isViewed && isBeforeCurrent) return "viewed-left";
    if (!isViewed) return "unviewed-right";

    return "hidden";
  };

  interface CardTransform {
    x: number;
    scale: number;
    zIndex: number;
    opacity: number;
    rotateY: number;
    filter: string;
  }

  const getCardTransform = (
    index: number,
    dragOffset: number = 0
  ): CardTransform => {
    const position = getCardPosition(index, dragOffset);

    switch (position) {
      case "active":
        return {
          x: 0 + dragOffset * 200,
          scale: 1,
          zIndex: 40,
          opacity: 1,
          rotateY: 0,
          filter: "brightness(1)",
        };

      case "viewed-left":
        const viewedIndices = viewedCards.filter(
          (i) =>
            i !== currentIndex &&
            viewedCards.indexOf(i) < viewedCards.indexOf(currentIndex)
        );
        const leftIndex = viewedIndices.indexOf(index);
        const leftOffset = -280 - leftIndex * 50;

        return {
          x: leftOffset + dragOffset * 100,
          scale: 0.85,
          zIndex: 30 - leftIndex,
          opacity: 0.7,
          rotateY: -8,
          filter: "brightness(0.6)",
        };

      case "unviewed-right":
        const unviewedIndices = gifts
          .map((_, i) => i)
          .filter((i) => !viewedCards.includes(i) && i !== currentIndex);
        const rightIndex = unviewedIndices.indexOf(index);
        const rightOffset = 280 + rightIndex * 50;

        return {
          x: rightOffset + dragOffset * 100,
          scale: 0.85,
          zIndex: 20 - rightIndex,
          opacity: 0.7,
          rotateY: 8,
          filter: "brightness(0.6)",
        };

      default:
        return {
          x: index < currentIndex ? -600 : 600,
          scale: 0.7,
          zIndex: 0,
          opacity: 0,
          rotateY: 0,
          filter: "brightness(1)",
        };
    }
  };

  const getCardStyle = (position: string, isCompleted: boolean): string => {
    const baseStyle = "backdrop-blur-lg border-2 shadow-2xl";

    if (isCompleted) {
      return `${baseStyle} bg-gray-600/30 border-gray-400/40 opacity-60`;
    }

    switch (position) {
      case "active":
        return `${baseStyle} border-[${colors.accentGold}]/40`;
      case "viewed-left":
      case "unviewed-right":
        return "backdrop-blur-md border border-white/25 shadow-xl";
      default:
        return "backdrop-blur-sm border border-white/10";
    }
  };

  interface TextStyle {
    name: string;
    description: string;
    price: string;
    badge: string;
  }

  const getTextStyle = (position: string, isCompleted: boolean): TextStyle => {
    if (isCompleted) {
      return {
        name: "text-gray-400",
        description: "text-gray-400/80",
        price: "text-gray-400",
        badge: "bg-gray-500 text-white",
      };
    }

    switch (position) {
      case "active":
        return {
          name: `text-[${colors.accentGold}]`,
          description: "text-white/95",
          price: `text-[${colors.accentGold}]`,
          badge: "bg-green-500 text-white",
        };
      default:
        return {
          name: `text-[${colors.accentGold}]/60`,
          description: "text-white/40",
          price: `text-[${colors.accentGold}]/50`,
          badge: "bg-green-500/60 text-white",
        };
    }
  };

  const canGoNext = gifts.length > 0 && currentIndex < gifts.length - 1;
  const canGoPrev = gifts.length > 0 && currentIndex > 0;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.darkGreen}, ${colors.darkBg})`,
        }}
      >
        <div className="text-white text-xl">Loading gifts...</div>
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.darkGreen}, ${colors.darkBg})`,
        }}
      >
        <div className="text-white text-xl">
          No gifts available at the moment.
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{
          background: `linear-gradient(135deg, ${colors.darkGreen}, ${colors.darkBg})`,
        }}
      >
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
          className="absolute top-4 md:left-8 left-3 z-50 flex items-center gap-2 px-4 py-2 transition-colors duration-300 hover:bg-white/5 rounded-full"
          style={{ color: colors.accentGold }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Main content container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          {/* Header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
              style={{
                backgroundColor: `${colors.primaryGreen}20`,
                borderColor: `${colors.accentGold}40`,
              }}
            >
              <Gift className="w-4 h-4" style={{ color: colors.accentGold }} />
              <span
                className="text-sm font-light tracking-wider"
                style={{ color: colors.accentGold }}
              >
                GIFT REGISTRY
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-white mb-4">
              Gift The Couple
            </h1>
            <p className="mb-8" style={{ color: colors.lightGreen }}>
              {gifts.length} gift{gifts.length !== 1 ? "s" : ""} available
            </p>
          </motion.div>

          {/* Gift Cards Carousel */}
          <div className="relative h-[700px] flex items-center justify-center">
            {/* Navigation Arrows */}
            <button
              type="button"
              title="previous"
              onClick={prevCard}
              disabled={!canGoPrev}
              className="absolute left-4 z-40 p-4 backdrop-blur-sm border rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: `${colors.primaryGreen}20`,
                borderColor: `${colors.accentGold}40`,
                color: colors.accentGold,
              }}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              title="next"
              onClick={nextCard}
              disabled={!canGoNext}
              className="absolute right-4 z-40 p-4 backdrop-blur-sm border rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed rotate-180"
              style={{
                backgroundColor: `${colors.primaryGreen}20`,
                borderColor: `${colors.accentGold}40`,
                color: colors.accentGold,
              }}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Gift Cards Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {gifts.map((gift, index) => {
                const transform = getCardTransform(index, dragX);
                const position = getCardPosition(index, dragX);
                const cardStyle = getCardStyle(position, gift.isCompleted);
                const textStyle = getTextStyle(position, gift.isCompleted);

                return (
                  <motion.div
                    key={gift.id}
                    className={`absolute w-80 h-[500px] touch-pan-y ${
                      position === "active" && !gift.isCompleted
                        ? "cursor-grab active:cursor-grabbing"
                        : "pointer-events-none"
                    }`}
                    initial={false}
                    animate={{
                      x: transform.x,
                      scale: transform.scale,
                      zIndex: transform.zIndex,
                      opacity: transform.opacity,
                      rotateY: transform.rotateY,
                      filter: transform.filter,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.5,
                    }}
                    drag={
                      position === "active" &&
                      (canGoNext || canGoPrev) &&
                      !gift.isCompleted
                        ? "x"
                        : false
                    }
                    dragConstraints={{ left: -150, right: 150 }}
                    dragElastic={0.1}
                    dragTransition={{
                      bounceStiffness: 400,
                      bounceDamping: 25,
                      timeConstant: 150,
                    }}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    whileHover={
                      position === "active" && !gift.isCompleted
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      position === "active" && !gift.isCompleted
                        ? { scale: 0.98 }
                        : {}
                    }
                    style={{ touchAction: "pan-y" }}
                  >
                    <div
                      className={`rounded-2xl p-6 h-full flex flex-col transition-all duration-300 ${cardStyle} select-none`}
                      style={
                        position === "active"
                          ? {
                              backgroundColor: `${colors.primaryGreen}10`,
                            }
                          : {}
                      }
                    >
                      {/* Completed Badge */}
                      {gift.isCompleted && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gray-500 text-white text-xs font-medium z-10">
                          Fully Funded
                        </div>
                      )}

                      <h3
                        className={`text-2xl font-light text-center mb-4 ${
                          gift.isCompleted
                            ? textStyle.name
                            : `text-[${colors.accentGold}]`
                        }`}
                        style={
                          !gift.isCompleted ? { color: colors.accentGold } : {}
                        }
                      >
                        {gift.title}
                      </h3>
                      <div
                        className="flex-1 relative mb-4 rounded-xl overflow-hidden border select-none"
                        style={{ borderColor: `${colors.secondaryGreen}20` }}
                      >
                        <img
                          src={gift.imageUrl}
                          alt={gift.title}
                          className="w-full h-48 object-cover select-none"
                          draggable="false"
                        />
                        <div
                          className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"
                          style={{
                            backgroundColor:
                              position !== "active"
                                ? `${colors.darkGreen}50`
                                : "",
                          }}
                        />
                      </div>
                      <p
                        className={`text-center mb-4 text-sm flex-1 select-none ${
                          gift.isCompleted
                            ? textStyle.description
                            : "text-white/95"
                        }`}
                      >
                        {gift.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div
                          className="flex justify-between text-xs mb-1"
                          style={{ color: colors.lightGreen }}
                        >
                          <span>Progress</span>
                          <span>{gift.progress.toFixed(0)}%</span>
                        </div>
                        <div
                          className="w-full rounded-full h-2"
                          style={{
                            backgroundColor: `${colors.primaryGreen}30`,
                          }}
                        >
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${gift.progress}%`,
                              backgroundColor: colors.accentGold,
                            }}
                          ></div>
                        </div>
                        <div
                          className="flex justify-between text-xs mt-1"
                          style={{ color: colors.lightGreen }}
                        >
                          <span>
                            {formatPrice(koboToNaira(gift.raisedAmount))}{" "}
                            contributed
                          </span>
                          <span>
                            Goal: {formatPrice(koboToNaira(gift.amount))}
                          </span>
                        </div>
                      </div>

                      {position === "active" && (
                        <motion.button
                          onClick={() => handleGiftSelection(gift)}
                          disabled={gift.isCompleted}
                          className={`w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 select-none ${
                            gift.isCompleted
                              ? "bg-gray-500 cursor-not-allowed text-gray-300"
                              : "text-[#0A1A14]"
                          }`}
                          style={
                            !gift.isCompleted
                              ? {
                                  backgroundColor: colors.primaryGreen,
                                }
                              : {}
                          }
                          whileHover={!gift.isCompleted ? { scale: 1.02 } : {}}
                          whileTap={!gift.isCompleted ? { scale: 0.98 } : {}}
                        >
                          <Plus className="w-5 h-5" />
                          {gift.isCompleted ? "Fully Funded" : "Contribute"}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contribute Modal */}
      <AnimatePresence>
        {showContributeForm && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: `${colors.darkGreen}90` }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full h-[98%] max-w-md scrollbabr-hide"
            >
              {/* Modal Content */}
              <div
                className="rounded-2xl border-2 h-full overflow-y-scroll overflow-hidden"
                style={{
                  backgroundColor: colors.darkBg,
                  borderColor: `${colors.accentGold}40`,
                }}
              >
                {/* Header */}
                <div
                  className="relative p-6 border-b"
                  style={{ borderColor: `${colors.primaryGreen}20` }}
                >
                  <div className="text-center">
                    <Target
                      className="w-8 h-8 mx-auto mb-2"
                      style={{ color: colors.accentGold }}
                    />
                    <h2 className="text-2xl font-light text-white">
                      Contribute to Gift
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: colors.accentGold }}
                    >
                      {selectedGift.title}
                    </p>
                    <div
                      className="text-xs mt-2"
                      style={{ color: colors.lightGreen }}
                    >
                      {formatPrice(koboToNaira(selectedGift.raisedAmount))}{" "}
                      raised of {formatPrice(koboToNaira(selectedGift.amount))}
                    </div>
                  </div>
                  <button
                    title="button"
                    onClick={() => setShowContributeForm(false)}
                    className="absolute top-4 right-4 p-1 transition-colors"
                    style={{ color: colors.lightGreen }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border rounded-xl text-white placeholder-white/40 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border rounded-xl text-white placeholder-white/40 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="08123456789"
                      className="w-full px-4 py-3 border rounded-xl text-white placeholder-white/40 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                    />
                  </div>

                  {/* Representing Dropdown */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      <Users className="w-4 h-4" />
                      Representing
                    </label>
                    <select
                      title="select"
                      name="representing"
                      value={formData.representing}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border rounded-xl text-white focus:outline-none transition-colors appearance-none"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}30`,
                        color: "white",
                      }}
                    >
                      <option
                        value=""
                        disabled
                        style={{ backgroundColor: colors.darkBg }}
                      >
                        Select who you&apos;re representing
                      </option>
                      <option
                        value="Bride's Family"
                        style={{ backgroundColor: colors.darkBg }}
                      >
                        Bride&apos;s Family
                      </option>
                      <option
                        value="Groom's Family"
                        style={{ backgroundColor: colors.darkBg }}
                      >
                        Groom&apos;s Family
                      </option>
                      <option
                        value="Both"
                        style={{ backgroundColor: colors.darkBg }}
                      >
                        Both
                      </option>
                    </select>
                  </div>

                  {/* Amount Selection */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: colors.accentGold }}
                    >
                      <Gift className="w-4 h-4" />
                      Contribution Amount
                    </label>

                    {/* Suggested Amounts */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {getSuggestedAmounts(selectedGift).map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleAmountSelection(amount)}
                          className={`px-4 py-3 rounded-lg border transition-all duration-200 ${
                            formData.amount === amount && !customAmount
                              ? "text-[#0A1A14]"
                              : "text-white hover:bg-white/10"
                          }`}
                          style={
                            formData.amount === amount && !customAmount
                              ? {
                                  backgroundColor: colors.primaryGreen,
                                  borderColor: colors.primaryGreen,
                                }
                              : {
                                  backgroundColor: `${colors.primaryGreen}20`,
                                  borderColor: `${colors.accentGold}30`,
                                }
                          }
                        >
                          {formatPrice(amount)}
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="relative">
                      <input
                        type="text"
                        value={customAmount}
                        onChange={(e) =>
                          handleCustomAmountChange(e.target.value)
                        }
                        placeholder="Enter custom amount"
                        className="w-full px-4 py-3 border rounded-xl text-white placeholder-white/40 focus:outline-none transition-colors"
                        style={{
                          backgroundColor: `${colors.primaryGreen}10`,
                          borderColor: `${colors.accentGold}30`,
                          color: "white",
                        }}
                      />
                      <div
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        style={{ color: colors.lightGreen }}
                      >
                        ₦
                      </div>
                    </div>

                    {/* Amount Constraints */}
                    <div
                      className="text-xs space-y-1"
                      style={{ color: colors.lightGreen }}
                    >
                      {selectedGift.minPerGuest && (
                        <div>
                          Minimum:{" "}
                          {formatPrice(koboToNaira(selectedGift.minPerGuest))}
                        </div>
                      )}
                      {selectedGift.maxPerGuest && (
                        <div>
                          Maximum:{" "}
                          {formatPrice(koboToNaira(selectedGift.maxPerGuest))}
                        </div>
                      )}
                      <div>
                        Remaining:{" "}
                        {formatPrice(
                          koboToNaira(
                            selectedGift.amount - selectedGift.raisedAmount
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={formLoading || formData.amount <= 0}
                    className="w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: colors.primaryGreen,
                      color: colors.darkBg,
                    }}
                    whileHover={!formLoading ? { scale: 1.02 } : {}}
                    whileTap={!formLoading ? { scale: 0.98 } : {}}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5" />
                        Contribute {formatPrice(formData.amount)}
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && transactionNo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: `${colors.darkGreen}90` }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md"
            >
              <div
                className="rounded-2xl border-2 shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: colors.darkBg,
                  borderColor: `${colors.accentGold}40`,
                }}
              >
                {/* Header */}
                <div
                  className="relative p-6 border-b"
                  style={{ borderColor: `${colors.primaryGreen}20` }}
                >
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${colors.secondaryGreen}20` }}
                    >
                      <Check
                        className="w-8 h-8"
                        style={{ color: colors.secondaryGreen }}
                      />
                    </div>
                    <h2 className="text-2xl font-light text-white">
                      Contribution Confirmed!
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: colors.accentGold }}
                    >
                      Thank you for your generosity
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <p className="mb-4" style={{ color: colors.lightGreen }}>
                      Your contribution has been successfully processed. Please
                      save your transaction number for reference.
                    </p>

                    {/* Transaction Number Display */}
                    <div
                      className="rounded-lg p-4 border"
                      style={{
                        backgroundColor: `${colors.primaryGreen}10`,
                        borderColor: `${colors.accentGold}20`,
                      }}
                    >
                      <p
                        className="text-sm mb-2"
                        style={{ color: colors.lightGreen }}
                      >
                        Transaction Number:
                      </p>
                      <div
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ backgroundColor: `${colors.primaryGreen}20` }}
                      >
                        <code
                          className="text-lg font-mono font-bold"
                          style={{ color: colors.accentGold }}
                        >
                          {transactionNo}
                        </code>
                        <button
                          onClick={() => copyToClipboard(transactionNo)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                          style={{
                            backgroundColor: colors.primaryGreen,
                            color: colors.darkBg,
                          }}
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {copied ? "Copied!" : "Copy"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setTransactionNo(null);
                    }}
                    className="w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{
                      backgroundColor: colors.primaryGreen,
                      color: colors.darkBg,
                    }}
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Processing Overlay */}
      {isProcessingPayment && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: `${colors.darkGreen}90` }}
        >
          <div
            className="rounded-2xl border-2 p-8 text-center"
            style={{
              backgroundColor: colors.darkBg,
              borderColor: `${colors.accentGold}40`,
            }}
          >
            <Loader2
              className="w-12 h-12 animate-spin mx-auto mb-4"
              style={{ color: colors.accentGold }}
            />
            <h3 className="text-xl font-light text-white mb-2">
              Processing Payment
            </h3>
            <p style={{ color: colors.lightGreen }}>
              Please wait while we redirect you to Paystack...
            </p>
          </div>
        </div>
      )}

      {/* Payment Initiator */}
      {paymentConfig && (
        <PaymentInitiator
          config={paymentConfig}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </>
  );
};

export default GiftTheCouple;
