import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UploadCloud, Camera, MapPin, Send } from "lucide-react";

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Mymensingh",
  "Rangpur",
];
const districts = {
  Dhaka: ["Dhaka City", "Gazipur", "Narayanganj"],
  Chattogram: ["Chattogram City", "Cox’s Bazar", "Comilla"],
  Rajshahi: ["Rajshahi City", "Pabna", "Natore"],
  Khulna: ["Khulna City", "Jessore", "Satkhira"], 
  Barishal: ["Barishal City", "Patuakhali", "Bhola"],
  Sylhet: ["Sylhet City", "Habiganj", "Moulvibazar"],
  Mymensingh: ["Mymensingh City", "Jamalpur", "Sherpur"],
  Rangpur: ["Rangpur City", "Dinajpur", "Thakurgaon"],
};

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    division: "",
    district: "",
    crimeTime: "",
    image: null as File | null,
    video: null as File | null,
  });

  const [aiDescription, setAiDescription] = useState(""); // AI-generated description
  const [loadingAI, setLoadingAI] = useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [type]: file });
      toast.success(
        `${type === "image" ? "Image" : "Video"} uploaded successfully`
      );
    }
  };

  // Generate AI description
  const generateDescription = () => {
    if (!formData.image) {
      toast.error("Please upload an image first for AI description");
      return;
    }
    setLoadingAI(true);
    setTimeout(() => {
      setAiDescription(
        "AI-generated description: The image indicates a possible crime scene with unusual activities."
      );
      setLoadingAI(false);
      toast.success("AI-generated description added!");
    }, 2000); // Simulating AI response time
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.division ||
      !formData.district ||
      !formData.crimeTime
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Crime report submitted successfully!");
    console.log("Submitted Data:", formData);
  };

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-foreground text-center text-xl md:text-2xl">
              🚨 Report a Crime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <Label htmlFor="title">Crime Title</Label>
                <Input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="Enter crime title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 text-white border-gray-700"
                />
              </div>

              {/* Upload Image/Video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="image">Upload Image</Label>
                  <Input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                  <Button
                    type="button"
                    className="mt-2 flex items-center"
                    onClick={generateDescription}
                    disabled={loadingAI}
                  >
                    <UploadCloud className="mr-2" size={16} />{" "}
                    {loadingAI ? "Generating..." : "Generate AI Description"}
                  </Button>
                </div>

                {/* Video Upload */}
                <div>
                  <Label htmlFor="video">Upload Video (Optional)</Label>
                  <Input
                    type="file"
                    id="video"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, "video")}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
              </div>

              {/* AI Generated Description */}
              {aiDescription && (
                <div>
                  <Label>AI Generated Description</Label>
                  <Textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
              )}

              {/* Division & District Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Division */}
                <div>
                  <Label htmlFor="division">Select Division</Label>
                  <select
                    name="division"
                    id="division"
                    value={formData.division}
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white border-gray-700 p-2 rounded"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <Label htmlFor="district">Select District</Label>
                  <select
                    name="district"
                    id="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.division}
                    className="w-full bg-gray-800 text-white border-gray-700 p-2 rounded"
                  >
                    <option value="">Select District</option>
                    {formData.division &&
                      districts[
                        formData.division as keyof typeof districts
                      ]?.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Crime Time */}
              <div>
                <Label htmlFor="crimeTime">Crime Time</Label>
                <Input
                  type="datetime-local"
                  name="crimeTime"
                  id="crimeTime"
                  value={formData.crimeTime}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 text-white border-gray-700"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full flex items-center">
                <Send className="mr-2" size={18} /> Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportForm;
