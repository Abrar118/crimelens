"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Siren } from "lucide-react";
import { getDivisionsWithDistricts } from "@/lib/get-division-info";
import { generateImageDescription } from "@/lib/ai-generate";
import { useState } from "react";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { TiptapEditor } from "@/components/tiptap-editor";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  image: z
    .any()
    .refine((files: FileList) => files?.length > 0, "Image is required."),
  video: z.any().optional(),
  division: z.string({
    required_error: "Please select a division.",
  }),
  district: z.string({
    required_error: "Please select a district.",
  }),
  crimeTime: z.string({
    required_error: "Please select the time of the crime.",
  }),
});

const divisions = getDivisionsWithDistricts().map((division) => division.name);
const districts = getDivisionsWithDistricts().reduce((acc, division) => {
  acc[division.name] = division.districts.map((district) => district.name);
  return acc;
}, {} as Record<string, string[]>);

export default function ReportCrime() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { role } = useAuth();

  async function uploadFile(file: File): Promise<string> {
    const token = await auth.currentUser?.getIdToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/v1/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    const { url } = await response.json();
    return url;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.info("Uploading files...");
      const imageUrls: string[] = [];

      if (values.image) {
        for (let i = 0; i < values.image.length; i++) {
          const url = await uploadFile(values.image[i]);
          imageUrls.push(url);
        }
      }

      let videoUrl: string | undefined;
      if (values.video?.[0]) {
        videoUrl = await uploadFile(values.video[0]);
      }

      await apiClient.post("/posts", {
        title: values.title,
        description,
        division: values.division,
        district: values.district,
        crime_time: values.crimeTime,
        images: imageUrls,
        video: videoUrl,
        is_anonymous: isAnonymous,
      });

      toast.success("Report submitted successfully.");
      form.reset();
      setDescription("");
      setIsAnonymous(false);
    } catch (error) {
      toast.error("Failed to submit report");
    }
  }

  const handleGenerateAIDescription = async () => {
    const file = form.getValues("image")[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string).split(",")[1];
      const response = await generateImageDescription(base64Data, file.type);
      setDescription(`<p>${response}</p>`);
    };
    reader.readAsDataURL(file);
  };

  if (role === "unverified") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-destructive">Access Restricted</h2>
          <p className="text-muted-foreground">
            Verify your account to report crimes. Complete phone verification to unlock this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background">
      <div className="flex items-center justify-center space-x-2 mb-6">
        <Siren className="h-6 w-6 text-destructive" />
        <h1 className="text-2xl font-semibold">Report a Crime</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crime Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter crime title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* if the image is availabe then show it in a tag */}
            {form.watch("image") && (
              <img
                src={URL.createObjectURL(form.watch("image")[0])}
                alt="Crime"
                className="w-full h-48 object-cover rounded-md"
              />
            )}

            {/* Description of the image when AI generate button is clicked */}
            {description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Description (AI-generated, editable)</label>
                <TiptapEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Crime description..."
                />
              </div>
            )}

            {/* if the video is availabe then show it in a tag */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload Video (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateAIDescription}
            className="w-full md:w-auto"
          >
            Generate AI Description
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Division</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {divisions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select District</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {form.watch("division") &&
                        districts[
                          form.watch("division") as keyof typeof districts
                        ]?.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="crimeTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crime Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-muted-foreground">
              Post anonymously (your identity will be hidden)
            </label>
          </div>

          <Button type="submit" className="w-full">
            Submit Report
          </Button>
        </form>
      </Form>
    </div>
  );
}
