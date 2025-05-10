import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Phone number validation for Indian numbers
const phoneRegex = /^[6-9]\d{9}$/;

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().refine((val) => phoneRegex.test(val), {
    message: "Please enter a valid 10-digit Indian phone number.",
  }),
  userType: z.coerce.number(),
});

interface FormStepProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  userTypes: Array<{ id: number; name: string }>;
  states?: Array<{ id: number; name: string }>;
  initialUserType?: number;
  initialStateId?: number;
  phoneError?: string | null;
}

export const FormStep = ({ 
  onSubmit, 
  loading, 
  userTypes = [], 
  states = [],
  initialUserType = 1,
  phoneError = null
}: FormStepProps) => {
  const [isFormValid, setIsFormValid] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      userType: initialUserType,
    },
    mode: "onChange", // Enable validation on change
  });

  // Watch form fields for validation
  const { name, phone, userType } = form.watch();
  
  // Update form validity when values change
  useEffect(() => {
    const isValid = name.trim().length >= 2 && phoneRegex.test(phone) && userType;
    setIsFormValid(isValid);
  }, [name, phone, userType]);

  const handleSubmit = (data: any) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <div className="w-full mx-auto mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    {...field}
                    autoComplete="name"
                    className="h-10 px-3 py-2"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                <div className="flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l h-10">
                    <span className="text-muted-foreground text-sm">+91</span>
                  </div>
                  <FormControl>
                    <Input
                      className="rounded-l-none h-10 px-3 py-2"
                      placeholder="10-digit number"
                      {...field}
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </FormControl>
                </div>
                {phoneError ? (
                  <p className="text-destructive text-xs">{phoneError}</p>
                ) : (
                  <FormMessage className="text-xs" />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium">I am a</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 px-3 py-2">
                      <SelectValue placeholder="Select your user type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-10 text-sm mt-6 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all" 
            disabled={loading || !isFormValid}
          >
            {loading ? "Processing..." : "Continue with OTP"}
          </Button>
        </form>
      </Form>
    </div>
  );
};