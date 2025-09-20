import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import moment from "moment-timezone";

const VerifyGuestList = () => {
  const [verifyGuestList, setVerifyGuestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchGuests = async () => {
      if (!token) {
        setError("Authorization token not found!");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("/api/guests/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.guests)) {
          setVerifyGuestList(res.data.guests);
        } else {
          setError("Unexpected API response format");
          console.error("Unexpected API response:", res.data);
        }
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching guests:", err);
        setError("Error fetching guests");
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [token]);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write(`
      <html>
        <head> 
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; font-size: 12pt; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333333; padding: 6px 8px; font-size: 11pt; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body> 
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportExcel = () => {
    if (verifyGuestList.length === 0) {
      alert("No guest data available to export!");
      return;
    }

    const exportData = verifyGuestList.map((guest, index) => ({
      SNo: index + 1,
      Name: guest.name,
      Mobile: guest.mobile,
      Gift: guest.gifts ? guest.gifts.giftName : "No gifts assigned",
      Message: guest.customMessage || "",
      Status: guest.status || (guest.otpUsed ? "Claimed" : "Not Claimed"),
      CreatedAt: guest.createdAt || "",
      VerifiedAt: guest.verifiedAt || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Agent_Guest_List.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl w-full max-w-6xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800">
            Verified Guest Details
          </CardTitle>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
            <Button className="w-28" onClick={handlePrint}>
              Print
            </Button>
            <Button className="w-28" onClick={handleExportExcel}>
              Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent ref={printRef} className="overflow-x-auto">
          {loading && (
            <p className="text-center py-4 text-gray-500">
              Loading guest data...
            </p>
          )}
          {error && (
            <p className="text-center py-4 text-red-600 font-semibold">
              {error}
            </p>
          )}
          {!loading && !error && verifyGuestList.length === 0 && (
            <p className="text-center py-4 text-gray-500">
              No verified guests available
            </p>
          )}
          {!loading && !error && verifyGuestList.length > 0 && (
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead className="border-b bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="py-2 px-4 text-start">Name</th>
                  <th className="py-2 px-4 text-start">Mobile</th>
                  <th className="py-2 px-4 text-start">Gift Option</th>
                  <th className="py-2 px-4 text-start">Custom Message</th>
                  <th className="py-2 px-4 text-start">Gift Status</th>
                  <th className="py-2 px-4 text-start">Claimed At</th>
                </tr>
              </thead>
              <tbody>
                {verifyGuestList.map((guest, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <td className="py-2 px-4">{guest.name}</td>
                    <td className="py-2 px-4">{guest.mobile}</td>
                    <td className="py-2 px-4">
                      {guest.gifts ? guest.gifts.giftName : "No gifts assigned"}
                    </td>
                    <td className="py-2 px-4">{guest.customMessage || "-"}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        (guest.status ||
                          (guest.otpUsed ? "Claimed" : "Not Claimed")) ===
                        "Claimed"
                          ? "text-green-600 p-2"
                          : "text-red-600"
                      }`}
                    >
                      {guest.status ||
                        (guest.otpUsed ? "Claimed" : "Not Claimed")}
                    </td>
                    <td className={`py-2 px-4 font-semibold text-green-600`}>
                      {guest.otpUsed &&
                      (guest.verifiedAt || guest.updatedAt) ? (
                        <>
                          {moment(guest.verifiedAt || guest.updatedAt)
                            .tz("Asia/Kolkata")
                            .format("hh:mm:ss A")}
                          <br />
                          {moment(guest.verifiedAt || guest.updatedAt)
                            .tz("Asia/Kolkata")
                            .format("DD-MM-YYYY")}
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyGuestList;
