import { useState, ChangeEvent, FormEvent } from "react";
import { toLocalInput } from "../Utils/Date";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface EventFormData {
    name: string;
    startDate: string;
    endDate: string;
    place: string;
    maxNumberOfParticipants?: number | null;
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
    const { t } = useTranslation("Events/EventForm");

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((f) => ({
            ...f,
            [name]: name === "maxNumberOfParticipants"
                ? value === "" ? undefined : parseInt(value, 10)
                : value
        }));
        setError(null);
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
                    {t("name")} <span className="text-red-500">*</span>
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
                        {t("startDate")} <span className="text-red-500">*</span>
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
                        {t("endDate")} <span className="text-red-500">*</span>
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
                    {t("place")} <span className="text-red-500">*</span>
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
                    {t("maxNumberOfParticipants")}
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
                    {t("description")} <span className="text-red-500">*</span>
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
                    {t("cancel")}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? t("loading") : defaultValues ? t("update") : t("create")}
                </button>
            </div>
        </form>
    );
}

export default EventForm;
