-- Create leads table to store detected buyer intent signals
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    fetched_content_id UUID REFERENCES public.fetched_content(id) ON DELETE CASCADE,
    source_id UUID REFERENCES public.sources(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    matched_keywords TEXT[] NOT NULL DEFAULT '{}',
    snippet TEXT NOT NULL,
    confidence_score NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new',
    notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for in-app alerts
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'lead',
    read BOOLEAN NOT NULL DEFAULT false,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alert settings table for user preferences
CREATE TABLE public.alert_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email_enabled BOOLEAN NOT NULL DEFAULT false,
    email_address TEXT,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
    whatsapp_number TEXT,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

-- Leads policies (admin only)
CREATE POLICY "Only admins can view leads"
ON public.leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert leads"
ON public.leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can update leads"
ON public.leads FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete leads"
ON public.leads FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Notifications policies (users see their own)
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Alert settings policies (users manage their own)
CREATE POLICY "Users can view their own alert settings"
ON public.alert_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert settings"
ON public.alert_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert settings"
ON public.alert_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger for alert_settings updated_at
CREATE TRIGGER update_alert_settings_updated_at
BEFORE UPDATE ON public.alert_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();