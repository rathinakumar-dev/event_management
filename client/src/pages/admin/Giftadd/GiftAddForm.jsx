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
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center p-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl w-full max-w-md mb-auto md:mb-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800">
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
              <Label htmlFor="giftName">Gift Name</Label>
              <Input
                id="giftName"
                name="giftName"
                type="text"
                value={formData.giftName}
                onChange={handleInputChange}
                placeholder="Enter gift name"
                className={
                  errors.giftName ? "border-red-500" : "border-gray-500"
                }
              />
              {errors.giftName && (
                <p className="text-red-500 text-sm mt-1">{errors.giftName}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="giftImage">Gift Image</Label>
              <Input
                id="giftImage"
                name="giftImage"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className={
                  errors.giftImage ? "border-red-500" : "border-gray-500"
                }
              />
              {errors.giftImage && (
                <p className="text-red-500 text-sm mt-1">{errors.giftImage}</p>
              )}
              {currentImage && (
                <img
                  src={currentImage}
                  alt={formData.giftName || "Gift"}
                  className="mt-2 h-16 w-16 object-cover rounded"
                />
              )}
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
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
