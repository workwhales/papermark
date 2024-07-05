import { JSXElementConstructor, ReactElement } from "react";
import { Resend } from "resend";
import { log, nanoid } from "@/lib/utils";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendEmail = async ({
  to,
  subject,
  react,
  marketing,
  system,
  test,
  cc,
}: {
  to: string;
  subject: string;
  react: ReactElement<any, string | JSXElementConstructor<any>>;
  marketing?: boolean;
  system?: boolean;
  test?: boolean;
  cc?: string | string[];
}) => {
  if (!resend) {
    // Throw an error if resend is not initialized
    throw new Error("Resend not initialized");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: marketing
        ? "no-reply from work whales <info@workwhales.com>"
        : system
          ? "no-reply <info@workwhales.com>"
          : "no-reply <info@workwhales.com>",
      to: test ? "delivered@resend.dev" : to,
      cc: cc,
      reply_to: "no-reply <info@workwhales.com>",
      subject,
      react,
      headers: {
        "X-Entity-Ref-ID": nanoid(),
      },
    });

    // Check if the email sending operation returned an error and throw it
    if (error) {
      log({
        message: `Resend returned error when sending email: ${error.name} \n\n ${error.message}`,
        type: "error",
        mention: true,
      });
      throw error;
    }

    // If there's no error, return the data
    return data;
  } catch (exception) {
    // Log and rethrow any caught exceptions for upstream handling
    log({
      message: `Unexpected error when sending email: ${exception}`,
      type: "error",
      mention: true,
    });
    throw exception; // Rethrow the caught exception
  }
};