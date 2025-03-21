import "./globals.css";
import { contractica, contractica_caps } from "./fonts";

export const metadata = {
  title: "IdeaRoom",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <body
        className={`bg-background ${contractica.variable} ${contractica_caps.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
