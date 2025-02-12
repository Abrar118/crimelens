import emailjs from "@emailjs/browser";
import { toast } from "sonner";

async function sendEmail(
  email_from: string,
  email_to: string,
  from_name: string,
  message_body: string
) {
  const form = {
    from_email: email_from,
    from_name: from_name,
    to_email: email_to,
    message: message_body,
  };

  try {
    const response = await emailjs.send(
      "service_3fy6krw",
      "template_beimqbq",
      form,
      "E3-0vUQPbmVnJDhAa"
    );

    if (response.status === 200) {
      toast.success("Email sent successfully");
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error: any) {
    throw new Error(error.text);
  }
}

export { sendEmail };
