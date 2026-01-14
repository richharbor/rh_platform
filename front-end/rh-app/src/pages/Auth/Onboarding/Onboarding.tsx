"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Download, Loader2, X, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  postStartOnboard,
  postAccountInfo,
  postDocuments,
  postAgreement,
  getOnboardingStatus,
  verifyOnboardingToken,
  postBusinessInfo,
  completeOnboarding,
} from "@/services/Auth/authServices";
import LoadingSpinner from "@/components/Common/LoadingSpinner/LoadingSpinner";
import {
  uploadDocumentFile,
  deleteDocumentFile,
  type UploadedFile,
} from "@/services/Auth/uploadServices";
import StateSelect from "./StateSelect";
import ValidationInput from "./ValidationInput";
import { ScrollArea } from "@/components/ui/scroll-area";

type DocsKey =
  | "cmlCopy"
  | "panCard"
  | "cancelCheque"
  | "signature"
  | "agreement";

type Referral = {
  referralName: string;
  designation: string;
  firmName: string;
  natureOfBusiness: string;
  entityType: "broker" | "wealth firm" | "institution" | "";
  contact: string;
  mailId: string;
  location: string;
  totalTradeExecution: string;
};

type FormDataState = {
  // Step 1
  accountType: string[];
  email: string;
  password: string;
  fullName: string;
  category: string;
  // Step 2
  name: string;
  state: string;
  aadharCard: string;
  panCard: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  country: string;
  addressState: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  zipCode: string;
  // Step 3 & 4
  documents: Record<DocsKey, File | null>;
  uploadedFiles: Record<DocsKey, UploadedFile | null>;
  referrals: Referral[];
};

const DEFAULT_STEPS = [
  "Account Setup",
  "Account Info",
  "Upload Documents",
  "Franchise Agreement",
  "Referrals",
  "Completed",
];

export default function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const steps = DEFAULT_STEPS;
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStepVisited, setMaxStepVisited] = useState<number>(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [err, setErrs] = useState<Record<string, string>>({});
  const route = useRouter();
  const [formData, setFormData] = useState<FormDataState>({
    // Step 1
    accountType: [],
    email: "",
    password: "",
    fullName: "",
    category: "",
    // Step 2
    name: "",
    state: "",
    aadharCard: "",
    panCard: "",
    mobile: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    country: "India",
    addressState: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    zipCode: "",
    // Step 3 & 4
    documents: {
      cmlCopy: null,
      panCard: null,
      cancelCheque: null,
      signature: null,
      agreement: null,
    },
    uploadedFiles: {
      cmlCopy: null,
      panCard: null,
      cancelCheque: null,
      signature: null,
      agreement: null,
    },
    referrals: Array(5)
      .fill(null)
      .map(() => ({
        referralName: "",
        designation: "",
        firmName: "",
        natureOfBusiness: "",
        entityType: "",
        contact: "",
        mailId: "",
        location: "",
        totalTradeExecution: "",
      })),
  });
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviterId, setInviterId] = useState<number | null>(null);
  const [franchiseId, setFranchiseId] = useState<number | null>(null);
  const [accountRoles, setAccountRoles] = useState<
    { id: string; name: string }[]
  >([]);

  const progress = useMemo(
    () => (currentStep / steps.length) * 100,
    [currentStep, steps.length]
  );

  useEffect(() => {
    // Check if user has existing onboarding application
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    setLoading(false);
  }, [currentStep]);

  const cookieToken = Cookies.get("authToken");

  useEffect(() => {
    setLoading(true);
    const tokenFromUrl = searchParams?.get("token");
    const franchiseIdFromUrl = searchParams?.get("franchiseId");

    // 1. Token flow
    if (tokenFromUrl) {
      const verifyToken = async () => {
        try {
          const res = await verifyOnboardingToken({ token: tokenFromUrl });
          console.log("Token verified:", res);

          if (res?.data?.partnerEmail) {
            setFormData((prev) => ({
              ...prev,
              email: res.data.partnerEmail,
              accountType: res.data.partnerRoles.map((r: any) => r.name),
            }));
            setInviteEmail(res.data.partnerEmail);
            setAccountRoles(res.data.partnerRoles);
          }

          setInviterId(res.data.inviterId);
          setFranchiseId(res.data.franchiseId || null);
        } catch (error: any) {
          console.error("Invalid or expired token:", error);
          toast.error("Invalid or expired invite link");
          router.replace("/auth/login");
        }
      };

      verifyToken();
      return;
    }

    // 2. Direct franchiseId flow
    if (franchiseIdFromUrl) {
      setFranchiseId(Number(franchiseIdFromUrl));
      setAccountRoles([{ id: "partner", name: "Partner" }]);
      setFormData((prev) => ({
        ...prev,
        accountType: ["partner"], // default role
      }));
    }
    setLoading(false);
  }, [searchParams, router]);

  const checkOnboardingStatus = async () => {
    setLoading(true);

    const token = Cookies.get("authToken");
    if (token) {
      try {
        const response = await getOnboardingStatus();
        //  store status in state
        console.log(response.status);
        setCurrentStatus(response.status);

        if (response.currentStep && response.currentStep != 6) {
          setCurrentStep(response.currentStep + 1);
          setMaxStepVisited(response.currentStep);
        } else if (response.currentStep === 6) {
          setIsCompleted(true);
        }

        if (response.completedSteps) {
          // store in state
          setCompletedSteps(response.completedSteps);
        }

        if (response.formData) {
          setFormData((prev) => ({
            ...prev,
            // Step 1
            email: response.formData.step1?.email || prev.email,
            fullName: response.formData.step1?.fullName || prev.fullName,
            accountType:
              response.formData.step1?.accountType || prev.accountType,
            category: response.formData.step1?.category || prev.category,

            // Step 2 (if API sends later)
            name: response.formData.step2?.name || prev.name,
            state: response.formData.step2?.state || prev.state,
            aadharCard: response.formData.step2?.aadharCard || prev.aadharCard,
            panCard: response.formData.step2?.panCard || prev.panCard,
            mobile: response.formData.step2?.mobile || prev.mobile,
            bankName: response.formData.step2?.bankName || prev.bankName,
            accountNumber:
              response.formData.step2?.accountNumber || prev.accountNumber,
            ifscCode: response.formData.step2?.ifscCode || prev.ifscCode,
            country: response.formData.step2?.country || prev.country,
            addressState:
              response.formData.step2?.addressState || prev.addressState,
            addressLine1:
              response.formData.step2?.addressLine1 || prev.addressLine1,
            addressLine2:
              response.formData.step2?.addressLine2 || prev.addressLine2,
            city: response.formData.step2?.city || prev.city,
            zipCode: response.formData.step2?.zipCode || prev.zipCode,
          }));
        }
      } catch (error) {
        console.log("No existing application");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNext = async () => {
    if (!isStepValid(currentStep)) return;
    if (currentStep < steps.length && isStepValid(currentStep)) {
      setLoading(true);
      try {
        // Call API based on current step
        if (currentStep === 1) {
          // await handleStep1Submit();
        } else if (currentStep === 2) {
          await handleStep2Submit();
        } else if (currentStep === 3) {
          await handleStep3Submit();
        } else if (currentStep === 4) {
          await handleStep4Submit();
        } else if (currentStep === 5) {
          await handleStep5Submit();
        }

        const next = currentStep + 1;
        setCurrentStep(next);
        setMaxStepVisited((prev) => Math.max(prev, next));
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  // const handleStep1Submit = async () => {
  //   try {
  //     const response = await postStartOnboard({
  //       email: formData.email,
  //       createdBy: inviterId!,
  //       password: formData.password,
  //       fullName: formData.fullName,
  //       accountType: formData.accountType,
  //       category: formData.category,
  //       franchiseId, //  include franchiseId in payload
  //     });

  //     Cookies.set("authToken", response.token);
  //     toast.success("Account created successfully!");
  //   } catch (error: any) {
  //     console.error("Onboarding error:", error);
  //     toast.error(error.response?.data?.error || "Failed to create account");
  //     throw error;
  //   }
  // };

  const handleStep2Submit = async () => {
    try {
      await postAccountInfo({
        name: formData.name,
        state: formData.state,
        aadharCard: formData.aadharCard,
        panCard: formData.panCard,
        mobile: formData.mobile,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        country: formData.country,
        addressState: formData.addressState,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        zipCode: formData.zipCode,
      });
      toast.success("Account information saved!");

    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.response?.data?.error || "Failed to Save information");
      throw error;
    }

  };

  const handleStep3Submit = async () => {
    try {
      const documentUrls: Record<string, string> = {};

      // Extract actual file URLs from uploadedFiles
      Object.entries(formData.uploadedFiles).forEach(
        ([key, uploadedFile]: [string, any]) => {
          if (uploadedFile && uploadedFile.fileUrl) {
            documentUrls[key] = uploadedFile.fileUrl;
          }
        }
      );

      console.log("[v0] Submitting document URLs:", documentUrls);

      await postDocuments({ documents: documentUrls });
      toast.success("Documents uploaded!");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.response?.data?.error || "Failed to upload documents");
      throw error;

    }
  };

  const handleStep4Submit = async () => {
    try {
      // Upload agreement and get URL
      const agreementUrl = "uploaded_agreement_url";

      await postAgreement({ agreementUrl });
      toast.success("Agreement saved!");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.response?.data?.error || "Failed to save agreement");
      throw error;

    }
  };

  const handleStep5Submit = async () => {
    try {
      // Filter out empty referrals
      const filledReferrals = formData.referrals.filter(
        (ref) => ref.referralName?.trim() !== ""
      );

      if (filledReferrals.length === 0) {
        toast.error("Please add at least one referral before proceeding.");
        return;
      }

      console.log("[v0] Submitting referrals:", filledReferrals);

      //  Call backend API for Step 5
      await postBusinessInfo({ businessInfo: filledReferrals });
      toast.success("Referrals saved successfully!");
      await completeOnboarding();
      toast.success("Application submitted for review!");
    } catch (error: any) {
      console.error("Error saving referrals:", error);
      toast.error("Failed to save referrals. Please try again.");
      throw error;
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    route.push("/");
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [uploading, setUploading] = useState<Record<DocsKey, boolean>>({
    cmlCopy: false,
    panCard: false,
    cancelCheque: false,
    signature: false,
    agreement: false,
  });

  const handleFileUpload = async (field: DocsKey, file: File | null) => {
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: null,
        },
      }));
      return;
    }

    // Set the file first
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file,
      },
    }));

    // Automatically start upload
    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      const uploadedFile = await uploadDocumentFile(file);
      console.log("[v0] Upload response:", uploadedFile);

      const fileData = {
        fileUrl: uploadedFile.fileUrl,
        fileName: file.name,
        fileSize: file.size,
        key: field, // Adding key property for debugging
        name: file.name, // Adding name property as alias
      };

      console.log("[v0] Storing file data:", fileData);

      setFormData((prev) => {
        const newFormData = {
          ...prev,
          uploadedFiles: {
            ...prev.uploadedFiles,
            [field]: fileData,
          },
          documents: {
            ...prev.documents,
            [field]: null, // Clear the file input after successful upload
          },
        };
        console.log(
          "[v0] New form data uploadedFiles:",
          newFormData.uploadedFiles
        );
        return newFormData;
      });
      toast.success("File uploaded successfully");
    } catch (error) {
      console.log("[v0] Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleUpload = async (field: DocsKey) => {
    const file = formData.documents[field];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [field]: true }));

    try {
      const uploadedFile = await uploadDocumentFile(file);
      setFormData((prev) => ({
        ...prev,
        uploadedFiles: {
          ...prev.uploadedFiles,
          [field]: uploadedFile,
        },
        documents: {
          ...prev.documents,
          [field]: null, // Clear the file input after successful upload
        },
      }));
    } catch (error) {
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleDelete = async (field: DocsKey) => {
    const uploadedFile = formData.uploadedFiles[field];
    if (!uploadedFile) return;

    try {
      await deleteDocumentFile({ key: uploadedFile.key });
      setFormData((prev) => ({
        ...prev,
        uploadedFiles: {
          ...prev.uploadedFiles,
          [field]: null,
        },
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  function isStrongPassword(password: string): boolean {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  const isIFSC = (val: string) => /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(val);
  const isAadhar = (val: string) => /^\d{12}$/.test(val.replace(/\s/g, ""));
  const isPAN = (val: string) =>
    /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(val.toUpperCase());
  const isMobile = (val: string) => /^\d{10}$/.test(val);
  const isPostalCode = (val: string) => /^\d{4,6}$/.test(val);

  function validateStep1(): boolean {
    const newErrors: Record<string, string> = {};

    if (formData.accountType.length === 0) {
      newErrors.accountType = "Select at least one account type";
    }
    if (!isEmail(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    const password = formData.password;
    const errors = [];

    if (password.length < 8) {
      errors.push("min. 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("min. 1 uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("min. 1 number");
    }
    if (!/[!@#$%^&*()_\-+=\[\]{};:'",.<>?/\\|`~]/.test(password)) {
      errors.push("min. 1 special character");
    }

    if (errors.length > 0) {
      newErrors.password = errors.join(", ");
    }
    if (formData.fullName.trim().length <= 2) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }
    if (formData.category.length === 0) {
      newErrors.category = "Category is required";
    }

    setErrs(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Step 2 validation
  function validateStep2(): boolean {
    const newErrors: Record<string, string> = {};

    if (formData.name.trim().length <= 1) newErrors.name = "Name is required";
    if (formData.state.trim().length === 0)
      newErrors.state = "State is required";
    if (formData.aadharCard.trim().length === 0)
      newErrors.aadharCard = "Aadhar is required";
    if (formData.panCard.trim().length === 0) newErrors.panCard = "PAN is required";
    if (formData.mobile.trim().length === 0)
      newErrors.mobile = "Mobile number is required";
    if (formData.bankName.trim().length === 0)
      newErrors.bankName = "Bank name is required";
    if (formData.accountNumber.trim().length === 0) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(formData.accountNumber.trim())) {
      newErrors.accountNumber = "Account number must contain only numbers";
    } else if (formData.accountNumber.trim().length < 8) {
      newErrors.accountNumber = "Account number must be at least 8 digits long";
    }
    if (formData.ifscCode.trim().length === 0) newErrors.ifscCode = "IFSC code is required";
    if (formData.country.trim().length === 0)
      newErrors.country = "Country is required";
    if (formData.addressState.trim().length === 0)
      newErrors.addressState = "State is required";
    if (formData.addressLine1.trim().length === 0)
      newErrors.addressLine1 = "Address Line 1 is required";
    if (formData.city.trim().length === 0) newErrors.city = "City is required";
    if (formData.zipCode.trim().length === 0)
      newErrors.zipCode = "Zip code is required";

    setErrs(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Step 3 validation
  function validateStep3(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.uploadedFiles.cmlCopy)
      newErrors.cmlCopy = "CML Copy is required";
    if (!formData.uploadedFiles.panCard)
      newErrors.panCard = "PAN Card is required";
    if (!formData.uploadedFiles.cancelCheque)
      newErrors.cancelCheque = "Cancel Cheque is required";
    if (!formData.uploadedFiles.signature)
      newErrors.signature = "Signature is required";

    setErrs(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Step 4 validation
  function validateStep4(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.uploadedFiles.agreement)
      newErrors.agreement = "Signed agreement is required";

    setErrs(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep5(): boolean {
    const newErrors: Record<string, string> = {};

    // Count filled referrals
    const filledReferrals = formData.referrals.filter(
      (ref) => ref.referralName.trim() !== ""
    );

    // Check if at least 3 referrals are filled
    if (filledReferrals.length < 3) {
      newErrors.referrals = `At least 3 referrals are required. You have filled ${filledReferrals.length}.`;
    }

    // Validate each filled referral
    filledReferrals.forEach((ref, index) => {
      if (ref.referralName.trim().length === 0) {
        newErrors[`referral_${index}_name`] = "Referral name is required";
      }
      if (ref.designation.trim().length === 0) {
        newErrors[`referral_${index}_designation`] = "Designation is required";
      }
      if (ref.firmName.trim().length === 0) {
        newErrors[`referral_${index}_firmName`] = "Firm name is required";
      }
      if (ref.natureOfBusiness.trim().length === 0) {
        newErrors[`referral_${index}_natureOfBusiness`] =
          "Nature of business is required";
      }
      if (ref.entityType === "") {
        newErrors[`referral_${index}_entityType`] = "Entity type is required";
      }
      if (ref.contact.trim().length === 0) {
        newErrors[`referral_${index}_contact`] = "Contact is required";
      } else if (!isMobile(ref.contact)) {
        newErrors[`referral_${index}_contact`] = "Contact must be 10 digits";
      }
      if (ref.mailId.trim().length === 0) {
        newErrors[`referral_${index}_mailId`] = "Email is required";
      } else if (!isEmail(ref.mailId)) {
        newErrors[`referral_${index}_mailId`] = "Invalid email format";
      }
      if (ref.location.trim().length === 0) {
        newErrors[`referral_${index}_location`] = "Location is required";
      }
      if (ref.totalTradeExecution.trim().length === 0) {
        newErrors[`referral_${index}_totalTradeExecution`] =
          "Total trade execution is required";
      }
    });

    setErrs(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function isStepValid(step: number): boolean {
    if (step === 1) return validateStep1();
    if (step === 2) return validateStep2();
    if (step === 3) return validateStep3();
    if (step === 4) return validateStep4();
    if (step === 5) return validateStep5();
    return true;
  }

  function isStepFilled(step: number): boolean {
    if (step === 1) {
      return (
        formData.accountType.length > 0 &&
        !!formData.email &&
        formData.password.length >= 8 &&
        formData.fullName.trim().length > 2
      );
    }
    if (step === 2) {
      return (
        !!formData.name &&
        !!formData.state &&
        !!formData.aadharCard &&
        !!formData.panCard &&
        !!formData.mobile &&
        !!formData.bankName &&
        !!formData.accountNumber &&
        !!formData.ifscCode &&
        !!formData.country &&
        !!formData.addressState &&
        !!formData.addressLine1 &&
        !!formData.city &&
        !!formData.zipCode
      );
    }
    if (step === 3) {
      return (
        !!formData.uploadedFiles.cmlCopy &&
        !!formData.uploadedFiles.panCard &&
        !!formData.uploadedFiles.cancelCheque &&
        !!formData.uploadedFiles.signature
      );
    }
    if (step === 4) {
      return !!formData.uploadedFiles.agreement;
    }
    if (step === 5) {
      const filled = formData.referrals.filter(
        (r) => r.referralName.trim() !== ""
      );
      return filled.length >= 3;
    }
    return true;
  }

  function canGoNext(step: number): boolean {
    // 1️⃣ Must be filled
    const filled = isStepFilled(step);

    // 2️⃣ Must pass validation (but don't trigger re-render loops)
    let valid = true;
    if (step === 1) {
      return (
        formData.accountType.length > 0 &&
        isEmail(formData.email) &&
        isStrongPassword(formData.password) && //  new check
        formData.fullName.trim().length > 2 &&
        formData.category.length !== 0
      );
    }

    if (step === 2) {
      valid =
        formData.name.trim().length > 1 &&
        formData.state.trim().length > 0 &&
        isAadhar(formData.aadharCard) &&
        isPAN(formData.panCard) &&
        isMobile(formData.mobile) &&
        formData.bankName.trim().length > 0 &&
        /^\d+$/.test(formData.accountNumber.trim()) &&
        formData.accountNumber.trim().length >= 8 &&
        isIFSC(formData.ifscCode) &&
        formData.country.trim().length > 0 &&
        formData.addressState.trim().length > 0 &&
        formData.addressLine1.trim().length > 0 &&
        formData.city.trim().length > 0 &&
        formData.zipCode.trim().length >= 4;
    }
    if (step === 3) {
      valid =
        !!formData.uploadedFiles.cmlCopy &&
        !!formData.uploadedFiles.panCard &&
        !!formData.uploadedFiles.cancelCheque &&
        !!formData.uploadedFiles.signature;
    }
    if (step === 4) {
      valid = !!formData.uploadedFiles.agreement;
    }
    if (step === 5) {
      const filledReferrals = formData.referrals.filter(
        (r) => r.referralName.trim() !== ""
      );
      valid = filledReferrals.length >= 3;
    }

    return filled && valid;
  }

  // const canGoNext = isStepValid(currentStep);

  const stepBadge = (index: number) => {
    const stepNumber = index + 1;
    const isActive = stepNumber === currentStep;
    const isDone = stepNumber < currentStep;
    const isClickable = stepNumber > 1 && stepNumber <= currentStep && !loading;

    return (
      <button
        key={steps[index]}
        type="button"
        onClick={() => isClickable && setCurrentStep(stepNumber)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
          isActive && "bg-primary/10 text-primary border border-primary/20",
          !isActive &&
          isDone &&
          "bg-muted text-muted-foreground hover:bg-muted/80",
          !isActive && !isDone && "bg-muted text-muted-foreground",
          !isClickable && "cursor-not-allowed opacity-60"
        )}
        disabled={loading}>
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
            isActive && "border-primary text-primary bg-primary/5",
            isDone && "border-primary text-primary bg-primary/10",
            !isActive &&
            !isDone &&
            "border-muted-foreground/30 bg-background text-muted-foreground"
          )}>
          {isDone ? <Check className="h-3.5 w-3.5" /> : stepNumber}
        </span>
        <span>{steps[index]}</span>
      </button>
    );
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <LoadingSpinner visible={loading} message="Please wait..." />
  ) : isCompleted ? (
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative bg-background items-center justify-center px-4">
      {currentStatus === "rejected" ? (
        // ❌ Rejected UI
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <X className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold text-red-600">
              Registration Rejected
            </h3>
            <p className="text-muted-foreground">
              Unfortunately, your application was rejected. Please review your
              details and try again or contact support for assistance.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => window.open("https://richharbor.com/", "_blank")}>
            Go to website
          </Button>
        </div>
      ) : (
        // ✅ Success UI (default if not rejected)
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold text-emerald-600">
              Registration Completed!
            </h3>
            <p className="text-muted-foreground">
              Your partner account has been created successfully.
              {/* You will
              receive a confirmation email shortly. */}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push("/dashboard")}>
            Go Back to Dashboard
          </Button>
          {/* <Button
            type="button"
            className="ml-5"
            onClick={handleLogout}>
            Go to Login
          </Button> */}
        </div>
      )}
    </div>
  ) : (
    //  Normal form wizard
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-semibold text-foreground">
              Partner Registration
            </h1>
            <div className="text-xs md:text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>
          </div>

          <Progress value={progress} className="mt-2 h-2" />

          <div className="mt-3 -mb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {steps.map((_, i) => stepBadge(i))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-4 py-6">
              <Card>
                <CardContent className="pt-6">
                  <StepView
                    step={currentStep}
                    formData={formData}
                    setFormData={setFormData}
                    handleFileUpload={handleFileUpload}
                    handleUpload={handleUpload}
                    handleDelete={handleDelete}
                    uploading={uploading}
                    currentStatus={currentStatus}
                    inviteEmail={inviteEmail}
                    accountRoles={accountRoles}
                    err={err}
                    validators={{
                      isEmail,
                      isIFSC,
                      isAadhar,
                      isPAN,
                      isMobile,
                      isPostalCode,
                    }}
                    setErrs={setErrs}
                  />

                  {currentStep < steps.length && (
                    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-5">
                        <Button
                          variant="ghost"
                          onClick={() => router.push("/dashboard")}
                          disabled={loading}>
                          Skip for now
                        </Button>

                        <Button
                          onClick={handleNext}
                          disabled={loading || !canGoNext(currentStep)} // ⬅️ disable if invalid
                        >
                          {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {currentStep === steps.length - 1
                            ? "Complete Registration"
                            : "Save & Continue"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>


    </div>
  );
}

function StepView({
  step = 1,
  formData,
  setFormData,
  handleFileUpload,
  handleUpload,
  handleDelete,
  uploading,
  currentStatus,
  inviteEmail,
  accountRoles,
  validators,
  err,
  setErrs,
}: {
  step?: number;
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  handleFileUpload: (field: DocsKey, file: File | null) => void;
  handleUpload: (field: DocsKey) => void;
  handleDelete: (field: DocsKey) => void;
  uploading: Record<DocsKey, boolean>;
  currentStatus: string | null;
  inviteEmail: string | null;
  accountRoles: any;
  validators?: {
    isEmail: (val: string) => boolean;
    isIFSC: (val: string) => boolean;
    isAadhar: (val: string) => boolean;
    isPAN: (val: string) => boolean;
    isMobile: (val: string) => boolean;
    isPostalCode: (val: string) => boolean;
  };
  err: Record<string, string>;
  setErrs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const route = useRouter();

  const handleLogout = () => {
    Cookies.remove("authToken");
    route.push("/");
  };

  const clearError = (fieldName: string) => {
    setErrs((prev) => {
      const newErrs = { ...prev };
      delete newErrs[fieldName];
      return newErrs;
    });
  };
  if (step === 1) {
    return (
      <div className="space-y-4">
        <div>
          <div>
            <Label htmlFor="accountType">Account Roles</Label>
            <div className="mt-2 p-2 rounded-md bg-muted text-sm min-h-[40px]">
              {accountRoles.length > 0
                ? accountRoles.map((r: any) => r.name).join(", ")
                : ""}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fullName: e.target.value }))
            }
            placeholder="Enter your full name"
            className="mt-2"
            onClick={() => clearError("fullName")}
          />
          {err?.fullName && (
            <p className="text-sm text-red-500 mt-1">{err?.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            readOnly={!!inviteEmail} // now using state instead of cookie
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter email address"
            className="mt-2"
            onClick={() => clearError("email")}
          />
          {err?.email && (
            <p className="text-sm text-red-500 mt-1">{err?.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Enter password"
            className="mt-2"
            onClick={() => clearError("password")}
          />
          {err?.password ? (
            <p className="text-sm text-red-500 mt-1">{err.password}</p>
          ) : (
            formData.password && (
              <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                <li
                  className={
                    formData.password.length >= 8
                      ? "text-green-600"
                      : "text-gray-500"
                  }>
                  • At least 8 characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }>
                  • At least one uppercase letter
                </li>
                <li
                  className={
                    /\d/.test(formData.password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }>
                  • At least one number
                </li>
                <li
                  className={
                    /[@$!%*?&]/.test(formData.password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }>
                  • At least one symbol (@$!%*?&)
                </li>
              </ul>
            )
          )}
        </div>
        <div >
          <Label htmlFor="text">
            Entity Type *
          </Label>
          <select
            id='category'
            value={formData.category}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }}
            className="mt-2 bg-transparent w-full px-3 py-2 border border-input rounded-md text-foreground">
            <option className="dark:bg-background" value="">
              Select entity type
            </option>

            <option className="dark:bg-background" value="institution">
              Large Institution
            </option>
            <option className="dark:bg-background" value="wealth firm">
              Wealth Firm
            </option>
            <option className="dark:bg-background" value="Large Broker">
              Large Broker
            </option>
            <option className="dark:bg-background" value="broker">
              Broker
            </option>
            <option className="dark:bg-background" value="Family office">
              Family office
            </option>
            <option className="dark:bg-background" value="Individual">
              Individual
            </option>
            <option className="dark:bg-background" value="Other">
              Other
            </option>

          </select>
          {err?.category && (
            <p className="text-sm text-red-500 mt-1">{err?.category}</p>
          )}

        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name of Partner</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter full name"
              className="mt-2"
              onClick={() => clearError("name")}
            />
            {err?.name && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.name}
              </p>
            )}
          </div>
          <div onClick={() => clearError("state")}>
            <StateSelect
              id="state"
              label="State of Operation"
              value={formData.state}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, state: e.target.value }))
              }
            />
            {err?.state && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.state}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
          <div onClick={() => clearError("aadharCard")}>
            <ValidationInput
              id="aadhar"
              label="Aadhar Card"
              value={formData.aadharCard}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, aadharCard: e.target.value }))
              }
              placeholder="Enter 12-digit Aadhar number"
              inputMode="numeric"
              validator={validators?.isAadhar}
              helperText="Format: 12 digits (e.g., 123456789012)"
            />
            {err?.aadharCard && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.aadharCard}
              </p>
            )}
          </div>
          <div onClick={() => clearError('panCard')}>
            <ValidationInput
              id="pan"
              label="PAN Card"
              value={formData.panCard}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, panCard: e.target.value }))
              }
              placeholder="Enter PAN number"
              validator={validators?.isPAN}
              helperText="Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
            />
            {err?.panCard && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.panCard}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              readOnly
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter email address"
              className="mt-2"
            />
          </div>
          <div onClick={() => clearError("mobile")}>
            <ValidationInput
              id="mobile"
              label="Mobile No."
              value={formData.mobile}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  mobile: e.target.value,
                }))
              }
              placeholder="Enter 10-digit mobile number"
              inputMode="tel"
              validator={validators?.isMobile}
              helperText="Format: 10 digits (e.g., 9876543210)"
            />
            {err?.mobile && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.mobile}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bankName: e.target.value }))
              }
              placeholder="Enter bank name"
              onClick={() => clearError("bankName")}
              className="mt-2"
            />
            {err?.bankName && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.bankName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="accountNumber">Bank A/C No.</Label>
            <Input
              id="accountNumber"
              inputMode="numeric"
              value={formData.accountNumber}
              onClick={() => clearError("accountNumber")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accountNumber: e.target.value,
                }))
              }
              placeholder="Enter account number"
              className="mt-2"
            />
            {err?.accountNumber && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.accountNumber}
              </p>
            )}
          </div>
          <div onClick={() => clearError('ifscCode')}>
            <ValidationInput
              id="ifsc"
              label="IFSC Code"
              value={formData.ifscCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ifscCode: e.target.value }))
              }
              placeholder="Enter IFSC code"
              validator={validators?.isIFSC}
              helperText="Format: 4 letters, 0, 6 alphanumeric (e.g., ABCD0123456)"
            />
            {err?.ifscCode && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.ifscCode}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Address Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, country: e.target.value }))
                }
                className="mt-2"
                onClick={() => clearError("country")}
              />
              {err?.country && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {err?.country}
                </p>
              )}
            </div>
            <div onClick={() => clearError("addressState")}>
              <StateSelect
                id="addressState"
                label="State"
                value={formData.addressState}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressState: e.target.value,
                  }))
                }
              />
              {err?.addressState && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {err?.addressState}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  addressLine1: e.target.value,
                }))
              }
              onClick={() => clearError("addressLine1")}
              placeholder="Enter address line 1"
              className="mt-2"
            />
            {err?.addressLine1 && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {err?.addressLine1}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  addressLine2: e.target.value,
                }))
              }
              placeholder="Enter address line 2"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Enter city"
                onClick={() => clearError("city")}
                className="mt-2"
              />
              {err?.city && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {err?.city}
                </p>
              )}
            </div>
            <div onClick={() => clearError('zipCode')}>
              <ValidationInput
                id="zipCode"
                label="Zip / Postal Code"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
                }
                placeholder="Enter zip code"
                inputMode="numeric"
                validator={validators?.isPostalCode}
                helperText="Format: 4-6 digits (e.g., 110001)"
              />
              {err?.zipCode && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {err?.zipCode}
                </p>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const docs = [
      {
        key: "cmlCopy" as const,
        label: "CML Copy",
        formats: ".pdf,.png,.jpeg,.jpg",
      },
      {
        key: "panCard" as const,
        label: "PAN Card",
        formats: ".pdf,.png,.jpeg,.jpg",
      },
      {
        key: "cancelCheque" as const,
        label: "Cancel Cheque",
        formats: ".pdf,.png,.jpeg,.jpg",
      },
      {
        key: "signature" as const,
        label: "Signature",
        formats: ".png,.jpeg,.jpg",
      },
    ];

    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {"If you need more info, please contact at +91 9211265558"}
        </p>
        {docs.map((doc) => (
          <div key={doc.key} className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label className="font-medium">{doc.label}</Label>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Allowed ({doc.formats}) file-types only
              </span>
            </div>

            {formData.uploadedFiles[doc.key] ? (
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    {formData.uploadedFiles[doc.key]?.key ||
                      formData.uploadedFiles[doc.key]?.name ||
                      "Unknown file"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => handleDelete(doc.key)}
                  className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Input
                  type="file"
                  accept={doc.formats}
                  onChange={(e) =>
                    handleFileUpload(doc.key, e.target.files?.[0] || null)
                  }
                  className="flex-1"
                  aria-label={`Upload ${doc.label}`}
                  disabled={uploading[doc.key]}
                />
                {uploading[doc.key] && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    Uploading...
                  </div>
                )}

                {/* 👇 show validation error (if any) */}
                {err[doc.key] && (
                  <p className="text-sm text-red-500 mt-1">{err[doc.key]}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h3 className="mb-2 text-lg font-medium">Franchise Agreement</h3>
          <p className="text-muted-foreground">
            {
              "Download the franchise agreement, sign it, and upload the signed document."
            }
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            type="button"
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/Empanelment-Agreement-RH.pdf";
              link.download = "Empanelment_Agreement_RH.pdf"; // optional custom name
              link.click();
            }}>
            <Download className="mr-2 h-4 w-4" />
            Download Franchise Agreement
          </Button>

          <div className="rounded-lg border p-4 text-left">
            <Label className="font-medium">Upload Signed Agreement</Label>
            {formData.uploadedFiles.agreement ? (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    {formData.uploadedFiles.agreement?.key ||
                      formData.uploadedFiles.agreement?.name ||
                      "Unknown file"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => handleDelete("agreement")}
                  className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-3">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handleFileUpload("agreement", e.target.files?.[0] || null)
                  }
                  className="flex-1"
                  aria-label="Upload signed franchise agreement"
                  disabled={uploading.agreement}
                />
                {uploading.agreement && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    Uploading...
                  </div>
                )}

                {err.agreement && (
                  <p className="text-sm text-red-500 mt-1">{err.agreement}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Add Referrals</h3>
          <p className="text-sm text-muted-foreground">
            Please provide at least 3 referrals. You can add up to 5 referrals.
          </p>
        </div>

        <div className="space-y-6">
          {formData.referrals.map((referral, index) => (
            <div key={index} className="rounded-lg border p-4 bg-card">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">Referral {index + 1}</h4>
                <span className="text-xs text-muted-foreground">
                  {referral.referralName ? "Filled" : "Empty"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`referral_${index}_name`}>
                    Referral Name *
                  </Label>
                  <Input
                    id={`referral_${index}_name`}
                    value={referral.referralName}
                    onChange={(e) => {
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].referralName = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() => clearError(`referral_${index}_name`)}
                    placeholder="Enter referral name"
                    className="mt-2"
                  />
                  {err[`referral_${index}_name`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_name`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`referral_${index}_designation`}>
                    Designation *
                  </Label>
                  <Input
                    id={`referral_${index}_designation`}
                    value={referral.designation}
                    onChange={(e) => {
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].designation = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() => clearError(`referral_${index}_designation`)}
                    placeholder="Enter designation"
                    className="mt-2"
                  />
                  {err[`referral_${index}_designation`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_designation`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`referral_${index}_firmName`}>
                    Firm Name *
                  </Label>
                  <Input
                    id={`referral_${index}_firmName`}
                    value={referral.firmName}
                    onChange={(e) => {
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].firmName = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() => clearError(`referral_${index}_firmName`)}
                    placeholder="Enter firm name"
                    className="mt-2"
                  />
                  {err[`referral_${index}_firmName`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_firmName`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`referral_${index}_natureOfBusiness`}>
                    Nature of Business *
                  </Label>
                  <Input
                    id={`referral_${index}_natureOfBusiness`}
                    value={referral.natureOfBusiness}
                    onChange={(e) => {
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].natureOfBusiness = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() =>
                      clearError(`referral_${index}_natureOfBusiness`)
                    }
                    placeholder="Enter nature of business"
                    className="mt-2"
                  />
                  {err[`referral_${index}_natureOfBusiness`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_natureOfBusiness`]}
                    </p>
                  )}
                </div>

                <div onClick={() => clearError(`referral_${index}_entityType`)}>
                  <Label htmlFor={`referral_${index}_entityType`}>
                    Entity Type *
                  </Label>
                  <select
                    id={`referral_${index}_entityType`}
                    value={referral.entityType}
                    onChange={(e) => {
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].entityType = e.target.value as any;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    className="mt-2 bg-transparent w-full px-3 py-2 border border-input rounded-md text-foreground">
                    <option className="dark:bg-background" value="">
                      Select entity type
                    </option>
                    <option className="dark:bg-background" value="broker">
                      Broker
                    </option>
                    <option className="dark:bg-background" value="wealth firm">
                      Wealth Firm
                    </option>
                    <option className="dark:bg-background" value="institution">
                      Institution
                    </option>
                  </select>
                  {err[`referral_${index}_entityType`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_entityType`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`referral_${index}_contact`}>Contact *</Label>
                  <Input
                    id={`referral_${index}_contact`}
                    value={referral.contact}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].contact = value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() => clearError(`referral_${index}_contact`)}
                    placeholder="Enter 10-digit contact"
                    inputMode="tel"
                    className="mt-2" // helps browsers restrict input
                    maxLength={10} // optional: limit to 10 digits
                  />
                  {err[`referral_${index}_contact`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_contact`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`referral_${index}_mailId`}>Email ID *</Label>
                  <Input
                    id={`referral_${index}_mailId`}
                    type="email"
                    value={referral.mailId}
                    onChange={(e) => {
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].mailId = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() => clearError(`referral_${index}_mailId`)}
                    placeholder="Enter email address"
                    className="mt-2"
                  />
                  {err[`referral_${index}_mailId`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_mailId`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`referral_${index}_location`}>
                    Location *
                  </Label>
                  <Input
                    id={`referral_${index}_location`}
                    value={referral.location}
                    onChange={(e) => {
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].location = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() => clearError(`referral_${index}_location`)}
                    placeholder="Enter location"
                    className="mt-2"
                  />
                  {err[`referral_${index}_location`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_location`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`referral_${index}_totalTradeExecution`}>
                    Total Trade Execution *
                  </Label>
                  <Input
                    id={`referral_${index}_totalTradeExecution`}
                    value={referral.totalTradeExecution}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const newReferrals = [...formData.referrals];
                      newReferrals[index].totalTradeExecution = value;
                      setFormData((prev) => ({
                        ...prev,
                        referrals: newReferrals,
                      }));
                    }}
                    onClick={() =>
                      clearError(`referral_${index}_totalTradeExecution`)
                    }
                    placeholder="Enter total trade execution"
                    className="mt-2"
                  />
                  {err[`referral_${index}_totalTradeExecution`] && (
                    <p className="text-xs text-red-600 mt-1">
                      {err[`referral_${index}_totalTradeExecution`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {err.referrals && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 font-medium">{err.referrals}</p>
          </div>
        )}
      </div>
    );
  }

  if (step === 6) {
    if (currentStatus === "rejected") {
      return (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <X className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold text-red-600">
              Registration Rejected
            </h3>
            <p className="text-muted-foreground">
              Unfortunately, your application was rejected. Please review your
              details and try again or contact support for assistance.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => window.open("https://richharbor.com/", "_blank")}>
            Go to website
          </Button>
          <Button type="button" className="ml-5" onClick={handleLogout}>
            Go to Login
          </Button>
        </div>
      );
    } else {
      // success UI (status !== rejected)
      return (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold text-emerald-600">
              Registration Completed!
            </h3>
            <p className="text-muted-foreground">
              Your partner account has been created successfully.
              {/* You will
              receive a confirmation email shortly. */}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => route.push("/dashboard")}>
            Go to Dashboard
          </Button>
          {/* <Button type="button" className="ml-5" onClick={handleLogout}>
            Go to Login
          </Button> */}
        </div>
      );
    }
  }

  return null;
}
