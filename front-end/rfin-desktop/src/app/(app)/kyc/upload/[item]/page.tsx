"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, track } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useKyc } from "@/lib/hooks";
import { BackLink, Page } from "@/components/shell";
import { Button, Disclosure, ErrorState, PageTitle } from "@/components/ui";

const TIPS: Record<string, string[]> = {
  address: ["Aadhaar, passport, driving licence or a utility bill under 3 months old", "All four corners visible, in daylight, no glare", "Name must match your PAN"],
  selfie: ["Face the camera in good light", "Remove glasses and caps", "Only you in the frame"],
  pan: ["Clear photo of the front of your PAN card"],
};
const MAX = 5 * 1024 * 1024;

/** Secure upload with reason, validation feedback and re-upload (report #35). */
export default function Upload() {
  const { item } = useParams<{ item: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const kyc = useKyc();
  const k = kyc.data?.find((x) => x.id === item);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [err, setErr] = useState<string>();
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) return setPreview(undefined);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f?: File | null) => {
    setErr(undefined);
    if (!f) return;
    if (!/^image\/|application\/pdf/.test(f.type)) return setErr("Upload a photo (JPG, PNG) or a PDF.");
    if (f.size > MAX) return setErr("That file is over 5 MB. Try a smaller scan or a photo.");
    setFile(f);
  };

  const upload = useMutation({
    mutationFn: () => api("kyc.upload", { itemId: item, fileName: file!.name }),
    onSuccess: () => {
      track("document_uploaded", { item });
      qc.invalidateQueries({ queryKey: ["kyc"] });
      router.push("/kyc");
    },
  });

  if (kyc.data && !k) return <Page><ErrorState title="Not found" body="This KYC item doesn't exist." /></Page>;

  return (
    <Page back={<BackLink href="/kyc" label="KYC" />}>
      <PageTitle eyebrow={k?.state === "action_required" ? "Re-upload" : "Upload"} title={k?.label ?? "Document"} lede={k?.why} />
      {k?.rejectionReason ? (
        <div className="space-y-1 rounded-2xl bg-rfin-red/15 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-rfin-red">Why it was returned</p>
          <p className="text-[15px]">{k.rejectionReason}</p>
        </div>
      ) : null}
      <Disclosure title="Get it right first time" items={TIPS[item] ?? ["A clear, readable copy"]} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
        className={cn("grid place-items-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition-colors", drag ? "border-rfin-text bg-rfin-text/5" : "border-rfin-line/20")}
      >
        <FileUp className="size-7" aria-hidden />
        <p className="text-sm font-semibold">Drop a photo or PDF here</p>
        <Button variant="outline" onClick={() => input.current?.click()}>Choose file</Button>
        <input ref={input} type="file" accept="image/*,application/pdf" capture={item === "selfie" ? "user" : undefined} className="sr-only" aria-label="Choose file" onChange={(e) => pick(e.target.files?.[0])} />
        <p className="text-xs text-rfin-mute">JPG, PNG or PDF · up to 5 MB</p>
      </div>
      {err ? <p className="text-xs text-rfin-red">{err}</p> : null}

      {file ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="Selected document" className="aspect-[3/2] w-full rounded-2xl bg-rfin-text/10 object-cover" /> : null}
          <div className="flex items-center justify-between gap-4">
            <span className="truncate text-sm font-semibold">{file.name}</span>
            <Button variant="link" onClick={() => setFile(null)}>Change</Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {upload.isError ? <p className="text-xs text-rfin-red">{upload.error.message}</p> : null}
        <Button disabled={!file} loading={upload.isPending} onClick={() => upload.mutate()}>{file ? "Submit for review" : "Choose a file first"}</Button>
        <p className="text-xs text-rfin-mute">Encrypted in transit and at rest. Shared only with providers you transact with. Mock: file names containing &quot;blur&quot; are rejected again.</p>
      </div>
    </Page>
  );
}
