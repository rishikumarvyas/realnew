import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PhoneStepProps {
  onSubmit: (phone: string) => Promise<void>;
  loading: boolean;
}

export const PhoneStep = ({ onSubmit, loading }: PhoneStepProps) => {
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(phone);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex">
            <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
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
              className="rounded-l-none"
              inputMode="numeric"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading || phone.length !== 10}
        >
          {loading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </form>
  );
};
