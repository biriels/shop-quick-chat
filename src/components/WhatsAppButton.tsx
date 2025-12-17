import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  productTitle?: string;
  size?: "default" | "sm" | "lg" | "xl";
  className?: string;
}

export const WhatsAppButton = ({
  phoneNumber,
  message,
  productTitle,
  size = "default",
  className = "",
}: WhatsAppButtonProps) => {
  const defaultMessage = productTitle
    ? `Hi! I'm interested in: ${productTitle}`
    : "Hi! I'm interested in your products.";
  
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <Button
      variant="whatsapp"
      size={size}
      className={className}
      onClick={() => window.open(whatsappUrl, "_blank")}
    >
      <MessageCircle className="h-5 w-5" />
      <span>WhatsApp</span>
    </Button>
  );
};
