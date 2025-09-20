import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeCanvas } from "qrcode.react";

const EventAddedList = () => {
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGifts, setSelectedGifts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (Array.isArray(res.data)) {
          setEventList(res.data);
        } else if (res.data.success && Array.isArray(res.data.data)) {
          setEventList(res.data.data);
        } else {
          toast.error("Unexpected response format for events");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.put(
        `/api/events/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setEventList((prev) =>
        prev.map((evt) => (evt._id === id ? res.data : evt))
      );
    } catch (error) {
      console.error(
        "Failed to update status:",
        error.response?.data || error.message
      );
      alert("Failed to update status");
    }
  };

  const handleEdit = (event) => {
    navigate("/admin_dashboard/eventaddform", { state: { event } });
  };

  const handleDelete = async (eventId) => {
    const eventToDelete = eventList.find((e) => e._id === eventId);
    if (!eventToDelete) return toast.error("Event not found");

    if (
      window.confirm(
        `Are you sure you want to delete "${eventToDelete.eventName}"?`
      )
    ) {
      try {
        const res = await axios.delete(`/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 || res.data.success) {
          setEventList((prev) => prev.filter((e) => e._id !== eventId));
          toast.success(`${eventToDelete.eventName} deleted successfully`);
        } else {
          toast.error(res.data.message || "Error deleting event");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error deleting event");
      }
    }
  };

  const openGiftDialog = (gifts) => {
    setSelectedGifts(gifts);
    setDialogOpen(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading events...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl w-full max-w-6xl mb-auto md:mb-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800">
            Event List
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead className="border-b bg-gray-100 dark:bg-gray-800 ">
              <tr className="text-gray-700 dark:text-gray-300 ">
                <th className="px-2 py-4 text-start">Event Name</th>
                <th className="px-2 py-4 text-start">Contact Person</th>
                <th className="px-2 py-4 text-start">Contact No</th>
                <th className="px-2 py-4 text-start">Function Name</th>
                <th className="px-2 py-4 text-start">Function Type</th>
                {/* <th className="px-2 py-4 text-start">Relation</th>
                <th className="px-2 py-4 text-start">Welcome Image</th> */}
                <th className="px-2 py-4 text-start">Agent</th>
                <th className="px-2 py-4 text-start">Gifts</th>
                <th className="px-2 py-4 text-center">Actions</th>
                <th className="px-2 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {eventList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    No events available
                  </td>
                </tr>
              ) : (
                eventList.map((event) => (
                  <tr
                    key={event._id}
                    className="border-b hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <td className="py-2 px-4">{event.eventName}</td>
                    <td className="py-2 px-4">{event.contactPerson}</td>
                    <td className="py-2 px-4">{event.contactNo}</td>
                    <td className="py-2 px-4">
                      {event.functionName} <br />
                      {event.guestFormUrl ? (
                        <div className="flex flex-col gap-2 items-center">
                          <a
                            href={event.guestFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Open Form
                          </a>
                          <QRCodeCanvas value={event.guestFormUrl} size={80} />
                        </div>
                      ) : (
                        <span className="text-gray-500">No link</span>
                      )}
                    </td>
                    <td className="py-2 px-4">{event.functionType}</td>
                    {/* <td className="py-2 px-4">
                      {event.relationEnabled
                        ? `Bride: ${event.brideName}, Groom: ${event.groomName}`
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4">
                      {event.welcomeImage ? (
                        <img
                          src={event.welcomeImage}
                          alt="Welcome"
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">No image</span>
                      )}
                    </td> */}
                    <td className="py-2 px-4">
                      {event.agentId?.name || "No agent"}
                    </td>
                    <td className="py-2">
                      {event.gifts && event.gifts.length > 0 ? (
                        <div className="flex flex-col items-center">
                          {event.gifts.slice(0, 1).map((gift) => (
                            <img
                              key={gift._id}
                              src={gift.giftImage}
                              alt={gift.giftName}
                              className="w-10 h-10 object-cover rounded-md"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ))}
                          {event.gifts.length > 1 && (
                            <Button
                              size="sm"
                              variant="link"
                              className={"px-0 text-blue-700"}
                              onClick={() => openGiftDialog(event.gifts)}
                            >
                              {" "}
                              +{event.gifts.length - 1} more
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No gifts</span>
                      )}
                    </td>
                    <td className="py-2 px-4 flex justify-center gap-2 items-center mt-1 align-middle">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(event)}
                        className="bg-blue-500 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(event._id)}
                        className="bg-red-500 text-white"
                      >
                        Delete
                      </Button>
                    </td>
                    <td className="py-2 px-4">
                      <Select
                        value={event.status}
                        onValueChange={(value) =>
                          handleStatusChange(event._id, value)
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Shadcn Dialog for Gifts */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-lg rounded-2xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className={"text-center text-2xl"}>Gifts</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
            {selectedGifts.map((gift) => (
              <div key={gift._id} className="text-center">
                <img
                  src={gift.giftImage}
                  alt={gift.giftName}
                  className="w-full h-28 object-contain rounded-lg"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                  {gift.giftName}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter className={"mx-auto items-center"}>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventAddedList;
