import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const GiftAddList = () => {
  const [giftList, setGiftList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGifts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/gifts", { withCredentials: true });

        if (Array.isArray(res.data)) {
          setGiftList(res.data);
        } else if (res.data.success && Array.isArray(res.data.data)) {
          setGiftList(res.data.data);
        } else if (res.data.success && Array.isArray(res.data.gifts)) {
          setGiftList(res.data.gifts);
        } else {
          toast.error("Unexpected response format");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching gifts");
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, []);

  const handleEdit = (gift) => {
    navigate(`/admin_dashboard/edit-gift/${gift._id}`, { state: { gift } });
  };

  const handleDelete = async (giftId) => {
    const giftToDelete = giftList.find((g) => g._id === giftId);

    if (!giftToDelete) {
      toast.error("Gift not found");
      return;
    }
    if (window.confirm("Are you sure you want to delete this gift?")) {
      try {
        const res = await axios.delete(`/api/gifts/${giftId}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setGiftList((prev) => prev.filter((gift) => gift._id !== giftId));
          toast.success(`${giftToDelete.giftName} deleted successfully`);
        } else {
          toast.error(res.data.message || "Error deleting gift");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error deleting gift");
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <Card className="border-slate-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 rounded-2xl w-full max-w-6xl bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800 dark:text-white">
            Gift List
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto px-4">
          <table className="w-full max-w-xl mx-auto border-collapse text-xs sm:text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-2 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  Gift Name
                </th>
                <th className="px-2 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  Gift Image
                </th>
                <th className="px-2 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {giftList.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    No Gifts available
                  </td>
                </tr>
              ) : (
                giftList.map((gift) => (
                  <tr
                    key={gift._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50 transition-colors duration-150"
                  >
                    <td className="py-2 px-4 text-center text-gray-900 dark:text-gray-100">
                      {gift.giftName}
                    </td>
                    <td className="py-2 px-4">
                      {gift.giftImage ? (
                        <img
                          src={gift.giftImage}
                          alt={gift.giftName}
                          className="h-12 w-12 ms-14 object-cover rounded border border-gray-200 dark:border-gray-600 shadow-sm"
                        />
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 block text-center">
                          No image
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 flex gap-2 justify-center items-center mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(gift)}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(gift._id)}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftAddList;
