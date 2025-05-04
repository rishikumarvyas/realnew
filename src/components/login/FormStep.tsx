import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormStepProps {
  onSubmit: (data: { name: string; phone: string }) => Promise<void>;
  loading: boolean;
}

export const FormStep = ({ onSubmit, loading }: FormStepProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (!phone.trim() || phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    await onSubmit({ name, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="transition-all duration-300">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-blue-100 focus:border-blue-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            Phone Number
          </Label>
          <div className="flex">
            <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-blue-50 text-blue-600 font-medium">
              +91
            </div>
            <Input
              id="phone"
              placeholder="Enter 10 digit phone number"
              value={phone}
              onChange={(e) => {
                // Allow only numbers and limit to 10 digits
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhone(value);
              }}
              type="tel"
              className="rounded-l-none border-blue-100 focus:border-blue-300"
              inputMode="numeric"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-colors duration-300 shadow-md hover:shadow-lg"
          disabled={loading || phone.length !== 10 || !name.trim()}
        >
          {loading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </form>
  );
};
