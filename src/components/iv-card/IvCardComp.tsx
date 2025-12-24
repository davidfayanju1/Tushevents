// src/pages/InvitationCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api, { API_BASE_URL } from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";

const InvitationCard = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [guestName, setGuestName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const invitationCode = searchParams.get("code");

  useEffect(() => {
    if (invitationCode) {
      generateCard(invitationCode);
    } else {
      setError("No invitation code provided");
      setLoading(false);
    }
  }, [invitationCode]);

  const generateCard = async (code: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}guests/generate-access-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invitationCode: code,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate invitation");
      }

      // Parse filename from Content-Disposition header
      let downloadFilename = "invitation.png";
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1]
            .replace(/['"]/g, "")
            .replace(/UTF-8''/, "");
        }
      }
      setFilename(downloadFilename);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      // Try to get guest info for display
      try {
        const guestResponse = await api.get(`/guests/code/${code}`);
        if (guestResponse.data.data) {
          setGuestName(guestResponse.data.data.name);
        }
      } catch (guestErr) {
        console.log("Could not fetch guest details", guestErr);
      }

      toast.success("Invitation card generated successfully!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate invitation";
      setError(message);
      toast.error("Failed to generate invitation card");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl || !filename) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Invitation card downloaded!");
  };

  const shareImage = async () => {
    if (!imageUrl) return;

    try {
      // Convert blob URL to file for sharing
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Wedding Invitation",
          text: "Here's my wedding invitation card!",
        });
      } else {
        // Fallback: copy image URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Invitation link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Failed to share invitation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0A1128] to-[#03072b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E5C07B] mx-auto mb-4"></div>
          <p className="text-white text-lg">
            Generating your invitation card...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0A1128] to-[#03072b] flex items-center justify-center">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#E5C07B] text-[#0A1128] px-6 py-2 rounded-lg font-medium hover:bg-[#E5C07B]/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A1128] to-[#03072b] py-8 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-[#E5C07B] hover:text-[#E5C07B]/80 transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Main content */}
        <motion.div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-[#E5C07B] to-[#FFD700] p-6 text-center">
            <h1 className="text-3xl font-bold text-[#0A1128] mb-2">
              Your Invitation Card
            </h1>
            {guestName && (
              <p className="text-[#0A1128]/80 text-lg">
                For: <span className="font-semibold">{guestName}</span>
              </p>
            )}
          </div>

          {/* Image display */}
          <div className="p-8">
            <div className="max-w-md mx-auto">
              <div className="border-4 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={imageUrl}
                  alt="Generated access card"
                  className="w-full h-auto"
                  height={1000}
                  width={1000}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={downloadImage}
                className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                <Download size={24} />
                Download Card
              </button>

              <button
                onClick={shareImage}
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                <Share2 size={24} />
                Share Card
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center">
            <p className="text-gray-600 text-sm">
              Keep this card safe and present it at the wedding venue
            </p>
          </div>
        </motion.div>

        {/* Additional info */}
        <motion.div
          className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Important Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-white/80">
            <div>
              <h4 className="font-semibold text-[#E5C07B] mb-2">
                Venue Details
              </h4>
              <p>
                Venue: Standpoint Church, Nicon Luxury Hotel, Tafawa Balewa way,
                Garki Abuja
              </p>
              <p>Date:Sunday 21st December 2025</p>
              <p>Time: 10:00AM</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#E5C07B] mb-2">
                Instructions
              </h4>
              <p>• Present this card at entry</p>
              <p>• Keep it for identification</p>
              <p>• Share with your +1 if applicable</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationCard;
