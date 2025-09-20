import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    // .matches(
    //   /^[a-zA-Z0-9_]+$/,
    //   "Username can only contain letters, numbers, and underscores"
    // )
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),

  password: Yup.string()
    .required("Password is required")
    .min(3, "Password must be at least 6 characters"),
  // .matches(/[0-9]/, "Password must contain at least one number"),
});

export const giftSchema = Yup.object().shape({
  giftName: Yup.string()
    .required("Gift name is required")
    .min(3, "Gift name must be at least 3 characters"),
  giftImage: Yup.mixed()
    .required("Gift image is required")
    .test(
      "fileSize",
      "File is too large (max 2MB)",
      (value) => !value || (value.size && value.size <= 2 * 1024 * 1024)
    )
    .test(
      "fileType",
      "Unsupported file type (jpg, png, gif only)",
      (value) =>
        !value ||
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          value.type
        )
    ),
});

export const userSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),

  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),

  password: Yup.string()
    .required("Password is required")
    .min(3, "Password must be at least 6 characters")
    .matches(/[0-9]/, "Password must contain at least one number"),
});

export const eventSchema = Yup.object().shape({
  eventName: Yup.string()
    .required("Event name is required")
    .min(3, "Event name must be at least 3 characters"),

  contactPerson: Yup.string()
    .required("Contact person is required")
    .min(3, "Contact person name must be at least 3 characters"),

  contactNo: Yup.string()
    .required("Contact number is required")
    .matches(/^\+?[0-9\s\-]{7,15}$/, "Contact number is not valid"),

  functionName: Yup.string()
    .required("Function name is required")
    .min(3, "Function name must be at least 3 characters"),

  functionType: Yup.string()
    .required("Function type is required")
    .min(3, "Function type must be at least 3 characters"),

  relationEnabled: Yup.boolean(),

  brideName: Yup.string().when("relationEnabled", {
    is: true,
    then: (schema) =>
      schema
        .required("Bride name is required")
        .min(3, "Bride name must be at least 3 characters"),
    otherwise: (schema) => schema.nullable(),
  }),

  groomName: Yup.string().when("relationEnabled", {
    is: true,
    then: (schema) =>
      schema
        .required("Groom name is required")
        .min(3, "Groom name must be at least 3 characters"),
    otherwise: (schema) => schema.nullable(),
  }),

  agentId: Yup.string().required("Agent is required").nullable(),

  welcomeImage: Yup.mixed()
    .nullable()
    .required("Welcome image is required")
    .test(
      "fileSize",
      "File is too large (max 2MB)",
      (value) => !value || (value.size && value.size <= 2 * 1024 * 1024)
    )
    .test(
      "fileType",
      "Unsupported file type (jpg, png, gif, webp only)",
      (value) =>
        !value ||
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          value.type
        )
    ),

  gifts: Yup.array()
    .of(Yup.string().required("Gift  is required"))
    .min(1, "At least one gift is required"),

  eventDate: Yup.date()
    .required("Event date is required")
    .typeError("Event date must be valid"),
});

export const guestSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),

  mobile: Yup.string()
    .required("Mobile number is required")
    .matches(/^\+?[0-9\s\-]{7,10}$/, "Mobile number is invalid"),

  giftOption: Yup.string().required("Gift option is required"),

  customMessage: Yup.string()
    .nullable()
    .max(50, "Custom message cannot exceed 50 characters"),
});

export const otpSchema = Yup.object().shape({
  otpInput: Yup.string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
});
