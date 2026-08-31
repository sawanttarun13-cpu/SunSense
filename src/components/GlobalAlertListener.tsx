import { useEffect } from "react";
import { toast } from "sonner";
import { useSocketEvent } from "../hooks/useSocketEvent";

export function GlobalAlertListener() {
  useSocketEvent("alert:new", (alert: any) => {
    // Generate toast notification
    toast(alert.type.replace(/_/g, " "), {
      description: alert.message,
      duration: 5000,
      icon: "⚠️"
    });
  });
  
  return null;
}
