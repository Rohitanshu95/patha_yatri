import React, { useMemo, useState } from "react";

const API_URL = "https://api.bolna.ai/call";
const API_TOKEN = "Bearer bn-1e9cbf5d7ecb427680ffd498b7ccbbfd";
const AGENT_ID = "59be1e4e-a5c1-48d1-92ed-a477e59b2e3d";

const normalizePhone = (input) => {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (input.startsWith("+") && digits.length >= 11) {
    return `+${digits}`;
  }
  return null;
};

const Bot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const normalizedPhone = useMemo(() => normalizePhone(phoneInput), [phoneInput]);
  const canSubmit = Boolean(normalizedPhone) && status !== "loading";

  const resetState = () => {
    setPhoneInput("");
    setStatus("idle");
    setError("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    setIsOpen(false);
    resetState();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!normalizedPhone) {
      setError("Please enter a valid 10-digit or +91 number.");
      return;
    }

    setStatus("loading");
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: API_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          recipient_phone_number: normalizedPhone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to schedule the call.");
      }

      if (data?.message === "done") {
        setSuccessMessage("You will soon get a call.");
        setStatus("success");
        setTimeout(() => {
            setIsOpen(false);
        }, 2000);
      } else {
        setSuccessMessage("Request queued. You will soon get a call.");
        setStatus("success");
      }
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#C5A059] text-white shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
        aria-label="Open call assistant"
      >
        <span className="material-symbols-outlined text-2xl">support_agent</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white border border-[#E3DCD1] shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-serif text-[#222222]">Call Assistant</h3>
                <p className="text-xs text-[#777777] uppercase tracking-widest">We will call you shortly</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-[#777777] hover:text-[#222222]"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#777777]">Mobile Number</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  placeholder="Enter 10-digit number"
                  className="mt-2 w-full border border-[#E3DCD1] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
                {normalizedPhone && (
                  <p className="text-[11px] text-[#777777] mt-2">We will call: {normalizedPhone}</p>
                )}
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
              {successMessage && <p className="text-xs text-emerald-600">{successMessage}</p>}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-xs uppercase tracking-widest text-[#777777] hover:text-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="bg-[#222222] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#C5A059] transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "Calling..." : "Request Call"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Bot;