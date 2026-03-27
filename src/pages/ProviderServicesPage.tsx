import { useEffect, useState } from "react";
import { providerApi } from "@/api/providerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
}

const categories = ["Plumbing", "Electrician", "Cleaning", "Carpentry", "Other"];

const ProviderServicesPage = () => {
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await providerApi.getMyServices();
      setServices(res.data.services || []);
    } catch {
      setServices([]);
    }
    setLoading(false);
  };

  // 🔥 ADD SERVICE (FIXED)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("PAYLOAD:", form); // 👈 DEBUG

    try {
      await providerApi.addService({
        title: form.title.trim(), // ✅ FIX
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        images: [],
        availability: [],
      });

      toast({ title: "Service added successfully 🎉" });

      setForm({ title: "", description: "", category: "", price: "" });
      setShowForm(false);
      fetchServices();

    } catch (err: any) {
      console.log("ERROR:", err?.response?.data);
      toast({
        title: "Failed to add service",
        description: err?.response?.data?.message || "Error",
        variant: "destructive",
      });
    }
  };

  // ✏ EDIT
  const handleEdit = (s: Service) => {
    setEditingService(s);
    setForm({
      title: s.title,
      description: s.description,
      category: s.category,
      price: String(s.price),
    });
  };

  // 🔄 UPDATE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      await providerApi.updateService(editingService._id, {
        title: form.title.trim(), // ✅ FIX
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
      });

      toast({ title: "Service updated ✨" });

      setEditingService(null);
      setForm({ title: "", description: "", category: "", price: "" });

      fetchServices();

    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  // ================= UI =================

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" className="h-6 w-6 text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Services</h2>

        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Service"}
        </Button>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-card border rounded-xl p-5 space-y-4">

          {/* TITLE */}
          <div>
            <Label>Service Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="e.g. Pipe Fixing"
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="w-full border rounded px-2 h-9 text-sm"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe your service..."
              required
            />
          </div>

          {/* PRICE */}
          <div>
            <Label>Price (₹)</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !form.title ||
              !form.description ||
              !form.category ||
              !form.price
            }
          >
            Add Service
          </Button>
        </form>
      )}

      {/* SERVICES LIST */}
      {services.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <Icon icon="solar:box-bold-duotone" className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p>No services yet</p>
        </div>
      ) : (
        services.map((s) => (
          <div key={s._id} className="border rounded-xl p-4 flex justify-between items-center">

            <div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <p className="text-sm font-bold mt-1">₹{s.price}</p>
            </div>

            <Button size="sm" onClick={() => handleEdit(s)}>
              Edit
            </Button>

          </div>
        ))
      )}

      {/* EDIT MODAL */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">

            <Input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            <Input
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              required
            />

            <Input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
            />

            <Button className="w-full">Update Service</Button>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProviderServicesPage;