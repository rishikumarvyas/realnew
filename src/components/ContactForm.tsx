
import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
  contactType: "whatsapp" | "email";
  contactInfo: string;
}

export function ContactForm({
  open,
  onOpenChange,
  propertyTitle,
  contactType,
  contactInfo,
}: ContactFormProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent Successfully!",
        description: `Your message has been sent via ${contactType}.`,
      });
      
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {contactType === "whatsapp" ? "WhatsApp " : "Email "} Owner
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onOpenChange(false)}
            >
            </Button>
          </DialogTitle>
          <DialogDescription>
            Send a message about &quot;{propertyTitle}&quot;
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <p className="text-sm mb-2 font-medium">
                {contactType === "whatsapp"
                  ? "WhatsApp number: "
                  : "Email address: "}
                <span className="font-normal">{contactInfo}</span>
              </p>
            </div>
            <Textarea
              placeholder="Hello, I'm interested in this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
