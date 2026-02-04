"use client";

import { useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImage } from "../lib/cropper";

type AspectOption = {
  label: string;
  value: number | null;
};

const ASPECT_OPTIONS: AspectOption[] = [
  { label: "Свободно", value: null },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
];

type ImageCropModalProps = {
  file: File;
  aspect: number | null;
  onCancel: () => void;
  onComplete: (blob: Blob) => void;
};

export default function ImageCropModal({
  file,
  aspect,
  onCancel,
  onComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<number | null>(aspect);
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleCropComplete = (_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      return;
    }
    const blob = await getCroppedImage(file, croppedAreaPixels, rotation);
    onComplete(blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-emerald-100/70 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-emerald-900">
            Обрезка изображения
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-50"
          >
            Отмена
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={selectedAspect ?? undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          <div className="space-y-4 text-sm text-emerald-900">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">
              Пропорция
              <select
                className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                value={
                  selectedAspect === null
                    ? "free"
                    : String(selectedAspect)
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedAspect(value === "free" ? null : Number(value));
                }}
              >
                {ASPECT_OPTIONS.map((option) => (
                  <option
                    key={option.label}
                    value={option.value === null ? "free" : option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">
              Масштаб
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
