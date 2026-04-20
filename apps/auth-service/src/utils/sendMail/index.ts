import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

//Render EJS template
const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        "apps",
        "auth-service",
        "src",
        "utils",
        "email-templates",
        `${templateName}.ejs`
    );
    return await ejs.renderFile(templatePath, data);
}

//Send an email using nodemailer
export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        // console.log("stage 2 completed")
        // console.log("from : ", process.env.SMTP_USER)
        // console.log("to : ", to)
        // console.log("subject : ", subject)
        // console.log("templateName : ", templateName)
        // console.log("data : ", data)
        const html = await renderEmailTemplate(templateName, data);
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html,
        });
        return true
    } catch (error) {
        console.log("Error sending email:", error);
        return false
    }
}