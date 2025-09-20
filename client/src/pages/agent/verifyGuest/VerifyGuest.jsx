import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleCheckBig } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const VerifyGuest = () => {
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [validateOtp, setValidateOtp] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [guestData, setGuestData] = useState(null);
  const [verifiedCount, setVerifiedCount] = useState(0); 

  const token = localStorage.getItem("accessToken");
  const agentId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!agentId) return;
    setLoading(true);
    axios
      .get(`/api/events/active/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((res) => setAssignedEvents(res.data))
      .catch((err) => console.error("Error fetching events:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtpInput(value);
    setValidateOtp(value.length === 6 && selectedEventId);
  };

  const parseDate = (dateRaw) => {
    if (!dateRaw) return null;
    const d = new Date(dateRaw);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }; 
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return toast.error("Select an assigned event first!");
    if (otpInput.length !== 6) return toast.error("OTP must be 6 digits");

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/guests/verify-otp",
        { otp: otpInput, eventId: selectedEventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGuestData(res.data.guest);   
      setPopupOpen(true);  
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching guest data");
    } finally {
      setLoading(false);
    }
  };
 
  const handleConfirm = () => {
    toast.success(`Guest confirmed: ${guestData.name}`);
    setGuestData(null);
    setPopupOpen(false);
    setOtpInput("");
    setValidateOtp(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
          Verify Guest OTP
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-200">
              Select Assigned Event
            </Label>
            <Select onValueChange={setSelectedEventId} value={selectedEventId}>
              <SelectTrigger className="bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-800 dark:text-gray-200 w-full">
                <SelectValue placeholder="-- Select Event --" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {assignedEvents.length > 0 ? (
                  assignedEvents.map((event) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.eventName} - {parseDate(event.eventDate)}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    No assigned events
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-200" htmlFor="otp">
              OTP Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6 digit OTP"
              value={otpInput}
              onChange={handleOtpChange}
              maxLength={6}
              required
              className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border dark:border-gray-600"
            />
          </div>
          <Button
            type="submit"
            disabled={!validateOtp || loading}
            className="w-full hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
          >
            {loading ? "Fetching..." : "Verify OTP"} <CircleCheckBig />
          </Button>
        </form> 
      </div>

      {/* Single-step popup */}
      <Dialog open={popupOpen} onOpenChange={() => setPopupOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl mb-4 flex justify-center items-center gap-3">
              Guest Details
            </DialogTitle>
          </DialogHeader>

          {guestData && (
            <div className="space-y-2 text-center py-3">
              <div className="flex justify-center mb-2">
                <CircleCheckBig className="text-green-600 text-3xl" />
              </div>
              <p><strong>Name:</strong> {guestData.name}</p>
              <p><strong>Mobile No:</strong> {guestData.mobile}</p>
              {guestData.gifts ? (
                <div>
                  <strong>Gift:</strong> {guestData.gifts.giftName}
                </div>
              ) : (
                <p>No gifts assigned</p>
              )}
              <p><strong>Custom Message:</strong> {guestData.customMessage}</p>

              <Button className="mt-4 w-full" onClick={handleConfirm}>
                Confirm
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerifyGuest;
