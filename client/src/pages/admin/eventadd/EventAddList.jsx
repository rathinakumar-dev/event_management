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
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <Card className="border-slate-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 rounded-2xl max-w-90  md:max-w-5xl mb-auto md:mb-0 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800 dark:text-white">
            Event List
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto relative">
          <table className="min-w-max border-collapse text-xs sm:text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-2 py-4  text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Event Name
                </th>
                <th className="px-2 py-4 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Contact Person
                </th>
                <th className="px-2 py-4 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Contact No
                </th>
                <th className="px-2 py-4 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Function Name
                </th>
                <th className="px-2 py-4 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Function Type
                </th>
                <th className="px-2 py-4 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Agent
                </th>
                <th className="px-2 py-4 text-center font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Gifts
                </th>
                <th className="px-2 py-4 text-center font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Actions
                </th>
                <th className="px-2 py-4 text-center font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {eventList.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-4 text-gray-500 dark:text-gray-400 align-middle whitespace-nowrap"
                  >
                    No events available
                  </td>
                </tr>
              ) : (
                eventList.map((event) => (
                  <tr
                    key={event._id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                  >
                    <td className="py-2 px-4 text-left align-middle text-gray-900 dark:text-gray-100  break-all max-w-[120px]">
                      {event.eventName}
                    </td>
                    <td className="py-2 px-4 text-left align-middle text-gray-900 dark:text-gray-100 whitespace-nowrap break-all">
                      {event.contactPerson}
                    </td>
                    <td className="py-2 px-4 text-left align-middle text-gray-900 dark:text-gray-100 whitespace-nowrap break-all">
                      {event.contactNo}
                    </td>
                    <td className="py-2 px-4 text-left align-middle text-gray-900 dark:text-gray-100 whitespace-nowrap break-all">
                      {event.functionName}
                      <br />
                      {event.guestFormUrl ? (
                        <div className="flex flex-col items-center gap-2 mt-2">
                          <a
                            href={event.guestFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors break-all"
                          >
                            Open Form
                          </a>
                          <div className="bg-white dark:bg-gray-700 p-1 rounded flex items-center justify-center">
                            <QRCodeCanvas
                              value={event.guestFormUrl}
                              size={80}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 block">
                          No link
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-left align-middle text-gray-900 dark:text-gray-100 whitespace-nowrap break-all">
                      {event.functionType}
                    </td>
                    <td className="py-2 px-4 text-left align-middle text-gray-900 dark:text-gray-100 whitespace-nowrap break-all">
                      {event.agentId?.name || "No agent"}
                    </td>
                    <td className="py-2 align-middle text-center whitespace-nowrap">
                      {event.gifts && event.gifts.length > 0 ? (
                        <div className="flex flex-col items-center justify-center">
                          {event.gifts.slice(0, 1).map((gift) => (
                            <img
                              key={gift._id}
                              src={gift.giftImage}
                              alt={gift.giftName}
                              className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-600 mb-1"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ))}
                          {event.gifts.length > 1 && (
                            <Button
                              size="sm"
                              variant="link"
                              className="px-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              onClick={() => openGiftDialog(event.gifts)}
                            >
                              +{event.gifts.length - 1} more
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm block">
                          No gifts
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 align-middle text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2 items-center">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(event)}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium px-3 py-1 rounded-md transition-colors duration-200"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(event._id)}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium px-3 py-1 rounded-md transition-colors duration-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                    <td className="py-2 px-4 align-middle text-center whitespace-nowrap">
                      <Select
                        value={event.status}
                        onValueChange={(value) =>
                          handleStatusChange(event._id, value)
                        }
                      >
                        <SelectTrigger className="w-28 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white mx-auto">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                          <SelectItem
                            value="pending"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
                          >
                            Pending
                          </SelectItem>
                          <SelectItem
                            value="active"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
                          >
                            Active
                          </SelectItem>
                          <SelectItem
                            value="completed"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-center"
                          >
                            Completed
                          </SelectItem>
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

      {/* Gifts Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-lg rounded-2xl [&>button]:hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-gray-800 dark:text-white">
              Gifts
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
            {selectedGifts.map((gift) => (
              <div
                key={gift._id}
                className="text-center flex flex-col items-center justify-center"
              >
                <img
                  src={gift.giftImage}
                  alt={gift.giftName}
                  className="w-full h-28 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                  {gift.giftName}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter className="mx-auto items-center">
            <Button
              onClick={() => setDialogOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventAddedList;
