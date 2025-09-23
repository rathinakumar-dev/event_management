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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-black/30">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Verify Guest OTP
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <Label className="block text-gray-700 dark:text-gray-300 mb-2">
              Select Assigned Event
            </Label>
            <Select onValueChange={setSelectedEventId} value={selectedEventId}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white w-full">
                <SelectValue placeholder="-- Select Event --" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                {assignedEvents.length > 0 ? (
                  assignedEvents.map((event) => (
                    <SelectItem
                      key={event._id}
                      value={event._id}
                      className="text-left px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {event.eventName} - {parseDate(event.eventDate)}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                    No assigned events
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              className="block text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="otp"
            >
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
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 w-full px-4 py-2 rounded"
            />
          </div>
          <Button
            type="submit"
            disabled={!validateOtp || loading}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex justify-center items-center gap-2"
          >
            {loading ? "Fetching..." : "Verify OTP"} <CircleCheckBig />
          </Button>
        </form>
      </div>

      {/* Single-step popup */}
      <Dialog open={popupOpen} onOpenChange={() => setPopupOpen(false)}>
        <DialogContent className="sm:max-w-md max-w-xs bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl mb-4 flex justify-center items-center gap-3 text-gray-800 dark:text-white">
              Guest Details
            </DialogTitle>
          </DialogHeader>
          {guestData && (
            <div className="space-y-2 text-center py-3">
              <div className="flex justify-center mb-2">
                <CircleCheckBig className="text-green-600 dark:text-green-400 text-3xl" />
              </div>
              <p className="text-gray-800 dark:text-gray-100">
                <strong>Name:</strong> {guestData.name}
              </p>
              <p className="text-gray-800 dark:text-gray-100">
                <strong>Mobile No:</strong> {guestData.mobile}
              </p>
              {guestData.gifts ? (
                <div>
                  <strong className="text-gray-800 dark:text-gray-100">
                    Gift:
                  </strong>{" "}
                  {guestData.gifts.giftName}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No gifts assigned
                </p>
              )}
              <p className="text-gray-800 dark:text-gray-100">
                <strong>Custom Message:</strong> {guestData.customMessage}
              </p>
              <Button
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                onClick={handleConfirm}
              >
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
