import { useState } from "react";
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
  userType: z.coerce.number().min(1, {
    message: "Please select a user type.",
  }),
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
  initialUserType,
  phoneError = null
}: FormStepProps) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      userType: initialUserType || 0, // Set to 0 when no initial value provided
    },
  });

  const handleSubmit = (data: any) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <div className="w-full mx-auto mt-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className="text-xs font-medium">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    {...field}
                    autoComplete="name"
                    className="h-9"
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
              <FormItem className="space-y-0.5">
                <FormLabel className="text-xs font-medium">Phone Number</FormLabel>
                <div className="flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l h-9">
                    <span className="text-muted-foreground text-sm">+91</span>
                  </div>
                  <FormControl>
                    <Input
                      className="rounded-l-none h-9"
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
              <FormItem className="space-y-0.5">
                <FormLabel className="text-xs font-medium">I am a</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value > 0 ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
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
            className="w-full h-9 text-sm mt-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500" 
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue with OTP"}
          </Button>
        </form>
      </Form>
    </div>
  );
};