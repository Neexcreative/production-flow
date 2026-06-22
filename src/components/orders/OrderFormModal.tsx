"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import type { CatalogOption } from "@/types/catalog";
import type { Client } from "@/types/client";
import type { JobTypeOption } from "@/types/jobType";
import {
  type OrderFormValues,
  type OrderStatus,
  type Priority,
  type PriorityOption,
  type ProductionStage,
  type StatusOption,
} from "@/types/order";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ADD_NEW_CLIENT_VALUE = "__add_new_client__";
const ADD_NEW_JOB_TYPE_VALUE = "__add_new_job_type__";
const ADD_NEW_MATERIAL_VALUE = "__add_new_material__";
const ADD_NEW_REQUESTED_BY_VALUE = "__add_new_requested_by__";

type OrderFormModalProps = {
  clients: Client[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  jobTypes: JobTypeOption[];
  productionStages: CatalogOption[];
  materials: CatalogOption[];
  waitingReasons: CatalogOption[];
  requestedByOptions: CatalogOption[];
  mode: "create" | "edit";
  initialValues: OrderFormValues;
  onClose: () => void;
  onAddClient: (name: string) => Promise<{ clientName?: string; error?: string }>;
  onAddJobType: (name: string) => Promise<{ jobTypeName?: string; error?: string }>;
  onAddMaterial: (name: string) => Promise<{ materialName?: string; error?: string }>;
  onAddRequestedBy: (name: string) => Promise<{ requestedByName?: string; error?: string }>;
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
  editingOrderId?: string;
  message?: string;
};

export const EMPTY_ORDER_FORM: OrderFormValues = {
  title: "",
  client: "",
  jobType: "Design",
  productionStage: "Artwork",
  status: "New",
  priority: "Normal",
  due: "",
  vehicleItem: "",
  material: "",
  quantity: "",
  printQuantity: "",
  cutQuantity: "",
  laminationQuantity: "",
  requestedBy: "",
  waitingReason: "",
  fileLink: "",
  artworkLink: "",
  productionFileLink: "",
  notes: "",
  referenceImage: "",
  referenceImageName: "",
  referenceImageUrl: "",
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200";
const selectClass =
  "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200";
const labelTextClass = "block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600";

function getPreviewImage(values: OrderFormValues) {
  if (values.referenceImage) {
    return values.referenceImage;
  }

  return values.referenceImageUrl.trim();
}

function InlineOptionCreator({
  label,
  value,
  error,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  error: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <label className="block space-y-1.5">
        <span className={labelTextClass}>{label}</span>
        <input
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
          placeholder={placeholder}
        />
      </label>
      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          This option will be saved to local storage for future jobs.
        </p>
      )}
    </div>
  );
}

export function OrderFormModal({
  clients,
  statuses,
  priorities,
  jobTypes,
  productionStages,
  materials,
  waitingReasons,
  requestedByOptions,
  mode,
  initialValues,
  onClose,
  onAddClient,
  onAddJobType,
  onAddMaterial,
  onAddRequestedBy,
  onSubmit,
  editingOrderId,
  message = "",
}: OrderFormModalProps) {
  const [formValues, setFormValues] = useState<OrderFormValues>(initialValues);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [clientError, setClientError] = useState("");
  const [isAddingJobType, setIsAddingJobType] = useState(false);
  const [newJobTypeName, setNewJobTypeName] = useState("");
  const [jobTypeError, setJobTypeError] = useState("");
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [materialError, setMaterialError] = useState("");
  const [isAddingRequestedBy, setIsAddingRequestedBy] = useState(false);
  const [newRequestedByName, setNewRequestedByName] = useState("");
  const [requestedByError, setRequestedByError] = useState("");
  const [waitingReasonError, setWaitingReasonError] = useState("");
  const [fileError, setFileError] = useState("");

  function handleChange<K extends keyof OrderFormValues>(
    field: K,
    value: OrderFormValues[K]
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "status" && value !== "Waiting") {
      setWaitingReasonError("");
    }

    if (field === "waitingReason") {
      setWaitingReasonError("");
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Please upload a JPG, JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Unable to read file."));
      };

      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });

    setFileError("");
    setFormValues((current) => ({
      ...current,
      referenceImage: dataUrl,
      referenceImageName: file.name,
      referenceImageUrl: "",
    }));
    event.target.value = "";
  }

  function handleReferenceImageUrlChange(value: string) {
    setFormValues((current) => ({
      ...current,
      referenceImageUrl: value,
      referenceImage: value ? "" : current.referenceImage,
      referenceImageName: value ? "" : current.referenceImageName,
    }));
  }

  function handleRemoveImage() {
    setFileError("");
    setFormValues((current) => ({
      ...current,
      referenceImage: "",
      referenceImageName: "",
      referenceImageUrl: "",
    }));
  }

  function handleClientSelect(value: string) {
    setClientError("");

    if (value === ADD_NEW_CLIENT_VALUE) {
      setIsAddingClient(true);
      return;
    }

    setIsAddingClient(false);
    setNewClientName("");
    handleChange("client", value);
  }

  function handleJobTypeSelect(value: string) {
    setJobTypeError("");

    if (value === ADD_NEW_JOB_TYPE_VALUE) {
      setIsAddingJobType(true);
      return;
    }

    setIsAddingJobType(false);
    setNewJobTypeName("");
    handleChange("jobType", value);
  }

  function handleMaterialSelect(value: string) {
    setMaterialError("");

    if (value === ADD_NEW_MATERIAL_VALUE) {
      setIsAddingMaterial(true);
      return;
    }

    setIsAddingMaterial(false);
    setNewMaterialName("");
    handleChange("material", value);
  }

  function handleRequestedBySelect(value: string) {
    setRequestedByError("");

    if (value === ADD_NEW_REQUESTED_BY_VALUE) {
      setIsAddingRequestedBy(true);
      return;
    }

    setIsAddingRequestedBy(false);
    setNewRequestedByName("");
    handleChange("requestedBy", value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let nextValues = { ...formValues };

    if (isAddingClient) {
      const result = await onAddClient(newClientName);

      if (result.error || !result.clientName) {
        setClientError(result.error ?? "Unable to add client.");
        return;
      }

      nextValues.client = result.clientName;
    }

    if (isAddingJobType) {
      const result = await onAddJobType(newJobTypeName);

      if (result.error || !result.jobTypeName) {
        setJobTypeError(result.error ?? "Unable to add job type.");
        return;
      }

      nextValues.jobType = result.jobTypeName;
    }

    if (isAddingMaterial) {
      const result = await onAddMaterial(newMaterialName);

      if (result.error || !result.materialName) {
        setMaterialError(result.error ?? "Unable to add material.");
        return;
      }

      nextValues.material = result.materialName;
    }

    if (isAddingRequestedBy) {
      const result = await onAddRequestedBy(newRequestedByName);

      if (result.error || !result.requestedByName) {
        setRequestedByError(result.error ?? "Unable to add requested by.");
        return;
      }

      nextValues.requestedBy = result.requestedByName;
    }

    if (nextValues.status === "Waiting" && !nextValues.waitingReason.trim()) {
      setWaitingReasonError("Waiting reason is required when status is Waiting.");
      return;
    }

    nextValues = {
      ...nextValues,
      referenceImage:
        nextValues.referenceImage || nextValues.referenceImageUrl.trim(),
      referenceImageName:
        nextValues.referenceImageName.trim() ||
        (nextValues.referenceImageUrl.trim() ? "External image URL" : ""),
    };

    await onSubmit(nextValues);
  }

  const previewImage = getPreviewImage(formValues);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-300 bg-white p-6 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
              {mode === "create" ? "New Job" : "Edit Job"}
            </p>
            <h2 className="mt-1.5 text-2xl font-bold text-slate-900">
              {mode === "create"
                ? "Create job record"
                : `Update ${editingOrderId ?? "job record"}`}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Create a structured job card with client, deadline, resources, links and production details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {message ? (
          <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {message}
          </div>
        ) : null}

        <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
              Core Job Details
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5">
                <span className={labelTextClass}>Job Name / Title</span>
                <input
                  required
                  value={formValues.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  className={inputClass}
                  placeholder="Brand Guidelines Update"
                />
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Client</span>
                <select
                  required={!isAddingClient}
                  value={isAddingClient ? ADD_NEW_CLIENT_VALUE : formValues.client}
                  onChange={(event) => handleClientSelect(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Select client</option>
                  {clients
                    .filter((client) => client.active)
                    .map((client) => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  <option value={ADD_NEW_CLIENT_VALUE}>+ Add new client</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Job Type</span>
                <select
                  required={!isAddingJobType}
                  value={isAddingJobType ? ADD_NEW_JOB_TYPE_VALUE : formValues.jobType}
                  onChange={(event) => handleJobTypeSelect(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Select job type</option>
                  {jobTypes
                    .filter((jobType) => jobType.active)
                    .map((jobType) => (
                      <option key={jobType.id} value={jobType.name}>
                        {jobType.name}
                      </option>
                    ))}
                  <option value={ADD_NEW_JOB_TYPE_VALUE}>+ Add new job type</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Production Stage</span>
                <select
                  value={formValues.productionStage}
                  onChange={(event) =>
                    handleChange(
                      "productionStage",
                      event.target.value as ProductionStage
                    )
                  }
                  className={selectClass}
                >
                  {productionStages.map((stage) => (
                    <option key={stage.id} value={stage.name}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Board Status</span>
                <select
                  value={formValues.status}
                  onChange={(event) =>
                    handleChange("status", event.target.value as OrderStatus)
                  }
                  className={selectClass}
                >
                  {statuses
                    .filter((status) => status.active)
                    .sort((left, right) => left.sortOrder - right.sortOrder)
                    .map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Priority</span>
                <select
                  value={formValues.priority}
                  onChange={(event) =>
                    handleChange("priority", event.target.value as Priority)
                  }
                  className={selectClass}
                >
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.name}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Due Date / Due Text</span>
                <input
                  required
                  value={formValues.due}
                  onChange={(event) => handleChange("due", event.target.value)}
                  className={inputClass}
                  placeholder="29 May / Today / Pending"
                />
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Item / Project / Asset</span>
                <input
                  value={formValues.vehicleItem}
                  onChange={(event) =>
                    handleChange("vehicleItem", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Homepage asset set"
                />
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Requested By</span>
                <select
                  value={
                    isAddingRequestedBy
                      ? ADD_NEW_REQUESTED_BY_VALUE
                      : formValues.requestedBy
                  }
                  onChange={(event) => handleRequestedBySelect(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Select requester</option>
                  {requestedByOptions
                    .filter((option) => option.active)
                    .map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  <option value={ADD_NEW_REQUESTED_BY_VALUE}>
                    + Add new requested by
                  </option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {isAddingClient ? (
                <InlineOptionCreator
                  label="New Client Name"
                  value={newClientName}
                  error={clientError}
                  placeholder="Enter client name"
                  onChange={(value) => {
                    setClientError("");
                    setNewClientName(value);
                  }}
                />
              ) : null}

              {isAddingJobType ? (
                <InlineOptionCreator
                  label="New Job Type Name"
                  value={newJobTypeName}
                  error={jobTypeError}
                  placeholder="Enter job type"
                  onChange={(value) => {
                    setJobTypeError("");
                    setNewJobTypeName(value);
                  }}
                />
              ) : null}

              {isAddingRequestedBy ? (
                <InlineOptionCreator
                  label="New Requested By"
                  value={newRequestedByName}
                  error={requestedByError}
                  placeholder="Enter name"
                  onChange={(value) => {
                    setRequestedByError("");
                    setNewRequestedByName(value);
                  }}
                />
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
              Production Information
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="space-y-1.5">
                <span className={labelTextClass}>Resource</span>
                <select
                  value={isAddingMaterial ? ADD_NEW_MATERIAL_VALUE : formValues.material}
                  onChange={(event) => handleMaterialSelect(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Select resource</option>
                  {materials
                    .filter((material) => material.active)
                    .map((material) => (
                      <option key={material.id} value={material.name}>
                        {material.name}
                      </option>
                    ))}
                  <option value={ADD_NEW_MATERIAL_VALUE}>+ Add new resource</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Quantity</span>
                <input
                  value={formValues.quantity}
                  onChange={(event) => handleChange("quantity", event.target.value)}
                  className={inputClass}
                  placeholder="1 / 10 / set"
                />
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Print Quantity</span>
                <input
                  value={formValues.printQuantity}
                  onChange={(event) =>
                    handleChange("printQuantity", event.target.value)
                  }
                  className={inputClass}
                  placeholder="2"
                />
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Cut Quantity</span>
                <input
                  value={formValues.cutQuantity}
                  onChange={(event) =>
                    handleChange("cutQuantity", event.target.value)
                  }
                  className={inputClass}
                  placeholder="2"
                />
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Lamination Quantity</span>
                <input
                  value={formValues.laminationQuantity}
                  onChange={(event) =>
                    handleChange("laminationQuantity", event.target.value)
                  }
                  className={inputClass}
                  placeholder="8"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2 xl:col-span-2">
                <span className={labelTextClass}>Waiting Reason</span>
                <select
                  value={formValues.waitingReason}
                  onChange={(event) =>
                    handleChange("waitingReason", event.target.value)
                  }
                  className={[
                    selectClass,
                    waitingReasonError ? "border-red-400 ring-2 ring-red-100" : "",
                  ].join(" ")}
                >
                  <option value="">Select waiting reason</option>
                  {waitingReasons.map((reason) => (
                    <option key={reason.id} value={reason.name}>
                      {reason.name}
                    </option>
                  ))}
                </select>
                {waitingReasonError ? (
                  <p className="text-sm text-red-600">{waitingReasonError}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Required when board status is set to Waiting.
                  </p>
                )}
              </label>
            </div>

            {isAddingMaterial ? (
              <div className="mt-4 max-w-xl">
                <InlineOptionCreator
                  label="New Resource"
                  value={newMaterialName}
                  error={materialError}
                  placeholder="Enter resource"
                  onChange={(value) => {
                    setMaterialError("");
                    setNewMaterialName(value);
                  }}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
              Links And Notes
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className={labelTextClass}>File Link</span>
                <input
                  type="url"
                  value={formValues.fileLink}
                  onChange={(event) => handleChange("fileLink", event.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-1.5">
                <span className={labelTextClass}>Artwork Link</span>
                <input
                  type="url"
                  value={formValues.artworkLink}
                  onChange={(event) =>
                    handleChange("artworkLink", event.target.value)
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className={labelTextClass}>Production File Link</span>
                <input
                  type="url"
                  value={formValues.productionFileLink}
                  onChange={(event) =>
                    handleChange("productionFileLink", event.target.value)
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className={labelTextClass}>Notes</span>
                <textarea
                  rows={5}
                  value={formValues.notes}
                  onChange={(event) => handleChange("notes", event.target.value)}
                  className={inputClass}
                  placeholder="Production notes, pending information, fitting notes, stock notes..."
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
                  Reference / Attachment
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Save a reference URL or upload an image/file for this job. Attachments are stored locally for now.
                </p>
              </div>

              {(previewImage || formValues.referenceImageName) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Remove Image
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className={labelTextClass}>Reference URL</span>
                  <input
                    type="url"
                    value={formValues.referenceImageUrl}
                    onChange={(event) =>
                      handleReferenceImageUrlChange(event.target.value)
                    }
                    className={inputClass}
                    placeholder="https://example.com/image.jpg"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className={labelTextClass}>Upload Attachment</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="w-full rounded-md border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded file:border-0 file:bg-amber-200 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950 hover:border-slate-400"
                  />
                </label>

                {formValues.referenceImageName ? (
                  <p className="text-sm text-slate-600">
                    Current file:{" "}
                    <span className="font-semibold text-slate-900">
                      {formValues.referenceImageName}
                    </span>
                  </p>
                ) : null}

                {fileError ? (
                  <p className="text-sm text-red-600">{fileError}</p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Accepted types: JPG, JPEG, PNG, WEBP.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  Preview
                </p>
                <div className="mt-3 flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Reference preview"
                      className="max-h-72 w-full rounded object-contain"
                    />
                  ) : (
                    <p className="text-center text-sm text-slate-500">
                      No attachment added
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-amber-300 bg-amber-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:brightness-105"
            >
              {mode === "create" ? "Create Job" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
