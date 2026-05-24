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

  const [description, setDescription] = useState<string | undefined>();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await apiClient.post("/posts", values);
    toast.success("Report submitted successfully.");
    form.reset();
  }

  const handleGenerateAIDescription = async () => {
    const file = form.getValues("image")[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string).split(",")[1];
      const response = await generateImageDescription(base64Data, file.type);
      setDescription(response);
    };
    reader.readAsDataURL(file);
  };

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
              <div className="bg-gray-100 p-4 rounded-md">
                <p>{description}</p>
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

          <Button type="submit" className="w-full">
            Submit Report
          </Button>
        </form>
      </Form>
    </div>
  );
}
