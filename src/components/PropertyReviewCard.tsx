import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Bed,
  Bath,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Image,
  Ruler,
  User,
  Calendar,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "../axiosCalls/axiosInstance";
import { useNavigate } from "react-router-dom";

interface Property {
  propertyId: string;
  superCategory: string;
  propertyType: string;
  statusId: string;
  title: string;
  price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  description?: string;
  createdDate?: string;
  mainImageUrl?: string;
  locality?: string;
  address?: string;
  city?: string;
  bedroom?: number;
  bathroom?: number;
  likeCount?: number;
  submittedBy?: string;
}

interface PropertyReviewCardProps {
  property: Property;
  onAction?: (propertyId: string, action: string, newStatus: string) => void;
}

const PropertyReviewCard: React.FC<PropertyReviewCardProps> = ({
  property,
  onAction,
}) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const { toast } = useToast();
  const { createNotification, refreshNotifications } = useAuth();
  const navigate = useNavigate();

  const validatePropertyId = (propertyId: string): boolean => {
    if (!propertyId || propertyId.trim() === "") {

      toast({
        title: "Validation Error",
        description: "Property ID is missing. Cannot perform this action.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleApprove = async () => {
    if (!validatePropertyId(property.propertyId) || loading) return;

    setLoading(true);
    setActionType("approve");

    try {
      const cleanPropertyId = String(property.propertyId).trim();
      const payload = { propertyId: cleanPropertyId };

      const response = await axiosInstance.post("/api/Admin/Approve", payload);

      // Check for success - status code 200
      if (response.status === 200) {
        // Create notification for property approval
        await createNotification(
          `Your property "${property.title}" has been approved and is now live!`,
          "property",
          cleanPropertyId
        );

        // Refresh notifications to update count immediately
        await refreshNotifications();

        toast({
          title: "✅ Success!",
          description: "Property has been approved successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        // Pass statusId '2' for approved and trigger refresh
        onAction?.(cleanPropertyId, "approve", "2");
      } else {
        throw new Error("Failed to approve property");
      }
    } catch (error: any) {

      toast({
        title: "❌ Error",
        description: "Failed to approve property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!validatePropertyId(property.propertyId) || loading) return;

    setLoading(true);
    setActionType("reject");

    try {
      const cleanPropertyId = String(property.propertyId).trim();
      const payload = { propertyId: cleanPropertyId };

      const response = await axiosInstance.post("/api/Admin/Reject", payload);

      // Check for success - status code 200
      if (response.status === 200) {
        // Create notification for property rejection
        await createNotification(
          `Your property "${property.title}" has been rejected. Please review and resubmit.`,
          "property",
          cleanPropertyId
        );

        // Refresh notifications to update count immediately
        await refreshNotifications();

        toast({
          title: "✅ Success!",
          description: "Property has been rejected successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        // Pass statusId '3' for rejected and trigger refresh
        onAction?.(cleanPropertyId, "reject", "3");
      } else {
        throw new Error("Failed to reject property");
      }
    } catch (error: any) {

      toast({
        title: "❌ Error",
        description: "Failed to reject property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleRevoke = async () => {
    if (!validatePropertyId(property.propertyId) || loading) return;

    setLoading(true);
    setActionType("revoke");

    try {
      const cleanPropertyId = String(property.propertyId).trim();
      const payload = { propertyId: cleanPropertyId };

      const response = await axiosInstance.post("/api/Admin/Reject", payload);

      if (response.status === 200) {
        // Create notification for property revocation
        await createNotification(
          `Your property "${property.title}" approval has been revoked.`,
          "property",
          cleanPropertyId
        );

        // Refresh notifications to update count immediately
        await refreshNotifications();

        toast({
          title: "✅ Success!",
          description: "Property approval has been revoked successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        // Pass statusId '3' for revoked (moves to rejected)
        onAction?.(cleanPropertyId, "revoke", "3");
      } else {
        throw new Error("Failed to revoke property");
      }
    } catch (error: any) {

      toast({
        title: "❌ Error",
        description: "Failed to revoke property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReconsider = async () => {
    if (!validatePropertyId(property.propertyId) || loading) return;

    setLoading(true);
    setActionType("reconsider");

    try {
      const cleanPropertyId = String(property.propertyId).trim();
      const payload = { propertyId: cleanPropertyId };

      const response = await axiosInstance.post("/api/Admin/Approve", payload);

      if (response.status === 200) {
        // Create notification for property reconsideration
        await createNotification(
          `Your property "${property.title}" has been moved for reconsideration.`,
          "property",
          cleanPropertyId
        );

        // Refresh notifications to update count immediately
        await refreshNotifications();

        toast({
          title: "✅ Success!",
          description: "Property moved for reconsideration successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        // Pass statusId '2' for reconsider (moves to approved)
        onAction?.(cleanPropertyId, "reconsider", "2");
      } else {
        throw new Error("Failed to reconsider property");
      }
    } catch (error: any) {

      toast({
        title: "❌ Error",
        description: "Failed to reconsider property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleViewProperty = () => {
    if (!validatePropertyId(property.propertyId)) return;
    navigate(`/properties/${property.propertyId}`);
  };

  const getStatusBadge = () => {
    const statusMap = {
      "1": {
        label: "Pending",
        icon: Clock,
        className:
          "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200",
        dotColor: "bg-amber-500",
      },
      "2": {
        label: "Approved",
        icon: CheckCircle,
        className:
          "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200",
        dotColor: "bg-emerald-500",
      },
      "3": {
        label: "Rejected",
        icon: XCircle,
        className:
          "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200",
        dotColor: "bg-red-500",
      },
    };

    const status =
      statusMap[property.statusId as keyof typeof statusMap] || statusMap["1"];

    return (
      <Badge className={`${status.className} font-medium px-3 py-1`}>
        <div className={`w-2 h-2 rounded-full ${status.dotColor} mr-2`}></div>
        {status.label}
      </Badge>
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Price on request";
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderActionButtons = () => {
    const baseButtonClass =
      "flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const buttons = [];

    // Add view property button first
    buttons.push(
      <button
        key="view"
        type="button"
        onClick={handleViewProperty}
        className={`${baseButtonClass} text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 focus:ring-blue-400`}
      >
        <Eye className="w-4 h-4 mr-2" />
        <span className="truncate">View Property</span>
      </button>,
    );

    // Status-specific action buttons
    switch (property.statusId) {
      case "1": // Pending
        buttons.push(
          <button
            key="approve"
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className={`${baseButtonClass} text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:ring-emerald-500 shadow-lg hover:shadow-emerald-500/25`}
          >
            {loading && actionType === "approve" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            <span className="truncate">Approve</span>
          </button>,
        );

        buttons.push(
          <button
            key="reject"
            type="button"
            onClick={handleReject}
            disabled={loading}
            className={`${baseButtonClass} text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:ring-red-500 shadow-lg hover:shadow-red-500/25`}
          >
            {loading && actionType === "reject" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            <span className="truncate">Reject</span>
          </button>,
        );
        break;

      case "2": // Approved
        buttons.push(
          <button
            key="revoke"
            type="button"
            onClick={handleRevoke}
            disabled={loading}
            className={`${baseButtonClass} text-red-700 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-200 hover:border-red-300 focus:ring-red-400`}
          >
            {loading && actionType === "revoke" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            <span className="truncate">Revoke</span>
          </button>,
        );
        break;

      case "3": // Rejected
        buttons.push(
          <button
            key="reconsider"
            type="button"
            onClick={handleReconsider}
            disabled={loading}
            className={`${baseButtonClass} text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 hover:border-emerald-300 focus:ring-emerald-400`}
          >
            {loading && actionType === "reconsider" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            <span className="truncate">Reconsider</span>
          </button>,
        );
        break;
    }

    // Render buttons in rows of 2
    const buttonRows = [];
    for (let i = 0; i < buttons.length; i += 2) {
      const rowButtons = buttons.slice(i, i + 2);
      buttonRows.push(
        <div key={i} className="flex gap-3">
          {rowButtons}
        </div>,
      );
    }

    return buttonRows;
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white hover:scale-[1.01] transform">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {property.mainImageUrl ? (
          <>
            <img
              src={property.mainImageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/600x400/f1f5f9/64748b?text=No+Image+Available";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-16 h-16 text-slate-400" />
          </div>
        )}

        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4">{getStatusBadge()}</div>

        {/* Property Type Badge - Top Left */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 border-0 font-medium">
            {property.propertyType}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-slate-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {property.locality && property.city
                ? `${property.locality}, ${property.city}`
                : property.address || "Location not specified"}
            </span>
          </div>
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {property.description ||
              "No description available for this property."}
          </p>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-4 py-3 px-4 bg-slate-50 rounded-xl">
          <div className="flex items-center text-slate-600">
            <Bed className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{property.bedroom || 0}</span>
          </div>
          <div className="flex items-center text-slate-600">
            <Bath className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              {property.bathroom || 0}
            </span>
          </div>
          <div className="flex items-center text-slate-600">
            <Ruler className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              {property.area || 0} sq ft
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900">
              {formatPrice(property.price)}
            </span>
            <span className="text-slate-500 text-sm ml-1">/mo</span>
          </div>
        </div>

        {/* Submission Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 py-2">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1" />
            <span>By {property.submittedBy || "Unknown"}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(property.createdDate)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">{renderActionButtons()}</div>

        {/* Property ID */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-mono">
            ID: {property.propertyId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyReviewCard;
