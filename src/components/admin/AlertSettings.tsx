import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, MessageSquare, Bell, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AlertSettingsData {
  id?: string;
  email_enabled: boolean;
  email_address: string;
  whatsapp_enabled: boolean;
  whatsapp_number: string;
  in_app_enabled: boolean;
}

export const AlertSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AlertSettingsData>({
    email_enabled: false,
    email_address: "",
    whatsapp_enabled: false,
    whatsapp_number: "",
    in_app_enabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("alert_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          email_enabled: data.email_enabled,
          email_address: data.email_address || "",
          whatsapp_enabled: data.whatsapp_enabled,
          whatsapp_number: data.whatsapp_number || "",
          in_app_enabled: data.in_app_enabled,
        });
      }
    } catch (error) {
      console.error("Failed to fetch alert settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        email_enabled: settings.email_enabled,
        email_address: settings.email_address || null,
        whatsapp_enabled: settings.whatsapp_enabled,
        whatsapp_number: settings.whatsapp_number || null,
        in_app_enabled: settings.in_app_enabled,
      };

      if (settings.id) {
        const { error } = await supabase
          .from("alert_settings")
          .update(payload)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("alert_settings")
          .insert(payload);
        if (error) throw error;
      }

      toast.success("Alert settings saved!");
      await fetchSettings();
    } catch (error) {
      console.error("Failed to save alert settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Alert Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure how you want to be notified when new leads are detected
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* In-App Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">In-App</CardTitle>
              </div>
              <Switch
                checked={settings.in_app_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, in_app_enabled: checked })
                }
              />
            </div>
            <CardDescription>
              Get notified in the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notifications appear in the bell icon in the header when you're logged in.
            </p>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Email</CardTitle>
              </div>
              <Switch
                checked={settings.email_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, email_enabled: checked })
                }
              />
            </div>
            <CardDescription>
              Receive email alerts for new leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={settings.email_address}
                onChange={(e) =>
                  setSettings({ ...settings, email_address: e.target.value })
                }
                disabled={!settings.email_enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base">WhatsApp</CardTitle>
              </div>
              <Switch
                checked={settings.whatsapp_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, whatsapp_enabled: checked })
                }
              />
            </div>
            <CardDescription>
              Get WhatsApp messages for new leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+234 801 234 5678"
                value={settings.whatsapp_number}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_number: e.target.value })
                }
                disabled={!settings.whatsapp_enabled}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +234)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Settings
      </Button>
    </div>
  );
};
