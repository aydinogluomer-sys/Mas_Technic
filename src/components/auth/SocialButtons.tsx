import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon, LinkedInIcon } from "./SocialIcons";

interface SocialButtonsProps {
  socialLoading: string | null;
  onSocial: (provider: "google" | "linkedin_oidc") => void;
}

export const SocialButtons = ({ socialLoading, onSocial }: SocialButtonsProps) => (
  <div className="grid grid-cols-2 gap-3">
    <Button
      variant="outline"
      className="h-12 gap-2.5 font-medium text-sm"
      onClick={() => onSocial("google")}
      disabled={!!socialLoading}
    >
      {socialLoading === "google" ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <GoogleIcon className="w-5 h-5" />
      )}
      Google
    </Button>
    <Button
      variant="outline"
      className="h-12 gap-2.5 font-medium text-sm"
      onClick={() => onSocial("linkedin_oidc")}
      disabled={!!socialLoading}
    >
      {socialLoading === "linkedin_oidc" ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LinkedInIcon className="w-5 h-5" />
      )}
      LinkedIn
    </Button>
  </div>
);
