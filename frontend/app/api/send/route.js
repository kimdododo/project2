import { EmailTemplate } from "../../../components/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const data = await resend.emails.send({
      from: "SupaNextTemplate <onboarding@resend.dev>", // 보내는 사람 이메일
      to: ["receiver@gmail.com"], // 받는 사람 이메일
      subject: "Hii This is title", // 제목
      react: EmailTemplate({ firstName: "John" }), // 이메일 내용
    });

    return Response.json(data);
  } catch (error) {
    return Response.json({ error });
  }
}
