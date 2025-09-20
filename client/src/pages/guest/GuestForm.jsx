import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { X, CheckCircle, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { guestSchema } from "@/validation/FormValidations";

const GuestForm = () => {
  const { eventId } = useParams();

  const [showAdModal, setShowAdModal] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [eventList, setEventList] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    giftOption: "",
    customMessage: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch event details
  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/events/public/${eventId}`);
      setEventData(res.data);
      setEventList(res.data ? [res.data] : []); 
      console.log(res.data);
      
    } catch (err) {
      console.error(err);
      toast.error("Error fetching event details");
      setEventList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (showAdModal) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setShowAdModal(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showAdModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await guestSchema.validate(formData, { abortEarly: false });

      if (!eventData || !eventId) {
        toast.error("No active event found.");
        setLoading(false);
        return;
      }

      const newOtp = generateOtp();
      const guestData = {
        ...formData,
        gifts: [formData.giftOption],
        otp: newOtp,
        eventId,
      };

      const res = await axios.post(
        `http://localhost:4000/api/guests/register`,
        guestData
      );

      if (res.data?.guest) {
        setShowThankYouModal(true);
        setFormData({
          name: "",
          mobile: "",
          giftOption: "",
          customMessage: "",
        });
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        const fieldErrors = {};
        err.inner.forEach(({ path, message }) => {
          if (path) fieldErrors[path] = message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(
          err.response?.data?.message ||
            "Error submitting your gift request. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 hero-section bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-md p-2 text-center mx-auto">
        <p
          className="max-w-md mx-auto text-5xl font-bold"
          style={{
            background: "linear-gradient(90deg, #FD0C6D, #9810FA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Moon Live Gifts
        </p>
      </div>

      <div className="max-w-md mx-auto mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
        <div className="px-6 py-8">
          <div className="text-center">
            <Gift className="mx-auto h-12 w-12 text-purple-600" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-200">
              Personalized Gift Entry
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get your Memorable Customized Printed Gifts instantly
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={
                  errors.name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mobile Number
              </label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                required
                maxLength={10}
                value={formData.mobile}
                onChange={handleInputChange}
                className={
                  errors.mobile
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }
              />
              {errors.mobile && (
                <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Gift Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Gift Type
              </label>

              <div className="grid grid-cols-3 gap-4">
                {eventList[0]?.gifts?.map((gift) => (
                  <div
                    key={gift._id}
                    className={`text-center p-2 rounded-lg cursor-pointer transition-all ${
                      formData.giftOption === gift._id
                        ? "border-2 border-purple-500 ring-2 ring-purple-300"
                        : "border border-gray-300 dark:border-gray-600"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        giftOption:
                          formData.giftOption === gift._id ? "" : gift._id,
                      }))
                    }
                  >
                    <img
                      src={gift.giftImage}
                      alt={gift.giftName}
                      className="w-full h-28 object-contain rounded-lg"
                      onClick={() => setModalImage(gift.giftImage)}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {gift.giftName}
                    </p>
                  </div>
                ))}
              </div>
              {errors.giftOption && (
                <p className="text-red-600 text-sm mt-1">{errors.giftOption}</p>
              )}
            </div>

            {/* Custom Message */}
            <div>
              <label
                htmlFor="customMessage"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Custom Message
              </label>
              <Input
                id="customMessage"
                name="customMessage"
                value={formData.customMessage}
                onChange={handleInputChange}
                maxLength={50}
                className={
                  errors.customMessage
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }
              />
              {errors.customMessage && (
                <p className="text-red-600 text-sm mt-1">{errors.customMessage}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Gift Request"}
            </Button>
          </form>
        </div>
      </div>

      {/* Ad Modal */}
      {showAdModal && eventList.length > 0 && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-90"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl md:max-w-[60%] w-full mx-4 transition-colors duration-300">
            <div className="absolute top-4 right-8">
              <button
                onClick={() => setShowAdModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close ad"
              >
                <X className="h-8 w-8 text-red-500 font-bold" />
              </button>
            </div>
            <div className="p-6 flex flex-col justify-center items-center">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center mb-4">
                Choose Your Gifts
              </h3>

              <img
                src={eventList[0]?.welcomeImage}
                alt={eventList[0]?.eventName || "Welcome"}
                className="w-full m-5 h-80 object-contain rounded-md mb-4"
              />

              <p className="text-gray-600 dark:text-gray-300 text-center font-medium">
                Closing in{" "}
                <span className="font-semibold text-red-500">{countdown}</span>{" "}
                second{countdown !== 1 && "s"}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transition-colors duration-300">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-200">
                Thank You!
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                A verification code has been sent to your WhatsApp number.
                Please show this code to collect your gift at the Gift Corner.
              </p>
              <button
                onClick={() => setShowThankYouModal(false)}
                className="mt-6 w-full py-2 px-4 rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestForm;
