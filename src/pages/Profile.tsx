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
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [allStates, setAllStates] = useState<any[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [cityList, setCityList] = useState<any[]>([]);
  const [cityLoading, setCityLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("profileImage");
      if (stored) setProfileImage(stored);
    } catch {
      setProfileImage(null);
    }
  }, []);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setProfileImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    try {
      localStorage.removeItem("profileImage");
    } catch {
      /* ignore */
    }
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
        try {
          if (profileImage) {
            localStorage.setItem("profileImage", profileImage);
          } else {
            localStorage.removeItem("profileImage");
          }
        } catch {
          /* ignore */
        }
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials =
    (profile.firstName?.[0] || "").toUpperCase() +
    (profile.lastName?.[0] || "").toUpperCase();

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      {loading ? (
        <div className="py-24 text-center text-slate-500">Loading...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-600">{error}</div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
            <Card className="border border-slate-200 bg-white/90 shadow-xl">
              <CardContent className="space-y-4 px-6 py-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-36 w-36 rounded-full border-4 border-white object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-100 text-4xl font-semibold uppercase text-slate-700">
                        {initials.trim() || <User className="h-12 w-12" />}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 rounded-full border border-white bg-blue-600 p-3 text-white shadow-lg"
                      title="Upload photo"
                    >
                      +
                    </button>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold text-slate-900 leading-tight">
                      {profile.firstName ? profile.firstName : "Add your name"}
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-[11px]">
                    <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-0.5 font-medium text-pink-600">
                      {profile.firstName || profile.lastName ? "Complete" : "New"}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 font-medium text-emerald-600">
                      Verified
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      size="default"
                      className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 h-11 text-white shadow"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload photo
                    </Button>
                    {profileImage && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-slate-200 px-6 text-slate-600"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="border border-slate-200 bg-white/90 shadow-lg">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-emerald-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center">
                    <div className="mr-3 rounded-full bg-blue-100 p-2 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Profile details</CardTitle>
                      <CardDescription>
                        Update your personal information below.
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      First name
                    </label>
                    <input
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Last name
                    </label>
                    <input
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      name="email"
                      ref={emailRef}
                      value={profile.email}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      type="email"
                    />
                    {emailError && (
                      <p className="mt-1 text-xs text-red-500">{emailError}</p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={profile.phone}
                      readOnly
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-slate-500 shadow-inner"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      State
                    </label>
                    <Select
                      value={selectedStateId}
                      onValueChange={(val) => setSelectedStateId(val)}
                    >
                      <SelectTrigger
                        id="state"
                        className="rounded-xl border-2 border-slate-200 bg-white/80 focus:ring-2 focus:ring-blue-100"
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
                    <label className="text-sm font-medium text-slate-700">
                      City
                    </label>
                    <Select
                      value={cityId}
                      onValueChange={(val) => setCityId(val)}
                      disabled={!selectedStateId || cityLoading}
                    >
                      <SelectTrigger
                        id="city"
                        className="rounded-xl border-2 border-slate-200 bg-white/80 focus:ring-2 focus:ring-blue-100"
                      >
                        {cityLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

              <CardFooter className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="min-w-[150px] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition hover:shadow-xl disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 text-slate-600 shadow-sm hover:text-slate-800"
                >
                  Cancel
                </Button>
              </CardFooter>
              </Card>
            </div>
          </div>

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
        </div>
      )}
    </div>
  );
};

export default Profile;
