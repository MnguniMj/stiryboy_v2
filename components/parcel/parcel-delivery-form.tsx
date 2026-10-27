"use client";

import {
  CalendarDays,
  CircleAlert,
  ExternalLink,
  Loader2,
  MapPin,
  MapPinned,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

type AddressMode = "Residential" | "Business";
type ServiceLevel = "economy" | "express" | "same-day";
type ParcelType = "document" | "parcel" | "fragile";

type AddressState = {
  mode: AddressMode;
  contactName: string;
  company: string;
  phone: string;
  email: string;
  googleLocation: string;
  notes: string;
};

type ParcelItem = {
  id: string;
  description: string;
  quantity: number;
  weight: number;
  declaredValue: number;
};

type GoogleMapsWindow = Window &
  typeof globalThis & {
    google?: any;
  };

type PickerMode = "search" | "map";

type LocationSuggestion = {
  description: string;
  placeId: string;
};

const addressModes: AddressMode[] = ["Residential", "Business"];

const serviceOptions: {
  id: ServiceLevel;
  label: string;
  eta: string;
  fee: number;
}[] = [
  { id: "economy", label: "Economy", eta: "2-4 business days", fee: 45 },
  { id: "express", label: "Express", eta: "Next day in major routes", fee: 95 },
  {
    id: "same-day",
    label: "Same day",
    eta: "City-wide premium delivery",
    fee: 160,
  },
];

const parcelTypes: { id: ParcelType; label: string; helper: string }[] = [
  {
    id: "document",
    label: "Documents",
    helper: "Flat packs, files, and lightweight folders",
  },
  {
    id: "parcel",
    label: "Parcel",
    helper: "General items packed in a satchel or box",
  },
  {
    id: "fragile",
    label: "Fragile",
    helper: "Glass, electronics, or high-care shipments",
  },
];

const initialAddress = (mode: AddressMode): AddressState => ({
  mode,
  contactName: "",
  company: "",
  phone: "",
  email: "",
  googleLocation: "",
  notes: "",
});

const createParcelItem = (id: number): ParcelItem => ({
  id: String(id),
  description: "",
  quantity: 1,
  weight: 1,
  declaredValue: 250,
});

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

let googleMapsPromise: Promise<any> | null = null;

function loadGoogleMapsPlaces() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Maps can only load in the browser."),
    );
  }

  const mapsWindow = window as GoogleMapsWindow;

  if (mapsWindow.google?.maps?.places) {
    return Promise.resolve(mapsWindow.google);
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(
      new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment."),
    );
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-google-maps-loader="stiryboy"]',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve((window as GoogleMapsWindow).google),
      );
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "stiryboy";
    script.onload = () => resolve((window as GoogleMapsWindow).google);
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 dark:border-white/10 dark:bg-slate-950",
        props.className,
      )}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 dark:border-white/10 dark:bg-slate-950",
        props.className,
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 dark:border-white/10 dark:bg-slate-950",
        props.className,
      )}
    />
  );
}

function GoogleLocationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>("search");
  const [query, setQuery] = useState(value);
  const [googleApi, setGoogleApi] = useState<any>(null);
  const [loadingMaps, setLoadingMaps] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [mapSelection, setMapSelection] = useState<string>("");
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoadingMaps(true);
    setLoadError(null);

    loadGoogleMapsPlaces()
      .then((google) => {
        setGoogleApi(google);
        autocompleteServiceRef.current =
          autocompleteServiceRef.current ??
          new google.maps.places.AutocompleteService();
        placesServiceRef.current =
          placesServiceRef.current ??
          new google.maps.places.PlacesService(document.createElement("div"));
        geocoderRef.current = geocoderRef.current ?? new google.maps.Geocoder();
      })
      .catch((error: Error) => {
        setLoadError(error.message);
      })
      .finally(() => {
        setLoadingMaps(false);
      });
  }, [open]);

  useEffect(() => {
    if (!open || mode !== "search" || !googleApi || query.trim().length < 3) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const handle = window.setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: query,
        },
        (predictions: any[] | null, status: string) => {
          if (
            status !== googleApi.maps.places.PlacesServiceStatus.OK ||
            !predictions
          ) {
            setSuggestions([]);
            setLoadingSuggestions(false);
            return;
          }

          setSuggestions(
            predictions.map((prediction) => ({
              description: prediction.description,
              placeId: prediction.place_id,
            })),
          );
          setLoadingSuggestions(false);
        },
      );
    }, 250);

    return () => window.clearTimeout(handle);
  }, [googleApi, mode, open, query]);

  useEffect(() => {
    if (
      !open ||
      mode !== "map" ||
      !googleApi ||
      !mapContainerRef.current ||
      mapRef.current
    ) {
      return;
    }

    const defaultCenter = { lat: -29.3158, lng: 27.4869 };
    const map = new googleApi.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const marker = new googleApi.maps.Marker({
      map,
      position: defaultCenter,
    });

    map.addListener("click", (event: any) => {
      const location = event.latLng;
      if (!location) return;

      marker.setPosition(location);

      geocoderRef.current?.geocode(
        { location: location.toJSON() },
        (results: any[] | null, status: string) => {
          if (status === "OK" && results?.[0]) {
            setMapSelection(results[0].formatted_address);
            return;
          }

          const lat = location.lat().toFixed(6);
          const lng = location.lng().toFixed(6);
          setMapSelection(`${lat}, ${lng}`);
        },
      );
    });

    mapRef.current = map;
    markerRef.current = marker;
  }, [googleApi, mode, open]);

  useEffect(() => {
    if (!open) {
      setMode("search");
      setQuery(value);
      setSuggestions([]);
      setMapSelection("");
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [open, value]);

  function handleSelectSuggestion(suggestion: LocationSuggestion) {
    setLoadingSelection(true);
    placesServiceRef.current?.getDetails(
      {
        placeId: suggestion.placeId,
        fields: ["formatted_address", "name"],
      },
      (place: any, status: string) => {
        setLoadingSelection(false);

        if (
          status !== googleApi?.maps?.places?.PlacesServiceStatus?.OK ||
          !place
        ) {
          toast.error("Unable to use that Google location right now.");
          return;
        }

        onChange(
          place.formatted_address || place.name || suggestion.description,
        );
        setQuery(
          place.formatted_address || place.name || suggestion.description,
        );
        setOpen(false);
      },
    );
  }

  function openGoogleMapsSearch() {
    const searchTerm = query.trim() || value.trim() || "Maseru Lesotho";
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTerm)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function useMapSelection() {
    if (!mapSelection) {
      toast.error("Click a point on the map first.");
      return;
    }

    onChange(mapSelection);
    setQuery(mapSelection);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm outline-none transition hover:border-amazon-orange focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/20 dark:border-white/10 dark:bg-slate-950"
      >
        <span className={cn(!value && "text-slate-400")}>
          {value || "Search or choose a Google location"}
        </span>
        <MapPinned className="h-4 w-4 shrink-0 text-amazon-light" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black tracking-normal text-slate-950 dark:text-white">
                  Choose Google location
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Search for a place first, or switch to the map if the place is
                  not found.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-950 dark:border-white/10 dark:hover:text-white"
                aria-label="Close location picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setMode("search")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  mode === "search"
                    ? "bg-amazon-light text-white"
                    : "text-slate-600 dark:text-slate-300",
                )}
              >
                Search place
              </button>
              <button
                type="button"
                onClick={() => setMode("map")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  mode === "map"
                    ? "bg-amazon-light text-white"
                    : "text-slate-600 dark:text-slate-300",
                )}
              >
                Pick on map
              </button>
            </div>

            <div className="mt-5">
              {loadingMaps ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading Google location tools...
                </div>
              ) : null}

              {!loadingMaps && loadError ? (
                <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                  <p>{loadError}</p>
                  <p>
                    Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable
                    inline place search and map pinning.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={openGoogleMapsSearch}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Google Maps
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full"
                      onClick={() => {
                        if (!query.trim()) {
                          toast.error("Paste or type a location first.");
                          return;
                        }
                        onChange(query.trim());
                        setOpen(false);
                      }}
                    >
                      Use typed location
                    </Button>
                  </div>
                </div>
              ) : null}

              {!loadingMaps && !loadError && mode === "search" ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <TextInput
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search place, business, area, or paste a Google Maps link"
                      className="pl-11"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-white/10">
                    {loadingSuggestions ? (
                      <div className="flex items-center gap-2 p-4 text-sm text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching Google places...
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((suggestion) => (
                        <button
                          key={suggestion.placeId}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="flex w-full items-start gap-3 border-b border-slate-200 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amazon-light" />
                          <span className="text-sm text-slate-700 dark:text-slate-200">
                            {suggestion.description}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="space-y-3 p-4 text-sm text-slate-500 dark:text-slate-400">
                        <p>
                          {query.trim().length < 3
                            ? "Type at least 3 characters to search Google places."
                            : "No Google place found for that search."}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setMode("map")}
                          >
                            <MapPinned className="h-4 w-4" />
                            Choose on map
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={openGoogleMapsSearch}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open Google Maps
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full"
                      disabled={loadingSelection || !query.trim()}
                      onClick={() => {
                        onChange(query.trim());
                        setOpen(false);
                      }}
                    >
                      {loadingSelection ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Use current text
                    </Button>
                  </div>
                </div>
              ) : null}

              {!loadingMaps && !loadError && mode === "map" ? (
                <div className="space-y-4">
                  <div
                    ref={mapContainerRef}
                    className="h-[360px] rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-950"
                  />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      Selected location
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                      {mapSelection ||
                        "Click on the map to drop a pin and use that location."}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={openGoogleMapsSearch}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Google Maps
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full"
                      onClick={useMapSelection}
                    >
                      Use pinned location
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AddressCard({
  title,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  icon: typeof MapPin;
  value: AddressState;
  onChange: (patch: Partial<AddressState>) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amazon-light text-white">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-black tracking-normal text-slate-950 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Add the contact details and the Google location the courier should
            use for this stop.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
          {addressModes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                onChange({
                  mode,
                  company: mode === "Residential" ? "" : value.company,
                })
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                value.mode === mode
                  ? "bg-amazon-light text-white"
                  : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Contact name">
          <TextInput
            value={value.contactName}
            onChange={(event) => onChange({ contactName: event.target.value })}
            placeholder="Full name"
          />
        </Field>
        <Field label="Phone number">
          <TextInput
            value={value.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            placeholder="+266..."
          />
        </Field>
        <Field
          label="Business / company"
          hint="Optional for residential addresses"
        >
          <TextInput
            value={value.company}
            onChange={(event) => onChange({ company: event.target.value })}
            placeholder="Store, office, or company"
          />
        </Field>
        <Field label="Email address">
          <TextInput
            type="email"
            value={value.email}
            onChange={(event) => onChange({ email: event.target.value })}
            placeholder="name@example.com"
          />
        </Field>
        <Field
          label="Google location"
          hint="Search for a place or pin it on the map"
        >
          <GoogleLocationField
            value={value.googleLocation}
            onChange={(nextValue) => onChange({ googleLocation: nextValue })}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Driver notes"
          hint="Gate code, landmark, or guidance that helps the driver find the pinned Google location"
        >
          <TextArea
            value={value.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder="Helpful instructions for pickup or drop-off"
          />
        </Field>
      </div>
    </section>
  );
}

export function ParcelDeliveryForm() {
  const [pickup, setPickup] = useState<AddressState>(() =>
    initialAddress("Residential"),
  );
  const [dropoff, setDropoff] = useState<AddressState>(() =>
    initialAddress("Business"),
  );
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>("express");
  const [parcelType, setParcelType] = useState<ParcelType>("parcel");
  const [collectionDate, setCollectionDate] = useState("");
  const [insured, setInsured] = useState(true);
  const [signatureRequired, setSignatureRequired] = useState(true);
  const [parcels, setParcels] = useState<ParcelItem[]>([createParcelItem(1)]);

  const totalWeight = useMemo(
    () => parcels.reduce((sum, item) => sum + item.weight * item.quantity, 0),
    [parcels],
  );
  const declaredValue = useMemo(
    () =>
      parcels.reduce(
        (sum, item) => sum + item.declaredValue * item.quantity,
        0,
      ),
    [parcels],
  );

  const serviceFee =
    serviceOptions.find((option) => option.id === serviceLevel)?.fee ?? 0;
  const baseRate = 65;
  const weightFee = Math.max(0, totalWeight - 1) * 12;
  const insuranceFee = insured ? Math.max(25, declaredValue * 0.012) : 0;
  const signatureFee = signatureRequired ? 18 : 0;
  const total = baseRate + serviceFee + weightFee + insuranceFee + signatureFee;
  const eta =
    serviceOptions.find((option) => option.id === serviceLevel)?.eta ?? "";

  function updateParcel(id: string, patch: Partial<ParcelItem>) {
    setParcels((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addParcel() {
    setParcels((current) => [...current, createParcelItem(current.length + 1)]);
  }

  function removeParcel(id: string) {
    setParcels((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Quote prepared", {
      description: `Estimated delivery ${eta.toLowerCase()} from ${formatPrice(total)}.`,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 lg:py-10">
      <div className="overflow-hidden rounded-[28px] bg-amazon-navy text-white shadow-xl">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amazon-gold">
              <Truck className="h-3.5 w-3.5" />
              Parcel Delivery
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-normal sm:text-4xl">
              Book pickup and delivery in one clean StiryBoy flow
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              Inspired by the attached courier layout, rebuilt with StiryBoy
              spacing, rounded cards, dark navy framing, and faster quote-first
              actions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                Instant quote summary
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                Pickup + drop-off side by side
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                Multi-parcel support
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amazon-gold">
              Quote snapshot
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-200">Estimated total</span>
                <span className="text-3xl font-black">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    Service
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize">
                    {serviceLevel}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    Parcels
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {parcels.length} item(s)
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    ETA
                  </p>
                  <p className="mt-1 text-sm font-semibold">{eta}</p>
                </div>
              </div>
              <p className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-200">
                The page is ready for styling and interaction. Wiring it to real
                booking APIs can come next.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AddressCard
              title="Collection details"
              icon={UserRound}
              value={pickup}
              onChange={(patch) =>
                setPickup((current) => ({ ...current, ...patch }))
              }
            />
            <AddressCard
              title="Delivery details"
              icon={MapPin}
              value={dropoff}
              onChange={(patch) =>
                setDropoff((current) => ({ ...current, ...patch }))
              }
            />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-normal text-slate-950 dark:text-white">
                  Shipment details
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Choose the speed, shipment type, and optional delivery
                  services.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Quote-only flow for now
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="grid gap-3 md:grid-cols-3">
                {parcelTypes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setParcelType(option.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      parcelType === option.id
                        ? "border-amazon-orange bg-amber-50 shadow-sm dark:bg-amber-500/10"
                        : "border-slate-200 hover:border-amazon-orange/60 dark:border-white/10",
                    )}
                  >
                    <p className="font-bold text-slate-950 dark:text-white">
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {option.helper}
                    </p>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Field label="Collection date">
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <TextInput
                      type="date"
                      value={collectionDate}
                      onChange={(event) =>
                        setCollectionDate(event.target.value)
                      }
                      className="pl-11"
                    />
                  </div>
                </Field>
                <Field label="Preferred time window">
                  <Select defaultValue="9am-1pm">
                    <option value="9am-1pm">
                      Morning pickup, 09:00 - 13:00
                    </option>
                    <option value="1pm-5pm">
                      Afternoon pickup, 13:00 - 17:00
                    </option>
                    <option value="after-hours">
                      After hours, 17:00 - 20:00
                    </option>
                  </Select>
                </Field>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {serviceOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setServiceLevel(option.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    serviceLevel === option.id
                      ? "border-amazon-light bg-amazon-light text-white shadow-sm"
                      : "border-slate-200 hover:border-amazon-light/60 dark:border-white/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{option.label}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          serviceLevel === option.id
                            ? "text-slate-100"
                            : "text-slate-500 dark:text-slate-400",
                        )}
                      >
                        {option.eta}
                      </p>
                    </div>
                    <span className="text-sm font-black">
                      {formatPrice(option.fee)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setInsured((current) => !current)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left transition",
                  insured
                    ? "border-amazon-orange bg-amber-50 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-white/10",
                )}
              >
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">
                    Shipment cover
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Protect declared goods during transit.
                  </p>
                </div>
                <span className="text-sm font-black">
                  {insured ? "On" : "Off"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSignatureRequired((current) => !current)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left transition",
                  signatureRequired
                    ? "border-amazon-orange bg-amber-50 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-white/10",
                )}
              >
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">
                    Proof of delivery
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Require recipient signature on handover.
                  </p>
                </div>
                <span className="text-sm font-black">
                  {signatureRequired ? "On" : "Off"}
                </span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-normal text-slate-950 dark:text-white">
                  Parcel contents
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Keep the structure from the example, but simplified for a
                  cleaner storefront feel.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addParcel}
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
                Add another parcel
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              {parcels.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amazon-light/10 text-amazon-light dark:bg-white/10 dark:text-white">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">
                          Parcel {index + 1}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Weight, quantity, and declared value
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParcel(item.id)}
                      disabled={parcels.length === 1}
                      className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-red-500 disabled:opacity-30 dark:border-white/10"
                      aria-label={`Remove parcel ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_120px_140px_160px]">
                    <Field label="Description">
                      <TextInput
                        value={item.description}
                        onChange={(event) =>
                          updateParcel(item.id, {
                            description: event.target.value,
                          })
                        }
                        placeholder="Shoes, documents, electronics, accessories"
                      />
                    </Field>
                    <Field label="Qty">
                      <TextInput
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          updateParcel(item.id, {
                            quantity: Math.max(
                              1,
                              Number(event.target.value) || 1,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label="Weight (kg)">
                      <TextInput
                        type="number"
                        min={0.1}
                        step="0.1"
                        value={item.weight}
                        onChange={(event) =>
                          updateParcel(item.id, {
                            weight: Math.max(
                              0.1,
                              Number(event.target.value) || 0.1,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label="Declared value">
                      <TextInput
                        type="number"
                        min={0}
                        step="1"
                        value={item.declaredValue}
                        onChange={(event) =>
                          updateParcel(item.id, {
                            declaredValue: Math.max(
                              0,
                              Number(event.target.value) || 0,
                            ),
                          })
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Avoid prohibited goods, liquids without secure packaging, or
                  unlabelled high-value items. Final pricing may change once the
                  parcel is physically assessed.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-normal text-slate-950 dark:text-white">
              Quote summary
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Live estimate based on your current shipment choices.
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Base route fee
                </span>
                <span className="font-bold text-slate-950 dark:text-white">
                  {formatPrice(baseRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Service uplift
                </span>
                <span className="font-bold text-slate-950 dark:text-white">
                  {formatPrice(serviceFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Extra weight
                </span>
                <span className="font-bold text-slate-950 dark:text-white">
                  {formatPrice(weightFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Insurance
                </span>
                <span className="font-bold text-slate-950 dark:text-white">
                  {formatPrice(insuranceFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Signature
                </span>
                <span className="font-bold text-slate-950 dark:text-white">
                  {formatPrice(signatureFee)}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Estimated total
                </span>
                <span className="text-2xl font-black text-slate-950 dark:text-white">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="mt-3 grid gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amazon-light" />
                  {eta}
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-amazon-light" />
                  {totalWeight.toFixed(1)} kg total shipment weight
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amazon-light" />
                  {formatPrice(declaredValue)} declared goods value
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Button type="submit" className="h-12 w-full rounded-full">
                Get parcel quote
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full"
              >
                Save as draft
              </Button>
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}
