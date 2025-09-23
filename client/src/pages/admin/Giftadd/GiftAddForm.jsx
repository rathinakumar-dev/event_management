import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { giftSchema } from "@/validation/FormValidations";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GiftAddForm = ({ editMode = false, initialData = null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentImage, setCurrentImage] = useState(
    initialData?.giftImage || null
  );
  const [formData, setFormData] = useState({
    giftName: "",
    giftImage: null,
  });

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        giftName: initialData.giftName || "",
        giftImage: null,
      });
      setCurrentImage(initialData.giftImage || null);
      setErrors({});
    }
  }, [editMode, initialData]);

  const handleInputChange = (e) => {
    const { name, type, value, files } = e.target;
    if (type === "file") {
      const file = files && files[0] ? files[0] : null;
      setFormData((prev) => ({ ...prev, [name]: file }));

      if (file) {
        setCurrentImage(URL.createObjectURL(file));
      } else if (editMode) {
        setCurrentImage(initialData?.giftImage || null);
      } else {
        setCurrentImage(null);
      }

      setErrors((prev) => ({ ...prev, [name]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate entire form against schema
      await giftSchema.validate(formData, { abortEarly: false });

      const fd = new FormData();
      fd.append("giftName", formData.giftName);
      if (formData.giftImage instanceof File) {
        fd.append("giftImage", formData.giftImage);
      }

      let res;
      if (editMode && initialData?._id) {
        res = await axios.put(`/api/gifts/${initialData._id}`, fd, {
          withCredentials: true,
        });
        const updatedGift = res.data?.gift;
        setCurrentImage(updatedGift?.giftImage || null);
        toast.success(`${formData.giftName} updated successfully!`);
        navigate(-1);
      } else {
        res = await axios.post("/api/gifts", fd, { withCredentials: true });
        const newGift = res.data?.gift;
        setCurrentImage(newGift?.giftImage || null);
        toast.success(
          `${newGift?.giftName || formData.giftName} added successfully!`
        );
      }

      // Reset form
      setFormData({ giftName: "", giftImage: null });
      const fileInput = document.getElementById("giftImage");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      if (err.name === "ValidationError") {
        // Map Yup errors to errors state for field level display
        const fieldErrors = {};
        err.inner.forEach((validationError) => {
          if (validationError.path) {
            fieldErrors[validationError.path] = validationError.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error(
          err.response?.data?.message || err.message || "Upload error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <Card className="border-slate-200 dark:border-gray-700 shadow-lg shadow-slate-200/40 dark:shadow-black/30 rounded-2xl w-full max-w-md mb-auto md:mb-0 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800 dark:text-white">
            {editMode ? "Update Gift Entry" : "Add Gift Entry"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid gap-5"
            encType="multipart/form-data"
          >
            <div className="grid gap-2">
              <Label
                htmlFor="giftName"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Gift Name
              </Label>
              <Input
                id="giftName"
                name="giftName"
                type="text"
                value={formData.giftName}
                onChange={handleInputChange}
                placeholder="Enter gift name"
                className={`bg-white dark:bg-gray-800 border text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 ${
                  errors.giftName
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.giftName && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.giftName}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="giftImage"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Gift Image
              </Label>
              <Input
                id="giftImage"
                name="giftImage"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className={`bg-white dark:bg-gray-800 border text-gray-900 dark:text-white 
                file:mr-4 file:px-4 file:rounded-md file:border-0 
                file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 
                dark:file:bg-gray-800 dark:file:text-gray-300  
                 text-left flex items-center
    ${
      errors.giftImage
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600"
    }`}
              />

              {errors.giftImage && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.giftImage}
                </p>
              )}
              {currentImage && (
                <img
                  src={currentImage}
                  alt={formData.giftName || "Gift"}
                  className="mt-2 h-16 w-16 object-cover rounded border border-gray-200 dark:border-gray-600 shadow-sm"
                />
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? editMode
                  ? "Updating..."
                  : "Uploading..."
                : editMode
                ? "Update Gift"
                : "Add Gift"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftAddForm;
