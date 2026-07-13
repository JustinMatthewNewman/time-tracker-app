"use client";

import { useMemo, useState } from "react";
import { Card } from "@heroui/react";
import { parseWorkLogText, countEntries, type ParsedHourBlock } from "@/lib/workLogParser";

interface NewWorkLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; workLogDate: string; parsedBlocks?: ParsedHourBlock[] }) => Promise<void>;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

// `new Date("yyyy-mm-dd")` parses the string as UTC midnight, not local
// midnight. That shifts the 8am-4pm CEL duration offsets applied server-side
// in CreateWorkLog by the browser's UTC offset, so entries land at the wrong
// local wall-clock hours (e.g. 3am-11am instead of 8am-4pm for UTC-5 users).
function toLocalMidnightISOString(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toISOString();
}

export function NewWorkLogDialog({ isOpen, onClose, onCreate }: NewWorkLogDialogProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayDateString);
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-parsed on every keystroke/paste/upload so the preview and any
  // validation errors always reflect exactly what's currently in the box.
  const parseResult = useMemo(
    () => (pastedText.trim() ? parseWorkLogText(pastedText) : null),
    [pastedText]
  );
  const hasBlockingErrors = !!parseResult && parseResult.errors.length > 0;

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPastedText(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = ""; // allow re-uploading the same file after clearing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (hasBlockingErrors) {
      setError("Fix the errors in the pasted work log before creating it.");
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        name,
        workLogDate: toLocalMidnightISOString(date),
        parsedBlocks: parseResult?.blocks,
      });
      setName("");
      setDate(todayDateString());
      setPastedText("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create work log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">New Work Log</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold block mb-2">Title *</label>
              <input
                type="text"
                placeholder="What is this work log for?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                required
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold block">Paste or upload a filled-out work log</label>
                {pastedText && (
                  <button
                    type="button"
                    onClick={() => setPastedText("")}
                    className="text-xs text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    Clear
                  </button>
                )}
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={"[08:00 AM - 09:00 AM]\n+ [08:00 AM - 08:30 AM] - (19620) Description..."}
                rows={5}
                className="w-full px-3 py-2 border border-default-200 rounded-lg font-mono text-xs"
                disabled={loading}
              />

              <input
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileChange}
                disabled={loading}
                className="mt-2 text-xs"
              />

              {parseResult && (
                <div className="mt-2 text-xs">
                  {parseResult.errors.length === 0 ? (
                    <p className="text-green-700">
                      Parsed {parseResult.blocks.length} hour block{parseResult.blocks.length === 1 ? "" : "s"} and{" "}
                      {countEntries(parseResult.blocks)} entr
                      {countEntries(parseResult.blocks) === 1 ? "y" : "ies"}. Leave this blank to start with an
                      empty template instead.
                    </p>
                  ) : (
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-red-200 bg-red-50 p-2 text-red-700">
                      {parseResult.errors.map((err, i) => (
                        <p key={i}>
                          Line {err.line}: {err.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || !name.trim() || hasBlockingErrors}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default NewWorkLogDialog;
