import { useState, useEffect } from "react";
import { Save, Truck, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsApi } from "@/services/supabase/settingsApi";

const AdminSettingsPage = () => {
  const [deliveryDhaka, setDeliveryDhaka] = useState(60);
  const [deliveryOutside, setDeliveryOutside] = useState(120);
  const [instructorSplit, setInstructorSplit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load current settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [deliveryData, revenueData] = await Promise.allSettled([
          settingsApi.getDeliveryCharges(),
          settingsApi.getRevenueSplit(),
        ]);
        if (deliveryData.status === "fulfilled" && deliveryData.value) {
          deliveryData.value.forEach((d) => {
            if (d.location_key === "dhaka") setDeliveryDhaka(d.charge);
            if (d.location_key === "outside") setDeliveryOutside(d.charge);
          });
        }
        if (revenueData.status === "fulfilled" && revenueData.value) {
          const pct = revenueData.value.instructor_percentage;
          if (pct !== undefined) setInstructorSplit(Number(pct));
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        settingsApi.updateDeliveryCharge("dhaka", Number(deliveryDhaka)),
        settingsApi.updateDeliveryCharge("outside", Number(deliveryOutside)),
        settingsApi.updateRevenueSplit(
          "instructor_percentage",
          String(instructorSplit),
        ),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black">Settings ⚙️</h1>
        <p className="text-muted-foreground text-sm">Platform configuration</p>
      </div>

      {/* Delivery Charges */}
      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Delivery Charges</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Inside Dhaka (৳)</Label>
            <Input
              type="number"
              value={deliveryDhaka}
              onChange={(e) => setDeliveryDhaka(e.target.value)}
              className="rounded-xl border-[2px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Outside Dhaka (৳)</Label>
            <Input
              type="number"
              value={deliveryOutside}
              onChange={(e) => setDeliveryOutside(e.target.value)}
              className="rounded-xl border-[2px]"
            />
          </div>
        </div>
      </div>

      {/* Revenue Split */}
      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-secondary" />
          <h2 className="font-bold text-lg">Revenue Split</h2>
        </div>
        <div className="space-y-2">
          <Label>Instructor Share (%)</Label>
          <Input
            type="number"
            max={100}
            min={0}
            value={instructorSplit}
            onChange={(e) => setInstructorSplit(e.target.value)}
            className="rounded-xl border-[2px] max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Platform keeps {100 - instructorSplit}%
          </p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl cartoon-shadow-sm"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {saved ? "Saved! ✓" : "Save Changes"}
      </Button>
    </div>
  );
};

export default AdminSettingsPage;
