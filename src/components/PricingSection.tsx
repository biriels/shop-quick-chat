import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: ["1 Business listing", "5 Posts per month", "Basic analytics", "WhatsApp integration"],
    popular: false,
  },
  {
    name: "Basic",
    price: "29",
    description: "Great for growing businesses",
    features: ["3 Business listings", "Unlimited posts", "Advanced analytics", "Priority support", "Featured placement"],
    popular: true,
  },
  {
    name: "Premium",
    price: "79",
    description: "For established enterprises",
    features: ["Unlimited listings", "Unlimited posts", "Premium analytics", "24/7 support", "Top placement", "Custom branding", "API access"],
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h3 className="font-display text-2xl font-bold mb-2">Choose Your Plan</h3>
        <p className="text-muted-foreground">Scale your business with the right plan</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in group ${
              plan.popular
                ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                : "border-border hover:border-primary/50"
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold font-display transition-transform duration-300 group-hover:scale-110">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm animate-fade-in"
                    style={{ animationDelay: `${(index * 150) + (featureIndex * 50)}ms` }}
                  >
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className={`w-full transition-all duration-300 ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
                variant={plan.popular ? "default" : "secondary"}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
