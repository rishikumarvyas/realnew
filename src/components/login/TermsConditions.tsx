import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Shield, FileText, Users, Lock } from "lucide-react";

interface TermsConditionsProps {
  onAccept: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const TermsConditions = ({ onAccept, onClose, isVisible }: TermsConditionsProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
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
              <div className="space-y-6 text-gray-700">
                {/* Welcome Section */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <h3 className="font-semibold text-blue-800 mb-2">Welcome to HomeYatra</h3>
                  <p className="text-sm text-blue-700">
                    By creating an account, you agree to our terms of service and privacy policy. 
                    Please read these terms carefully before proceeding.
                  </p>
                </div>

                {/* Key Points */}
                <div className="grid gap-4">
                  <div className="flex gap-3">
                    <div className="bg-green-100 rounded-full p-2 h-fit">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Account Usage</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        You agree to use your account responsibly and provide accurate information. 
                        One account per user is permitted.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-purple-100 rounded-full p-2 h-fit">
                      <Lock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Privacy & Data</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        We protect your personal information and use it only to provide our services. 
                        Your data will not be shared without consent.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-orange-100 rounded-full p-2 h-fit">
                      <Shield className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Platform Rules</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Maintain respectful communication, provide accurate property information, 
                        and follow all applicable laws and regulations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Terms */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-800">Detailed Terms</h3>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">1. Service Description</h4>
                    <p className="text-sm text-gray-600">
                      HomeYatra provides a platform connecting property owners, brokers, builders, and buyers. 
                      We facilitate property transactions but are not responsible for the actual deals between parties.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">2. User Responsibilities</h4>
                    <p className="text-sm text-gray-600">
                      Users must provide accurate information, maintain account security, respect other users, 
                      and comply with all applicable laws. Misuse of the platform may result in account suspension.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">3. Property Listings</h4>
                    <p className="text-sm text-gray-600">
                      All property information must be accurate and up-to-date. Users are responsible for 
                      verifying property details and legal documentation before any transactions.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">4. Privacy Policy</h4>
                    <p className="text-sm text-gray-600">
                      We collect and use personal information to provide our services. Your data is protected 
                      and will not be shared with third parties without your explicit consent, except as required by law.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">5. Limitation of Liability</h4>
                    <p className="text-sm text-gray-600">
                      HomeYatra is not liable for any direct or indirect damages arising from platform use. 
                      Users engage in property transactions at their own risk.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">6. Termination</h4>
                    <p className="text-sm text-gray-600">
                      Either party may terminate the agreement at any time. HomeYatra reserves the right 
                      to suspend accounts that violate these terms.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Accept section */}
            <div className="border-t bg-gray-50 p-6">
              <div className="flex items-start gap-3 mb-4">
                <Checkbox
                  id="accept-terms"
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                  className="mt-1"
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
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="px-8 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
                >
                  Accept & Continue
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