import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Phone, Mail, Building, Star, Calendar } from "lucide-react";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { Loader2 } from "lucide-react";

interface Builder {
  builderId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  logoUrl: string;
  isActive: boolean;
}

const GetBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { builderId } = useParams();
  
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (builderId) {
      fetchBuilder();
    }
  }, [builderId]);

  const fetchBuilder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post("/api/Builder/GetBuilders", {
        BuilderId: builderId
      });

      if (response.data.statusCode === 200 && response.data.data.length > 0) {
        setBuilder(response.data.data[0]);
      } else {
        setError("Builder not found");
      }
    } catch (error: any) {
      console.error("Error fetching builder:", error);
      setError("Failed to load builder information");
      toast({
        title: "Error",
        description: "Failed to load builder information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading builder information...</p>
        </div>
      </div>
    );
  }

  if (error || !builder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Builder Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The builder you're looking for doesn't exist."}</p>
            <Button 
              onClick={() => navigate(-1)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Builder Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Builder Header Card */}
        <Card className="mb-8 shadow-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  {builder.logoUrl ? (
                    <img
                      src={builder.logoUrl}
                      alt={`${builder.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="h-12 w-12 text-white/80" />
                  )}
                </div>
              </div>

              {/* Builder Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{builder.name}</h1>
                  <Badge 
                    variant={builder.isActive ? "default" : "secondary"}
                    className={builder.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
                  >
                    {builder.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-white/90 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-lg">{builder.address}, {builder.city}, {builder.state}</span>
                </div>

                <div className="flex flex-wrap items-center space-x-6 text-white/80">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{builder.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{builder.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Builder Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle className="flex items-center text-gray-800">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Get in touch with this builder
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{builder.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{builder.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{builder.address}</p>
                    <p className="text-sm text-gray-600">{builder.city}, {builder.state}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Builder Status */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
              <CardTitle className="flex items-center text-gray-800">
                <Star className="h-5 w-5 text-green-600 mr-2" />
                Builder Status
              </CardTitle>
              <CardDescription>
                Current status and information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <Badge 
                    variant={builder.isActive ? "default" : "secondary"}
                    className={builder.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
                  >
                    {builder.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Builder ID</span>
                  <span className="text-sm font-mono text-gray-900">{builder.builderId}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Location</span>
                  <span className="text-sm text-gray-900">{builder.city}, {builder.state}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(`/builderpost`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Building className="h-5 w-5 mr-2" />
            Post New Project
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(`/projects?builder=${builder.builderId}`)}
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Calendar className="h-5 w-5 mr-2" />
            View Projects
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetBuilder;
