import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  Shield,
  Book,
  Eye,
  Settings,
  HelpCircle,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TermsCondition {
  id: string;
  termsconditions: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: TermsCondition[];
}

interface MessagePayload {
  phone: string;
  templateId: number;
  message: string;
  action: string;
  name: string;
  userTypeId: string;
  isTermsConditionsAccepted: boolean;
}

const TermsAndConditions = () => {
  const [termsData, setTermsData] = useState<TermsCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch terms and conditions from API
  const fetchTermsAndConditions = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://homeyatraapi.azurewebsites.net/api/Generic/GetActiveRecords?tableName=termsconditions",
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data && data.data && data.data.length > 0) {
        setTermsData(data.data);
        setError(null);

        toast({
          title: "Terms & Conditions Loaded",
          description: `Loaded ${data.data.length} terms section(s).`,
        });
      } else {
        setError("No terms and conditions data found");
        toast({
          variant: "destructive",
          title: "No Data Found",
          description: "No terms and conditions data available.",
        });
      }
    } catch (err) {

      setError("Failed to load terms and conditions");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load terms and conditions from server.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send terms acceptance to API
  const sendTermsAcceptance = async () => {
    try {
      setIsSubmitting(true);

      const payload: MessagePayload = {
        phone: "user_phone_number", // You might want to get this from user input or context
        templateId: 0,
        message: "Terms and Conditions accepted",
        action: "terms_accepted",
        name: "User", // You might want to get this from user input or context
        userTypeId: "1", // You might want to get this from user context
        isTermsConditionsAccepted: true,
      };

      const response = await fetch(
        "https://homeyatraapi.azurewebsites.net/api/Message/Send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Terms Accepted",
        description: "Your acceptance has been recorded successfully.",
      });
    } catch (err) {

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record your acceptance. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const formatTermsContent = (content: string) => {
    // Split content into paragraphs and format
    const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  const handleAcceptTerms = async () => {
    if (!agreementChecked) return;
    await sendTermsAcceptance();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600 font-medium">
            Loading Terms & Conditions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-sans transition-opacity duration-1000 overflow-hidden">
      {/* Hero Section with Property Images */}
      <div className="relative overflow-hidden h-screen lg:h-96">
        {/* Property Images Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-3 h-full gap-2">
            <img
              src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Modern house exterior"
              className="w-full h-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Luxury apartment interior"
              className="w-full h-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Beautiful villa"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/90 via-blue-600/90 to-blue-500/90 z-10"></div>
        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 h-full flex flex-col justify-center text-white text-center">
          <div
            className={`inline-block mx-auto mb-6 p-3 rounded-full bg-blue-500/30 backdrop-blur-md transition-all duration-1000scale-100 opacity-100 `}
          >
            <FileText className="h-10 w-10 md:h-12 md:w-12" />
          </div>
          <h1
            className={`text-4xl md:text-6xl font-bold mb-4 transition-all duration-1000 translate-y-0 opacity-100`}
          >
            Terms & Conditions
          </h1>
          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto transition-all duration-1000 delay-300 translate-y-0 opacity-100 `}
          >
            Please read these terms carefully before using our property services
          </p>
        </div>
        {/* Animated wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto"
          >
            <path
              fill="#fafafa"
              fillOpacity="1"
              d="M0,96L60,80C120,64,240,32,360,32C480,32,600,64,720,80C840,96,960,96,1080,80C1200,64,1320,32,1380,16L1440,0L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={fetchTermsAndConditions}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        )}

        {termsData.length > 0 ? (
          <div className="space-y-4 mb-12">
            {termsData.map((section, index) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-600">
                      Terms & Conditions
                    </h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections.has(section.id)
                        ? "transform rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {expandedSections.has(section.id) && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      {formatTermsContent(section.termsconditions)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Terms & Conditions Available
              </h3>
              <p className="text-gray-500 mb-4">
                Terms and conditions content is currently not available.
              </p>
              <button
                onClick={fetchTermsAndConditions}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          )
        )}

        {/* Agreement Section */}
        {/* {termsData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Agreement Acceptance
            </h3>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    agreementChecked
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                  onClick={() => setAgreementChecked(!agreementChecked)}
                >
                  {agreementChecked && <Check className="h-4 w-4 text-white" />}
                </div>
                <div>
                  <p className="text-gray-700">
                    I confirm that I have read, understood, and agree to be
                    bound by these Terms and Conditions. I understand that these
                    terms form a legally binding agreement.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center mx-auto ${
                  agreementChecked && !isSubmitting
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!agreementChecked || isSubmitting}
                onClick={handleAcceptTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "I Accept the Terms"
                )}
              </button>
            </div>
          </div>
        )} */}
        {/* Last Updated with Decorative Element */}
        <div
          id="updated-section"
          className={`animation-trigger text-center mb-16 transition-all duration-1000 translate-y-0 opacity-100`}
        >
          <div className="inline-flex items-center">
            <div className="h-px w-12 bg-blue-300"></div>
            <p className="px-4 text-blue-600 font-medium">
              Last Updated: April 30, 2025
            </p>
            <div className="h-px w-12 bg-blue-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
