import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Shield, FileText, Users, Lock, Loader2, AlertCircle } from "lucide-react";
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

interface TermsConditionsProps {
  onAccept: () => void;
  onClose: () => void;
  isVisible: boolean;
  // Add user data props
  userData?: {
    phone: string;
    name: string;
    userTypeId: string;
  };
}

const TermsConditions = ({ onAccept, onClose, isVisible, userData }: TermsConditionsProps) => {
  const [accepted, setAccepted] = useState(false);
  const [termsData, setTermsData] = useState<TermsCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Create axios instance
  const apiClient = axios.create({
    baseURL: 'https://homeyatraapi.azurewebsites.net/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Fetch terms and conditions from API
  const fetchTermsAndConditions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching terms and conditions...');
      
      const response = await apiClient.get<ApiResponse>(
        '/Generic/GetActiveRecords?tableName=termsconditions'
      );
      
      console.log('📥 Terms and conditions response:', response.data);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setTermsData(response.data.data);
        console.log('✅ Terms data loaded successfully');
        
        toast({
          title: "Terms & Conditions Loaded",
          description: `Loaded ${response.data.data.length} terms section(s).`,
        });
      } else {
        console.log('⚠️ No data found in API response');
        setError('No terms and conditions data found');
        toast({
          variant: "destructive",
          title: "No Data Found",
          description: "No terms and conditions data available.",
        });
      }
    } catch (err) {
      console.error('❌ Error fetching terms and conditions:', err);
      setError('Failed to load terms and conditions');
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
      console.log('🔄 Sending terms acceptance...');

      // Use provided userData or fallback values
      const userPhone = userData?.phone || "user_phone_number";
      const userName = userData?.name || "User";
      const userTypeId = userData?.userTypeId || "1";

      const payload: MessagePayload = {
        phone: userPhone.startsWith('+91') ? userPhone : `+91${userPhone}`,
        templateId: 0,
        message: "Terms and Conditions accepted during signup",
        action: "terms_accepted",
        name: userName,
        userTypeId: userTypeId,
        isTermsConditionsAccepted: true
      };

      console.log('📤 Sending payload:', payload);

      const response = await apiClient.post('/Message/Send', payload);

      console.log('📤 Terms acceptance sent successfully:', response.data);

      toast({
        title: "Terms Accepted",
        description: "Your acceptance has been recorded successfully.",
      });

      onAccept(); // Call the parent onAccept function

    } catch (err) {
      console.error('❌ Error sending terms acceptance:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record your acceptance. Please try again.",
      });
      throw err; // Re-throw to handle in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchTermsAndConditions();
    }
  }, [isVisible]);

  const handleAccept = async () => {
    if (accepted) {
      await sendTermsAcceptance();
    }
  };

  const formatTermsContent = (content: string) => {
    // Split content into paragraphs and format
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed text-sm">
        {paragraph.trim()}
      </p>
    ));
  };

  const popupClasses = isVisible
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 translate-y-10 scale-95 pointer-events-none";

  const backdropClasses = isVisible
    ? "opacity-50"
    : "opacity-0 pointer-events-none";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${backdropClasses}`}
        onClick={onClose}
      />

      {/* Terms popup */}
      <div
        className={`w-full max-w-2xl z-10 transition-all duration-300 ease-out transform ${popupClasses}`}
      >
        <Card className="w-full shadow-2xl border-none overflow-hidden bg-white">
          {/* Header */}
          <CardHeader className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Terms & Conditions</CardTitle>
                <p className="text-blue-100 text-sm mt-1">HomeYatra Platform Agreement</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Terms content */}
            <ScrollArea className="h-64 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Loading Terms & Conditions...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <Button
                      onClick={fetchTermsAndConditions}
                      variant="outline"
                      size="sm"
                    >
                      Retry Loading
                    </Button>
                  </div>
                </div>
              ) : termsData.length > 0 ? (
                <div className="space-y-6 text-gray-700">
                  {/* Welcome Section */}
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                    <h3 className="font-semibold text-blue-800 mb-2">Welcome to HomeYatra</h3>
                    <p className="text-sm text-blue-700">
                      By creating an account, you agree to our terms of service and privacy policy. 
                      Please read these terms carefully before proceeding.
                    </p>
                  </div>

                  {/* API Terms Content */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-gray-800">Platform Terms & Conditions</h3>
                    {termsData.map((section, index) => (
                      <div key={section.id} className="space-y-2">
                        <h4 className="font-medium text-gray-700">Section {index + 1}</h4>
                        <div className="text-sm text-gray-600">
                          {formatTermsContent(section.termsconditions)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No terms and conditions available</p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Accept section */}
            <div className="border-t bg-gray-50 p-6">
              <div className="flex items-start gap-3 mb-4">
                <Checkbox
                  id="accept-terms"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                  className="mt-1"
                  disabled={loading || error !== null}
                />
                <label htmlFor="accept-terms" className="text-sm text-gray-700 cursor-pointer">
                  I have read and agree to the{" "}
                  <span className="font-semibold text-blue-600">Terms & Conditions</span> and{" "}
                  <span className="font-semibold text-blue-600">Privacy Policy</span> of HomeYatra. 
                  I understand my rights and responsibilities as a platform user.
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!accepted || loading || error !== null || isSubmitting}
                  className="px-8 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Accept & Continue"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsConditions;