import { useState, ChangeEvent, FormEvent } from "react";
import { toLocalInput } from "../Utils/Date";
import { useNavigate } from "react-router-dom";

export interface EventFormData {
    name: string;
    startDate: string;
    endDate: string;
    place: string;
    maxNumberOfParticipants?: number;
    description: string;
}

interface EventFormProps {
    defaultValues?: EventFormData;
    onSubmit: (data: EventFormData) => void;
}

function EventForm({ defaultValues, onSubmit }: EventFormProps) {
    const [form, setForm] = useState<EventFormData>(() => {
        if (defaultValues) {
            return {
                ...defaultValues,
                startDate: toLocalInput(defaultValues.startDate),
                endDate: toLocalInput(defaultValues.endDate),
            };
        }
        return {
            name: "",
            startDate: "",
            endDate: "",
            place: "",
            maxNumberOfParticipants: undefined,
            description: "",
        };
    });

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((f) => ({
            ...f,
            [name]:
                name === "maxNumberOfParticipants" ? value === "" ? undefined: parseInt(value, 10): value
        }));
        setError(null)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!form.name || !form.startDate || !form.endDate || !form.place || !form.description) {
            setError("Name, start date, end date, place and description must be fullfiled");
            setIsSubmitting(false);
            return;
        }

        if (new Date(form.startDate) >= new Date(form.endDate)) {
            setError("Start date must be before end date.");
            setIsSubmitting(false);
            return;
        }

        try {
            onSubmit(form);
        } catch (error) {
            setError((error instanceof Error && error.message) ? error.message : "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded shadow"
        >
            {error && <p className="text-red-500">{error}</p>}

            <div>
                <label className="font-semibold">
                    Name<span className="text-red-500">*</span>
                </label>
                <input
                    name="name"
                    type="text"
                    maxLength={100}
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-semibold">
                        Start date<span className="text-red-500">*</span>
                    </label>
                    <input
                        name="startDate"
                        type="datetime-local"
                        value={form.startDate}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                <div>
                    <label className="font-semibold">
                        End date<span className="text-red-500">*</span>
                    </label>
                    <input
                        name="endDate"
                        type="datetime-local"
                        value={form.endDate}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
            </div>

            <div>
                <label className="font-semibold">
                    Place<span className="text-red-500">*</span>
                </label>
                <input
                    name="place"
                    type="text"
                    value={form.place}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div>
                <label className="font-semibold">
                    Max number of participants
                </label>
                <input
                    name="maxNumberOfParticipants"
                    type="number"
                    min={1}
                    value={form.maxNumberOfParticipants ?? ""}
                    onChange={handleChange}
                    className="w-32 border rounded px-2 py-1 ml-5"
                />
            </div>

            <div>
                <label className="font-semibold">
                    Description<span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    rows={5}
                    maxLength={5000}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                />
            </div>

            <div className="flex justify-between">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded cursor-pointer"
                    onClick={() => navigate("/events")}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
                >
                    {isSubmitting ? "Loading..." : defaultValues ? "Update" : "Create"}
                </button>
            </div>
        </form>
    );
}

export default EventForm;
