import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventSchema } from "@/validation/FormValidations";
import axios from "axios";
import { toast } from "sonner";
import EventDatePicker from "@/components/EventDatePicker";
import { useLocation, useNavigate } from "react-router-dom";

export default function EventAddForm() {
  const [formData, setFormData] = useState({
    eventName: "",
    contactPerson: "",
    contactNo: "",
    functionName: "",
    functionType: "",
    relationEnabled: false,
    brideName: "",
    groomName: "",
    agentId: "",
    welcomeImage: null,
    gifts: [],
  });
  const [gifts, setGifts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedEvent, setSavedEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [date, setDate] = useState(null);
  const location = useLocation();
  const editingEvent = location.state?.event || null;
  const navigate = useNavigate();

  // Fetch gifts
  const fetchGifts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/gifts", { withCredentials: true });
      // console.log("API gift list response:", res.data);

      if (Array.isArray(res.data)) {
        setGifts(res.data);
      } else if (res.data.success && Array.isArray(res.data.data)) {
        setGifts(res.data.data);
      } else if (res.data.success && Array.isArray(res.data.gifts)) {
        setGifts(res.data.gifts);
      } else {
        toast.error("Unexpected response format for gifts");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching gifts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.get("/api/users?page=1&role=agent", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // console.log("API agent list response:", res.data);

      if (Array.isArray(res.data)) {
        setAgents(res.data);
      } else if (Array.isArray(res.data.users)) {
        setAgents(res.data.users);
      } else if (res.data.success && Array.isArray(res.data.agents)) {
        setAgents(res.data.agents);
      } else {
        toast.error("Unexpected response format for agents");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // Run both fetch on mount
  useEffect(() => {
    fetchGifts();
    fetchAgents();
  }, []);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        eventName: editingEvent.eventName || "",
        contactPerson: editingEvent.contactPerson || "",
        contactNo: editingEvent.contactNo || "",
        functionName: editingEvent.functionName || "",
        functionType: editingEvent.functionType || "",
        relationEnabled: editingEvent.relationEnabled || false,
        brideName: editingEvent.brideName || "",
        groomName: editingEvent.groomName || "",
        welcomeImage: null,
        agentId: editingEvent.agentId?._id || editingEvent.agentId || "",
        gifts: editingEvent.gifts?.map((g) => g._id || g) || [],
      });
    }
  }, [editingEvent]);

  // Toggle gifts
  const toggleGift = (giftId) => {
    setFormData((prev) => {
      const alreadySelected = prev.gifts.includes(giftId);
      return {
        ...prev,
        gifts: alreadySelected
          ? prev.gifts.filter((id) => id !== giftId)
          : [...prev.gifts, giftId],
      };
    });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const token = localStorage.getItem("accessToken");
    const validatedData = { ...formData, eventDate: date };

    try {
      // Use Yup default abortEarly (true), which throws after the first error only
      await eventSchema.validate(validatedData, { abortEarly: false });

      // --- proceed only if no validation errors ---
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => fd.append(key, v));
        } else if (value !== null && value !== undefined) {
          fd.append(key, value);
        }
      });
      // format date
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      fd.append("eventDate", `${yyyy}-${mm}-${dd}`);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id}`, fd, config);
        toast.success("Event updated");
      } else {
        const res = await axios.post("/api/events", fd, config);
        setSavedEvent(res.data);
        setShowPopup(true);
        toast.success("Event created");
      }

      setFormData({
        eventName: "",
        contactPerson: "",
        contactNo: "",
        functionName: "",
        functionType: "",
        relationEnabled: false,
        brideName: "",
        groomName: "",
        agentId: "",
        welcomeImage: null,
        gifts: [],
      });
      setDate(null);
      setErrors({});
    } catch (err) {
      if (err.name === "ValidationError") {
        const newErrors = {};
        err.inner.forEach((e) => {
          if (!newErrors[e.path]) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
       // toast.error("Please fix the errors");
      } else {
        toast.error(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading gifts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800 dark:text-gray-200">
            Add Event
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            {/* Event Name */}
            <div className="grid gap-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                name="eventName"
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={(e) =>
                  setFormData({ ...formData, eventName: e.target.value })
                }
                
              />
            </div>
            {errors.eventName && (
              <p className="text-sm text-red-600">{errors.eventName}</p>
            )}

            {/* Contact Person */}
            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Contact Person Name</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="Enter contact person name"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                
              />
            </div>
            {errors.contactPerson && (
              <p className="text-sm text-red-600">{errors.contactPerson}</p>
            )}

            {/* Contact Number */}
            <div className="grid gap-2">
              <Label htmlFor="contactNo">Contact Number</Label>
              <Input
                id="contactNo"
                name="contactNo"
                placeholder="Enter contact number"
                value={formData.contactNo}
                maxLength={10}
                onChange={(e) =>
                  setFormData({ ...formData, contactNo: e.target.value })
                }
                
              />
            </div>
            {errors.contactNo && (
              <p className="text-sm text-red-600">{errors.contactNo}</p>
            )}

            {/* Function Name */}
            <div className="grid gap-2">
              <Label htmlFor="functionName">Function Name</Label>
              <Input
                id="functionName"
                name="functionName"
                placeholder="Enter function name"
                value={formData.functionName}
                onChange={(e) =>
                  setFormData({ ...formData, functionName: e.target.value })
                }
                
              />
            </div>
            {errors.functionName && (
              <p className="text-sm text-red-600">{errors.functionName}</p>
            )}

            {/* Function Type */}
            <div className="grid gap-2">
              <Label htmlFor="functionType">Function Type</Label>
              <Input
                id="functionType"
                name="functionType"
                placeholder="Enter function type"
                value={formData.functionType}
                onChange={(e) =>
                  setFormData({ ...formData, functionType: e.target.value })
                }
                
              />
            </div>
            {errors.functionType && (
              <p className="text-sm text-red-600">{errors.functionType}</p>
            )}

            {/* Relation */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 w-20 md:w-50">
                  <input
                    type="checkbox"
                    checked={formData.relationEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        relationEnabled: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm flex flex-wrap">
                    Relation (Bride & Groom)
                  </span>
                </label>
                {/* EventDatePicker */}
                <div className="flex gap-2 items-center  md:max-w-md">
                  <EventDatePicker value={date} onChange={setDate} />
                  
                </div>
                
              </div>
              {errors.eventDate && (
                    <p className="text-sm text-red-600">{errors.eventDate}</p>
                  )}

              {formData.relationEnabled && (
                <div className="grid gap-4 mt-2">
                  <div>
                    <Label htmlFor="brideName">Bride Name</Label>
                    <Input
                      id="brideName"
                      name="brideName"
                      placeholder="Enter bride name"
                      value={formData.brideName}
                      onChange={(e) =>
                        setFormData({ ...formData, brideName: e.target.value })
                      }
                    />
                  </div>
                  {errors.brideName && (
                    <p className="text-sm text-red-600">{errors.brideName}</p>
                  )}
                  <div>
                    <Label htmlFor="groomName">Groom Name</Label>
                    <Input
                      id="groomName"
                      name="groomName"
                      placeholder="Enter groom name"
                      value={formData.groomName}
                      onChange={(e) =>
                        setFormData({ ...formData, groomName: e.target.value })
                      }
                    />
                  </div>
                  {errors.groomName && (
                    <p className="text-sm text-red-600">{errors.groomName}</p>
                  )}
                </div>
              )}
            </div>

            {/* Welcome Image */}
            <div className="grid gap-2">
              <Label htmlFor="welcomeImage">Welcome Image</Label>
              <Input
                id="welcomeImage"
                name="welcomeImage"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, welcomeImage: e.target.files[0] })
                }
              />
            </div>
            {errors.welcomeImage && (
              <p className="text-sm text-red-600">{errors.welcomeImage}</p>
            )}

            {/* Agent */}
              <div className="grid gap-2">
                <Label>Agent Name</Label>
                <Select
                  value={formData.agentId || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, agentId: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.agentId && <p className="text-sm text-red-600">{errors.agentId}</p>}

            {/* Gifts */}
            <div className="grid gap-2">
              <Label>Gift Options</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {formData.gifts.length > 0
                      ? `${formData.gifts.length} selected`
                      : "Select gifts"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0">
                  <Command>
                    <CommandList>
                      {gifts.map((gift) => (
                        <CommandItem
                          key={gift._id}
                          onSelect={() => toggleGift(gift._id)}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={formData.gifts.includes(gift._id)}
                            readOnly
                          />
                          {gift.giftName}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {errors.gifts && <p className="text-sm text-red-600">{errors.gifts}</p>}

            <Button type="submit" className="w-full mt-5">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
