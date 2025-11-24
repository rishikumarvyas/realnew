import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "@/axiosCalls/axiosInstance";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, User } from "lucide-react";

type ProfileResponse = {
  statusCode: number;
  message?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
};

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailInvalidDialog, setShowEmailInvalidDialog] =
    useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showEmailInvalidDialog) {
      // focus the email input when the dialog opens
      setTimeout(() => {
        emailRef.current?.focus();
      }, 50);
    }
  }, [showEmailInvalidDialog]);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [allStates, setAllStates] = useState<any[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [cityList, setCityList] = useState<any[]>([]);
  const [cityLoading, setCityLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("allStates");
      setAllStates(raw ? JSON.parse(raw) : []);
    } catch {
      setAllStates([]);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get<ProfileResponse>(
          "/api/Account/GetProfile"
        );
        if (res?.data) {
          const d = res.data;
          setProfile({
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            email: d.email || "",
            phone: d.phone || "",
            address: d.address || "",
            city: d.city || "",
            state: d.state || "",
          });

          if (d.state && Array.isArray(allStates)) {
            const matched = allStates.find((s: any) => {
              const name = (s.state || s.name || "").toString();
              return (
                name.toLowerCase() === d.state.toLowerCase() ||
                s.id?.toString() === d.state?.toString()
              );
            });
            if (matched) setSelectedStateId(matched.id?.toString());
          }
        } else {
          setError("Invalid response from server");
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStates]);

  useEffect(() => {
    if (!selectedStateId) {
      setCityList([]);
      setCityId("");
      setCityLoading(false);
      return;
    }
    setCityLoading(true);
    setCityList([]);
    setCityId("");
    axios
      .get(
        `https://homeyatraapi.azurewebsites.net/api/Generic/GetActiveRecords?tableName=City&parentTableName=State&parentField=StateId&parentId=${selectedStateId}`
      )
      .then((res) => {
        if (res?.data?.statusCode === 200 && res?.data?.data?.length > 0) {
          setCityList(res.data.data);
          if (profile.city) {
            const matched = res.data.data.find((c: any) => {
              const name = (c.city || c.name || "").toString();
              return (
                name.toLowerCase() === profile.city.toLowerCase() ||
                c.id?.toString() === profile.city?.toString()
              );
            });
            if (matched) setCityId(matched.id?.toString());
          }
        } else {
          setCityList([]);
        }
      })
      .catch(() => setCityList([]))
      .finally(() => setCityLoading(false));
  }, [selectedStateId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setProfile((p) => ({ ...p, [name]: value }));
    if (name === "email") {
      if (!value || !value.trim()) {
        setEmailError(null);
      } else {
        const isValid = validateEmail(value);
        setEmailError(isValid ? null : "Please enter a valid email address");
      }
    }
  };

  const validateEmail = (value: string) => {
    if (!value) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value.toLowerCase());
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    if (profile.email && emailError) {
      // show dialog asking user to enter a valid email; focus will move to the input
      setShowEmailInvalidDialog(true);
      setSaving(false);
      return;
    }
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        address: profile.address,
        cityId: cityId || profile.city,
        stateId: selectedStateId || profile.state,
      };

      const res = await axiosInstance.post(
        "/api/Account/UpdateProfile",
        payload
      );
      if (res?.data?.statusCode === 0 || res?.status === 200) {
        toast({
          title: "Profile updated",
          description:
            res?.data?.message || "Your profile was updated successfully.",
        });
        // update AuthContext so navbar/name updates immediately
        try {
          updateUser?.({ name: `${payload.firstName} ${payload.lastName}` });
        } catch (e) {
          // ignore if updateUser isn't available
        }
      } else {
        toast({
          title: "Update failed",
          description: res?.data?.message || "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile";
      setError(msg);
      toast({
        title: "Update failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {loading ? (
        <div className="py-16 text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-6">{error}</div>
      ) : (
        <>
          <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>My Profile</CardTitle>
              </div>
              <CardDescription>
                View and update your profile information.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    name="email"
                    ref={emailRef}
                    value={profile.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md p-2"
                    type="email"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={profile.phone}
                    readOnly
                    className="mt-1 block w-full border rounded-md p-2 bg-gray-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <Select
                    value={selectedStateId}
                    onValueChange={(val) => setSelectedStateId(val)}
                  >
                    <SelectTrigger
                      id="state"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue
                        placeholder={
                          allStates.length
                            ? "Select State"
                            : "No states available"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {allStates.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <Select
                    value={cityId}
                    onValueChange={(val) => setCityId(val)}
                    disabled={!selectedStateId || cityLoading}
                  >
                    <SelectTrigger
                      id="city"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      {cityLoading ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Loading...
                        </span>
                      ) : (
                        <SelectValue
                          placeholder={
                            selectedStateId
                              ? "Select City"
                              : "Select State First"
                          }
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {cityLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Loading cities...
                        </div>
                      ) : (
                        cityList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.city}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center space-x-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white"
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Dialog
            open={showEmailInvalidDialog}
            onOpenChange={setShowEmailInvalidDialog}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invalid Email</DialogTitle>
                <DialogDescription>
                  The email you entered doesn't look valid. Please enter a valid
                  email address or leave the field empty.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowEmailInvalidDialog(false);
                    setTimeout(() => emailRef.current?.focus(), 50);
                  }}
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Profile;
