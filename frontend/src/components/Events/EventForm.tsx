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

        const cleanForm: EventFormData = {
            ...form,
            name: form.name.trim(),
            place: form.place.trim(),
            description: form.description.trim(),
        };

        if (!cleanForm.name || !cleanForm.startDate || !cleanForm.endDate || !cleanForm.place || !cleanForm.description) {
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
            onSubmit(cleanForm);
        } catch (error) {
            setError((error instanceof Error && error.message) ? error.message : "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded shadow max-sm:max-w-full"
        >
            {error && <p className="text-red-500 max-sm:text-base">{error}</p>}

            <div>
                <label className="font-semibold max-sm:text-base">
                    {t("name")} <span className="text-red-500">*</span>
                </label>
                <input
                    name="name"
                    type="text"
                    maxLength={100}
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 max-sm:text-base max-sm:py-3"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                <div>
                    <label className="font-semibold max-sm:text-base">
                        {t("startDate")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="startDate"
                        type="datetime-local"
                        value={form.startDate}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1 max-sm:text-base max-sm:py-3"
                    />
                </div>

                <div>
                    <label className="font-semibold max-sm:text-base">
                        {t("endDate")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="endDate"
                        type="datetime-local"
                        value={form.endDate}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1 max-sm:text-base max-sm:py-3"
                    />
                </div>
            </div>

            <div>
                <label className="font-semibold max-sm:text-base">
                    {t("place")} <span className="text-red-500">*</span>
                </label>
                <input
                    name="place"
                    type="text"
                    value={form.place}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 max-sm:text-base max-sm:py-3"
                />
            </div>

            <div>
                <label className="font-semibold max-sm:text-base">
                    {t("maxNumberOfParticipants")}
                </label>
                <input
                    name="maxNumberOfParticipants"
                    type="number"
                    min={1}
                    value={form.maxNumberOfParticipants ?? ""}
                    onChange={handleChange}
                    className="w-32 border rounded px-2 py-1 ml-5 max-sm:w-full max-sm:ml-0 max-sm:text-base max-sm:py-3"
                />
            </div>

            <div>
                <label className="font-semibold max-sm:text-base">
                    {t("description")} <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    rows={5}
                    maxLength={5000}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 max-sm:text-base max-sm:py-3"
                />
            </div>

            <div className="flex justify-between max-sm:flex-col max-sm:gap-2">
                <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded cursor-pointer max-sm:w-full max-sm:py-3 max-sm:text-base"
                    onClick={() => navigate("/events")}
                >
                    {t("cancel")}
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 cursor-pointer max-sm:w-full max-sm:py-3 max-sm:text-base"
                >
                    {isSubmitting ? t("loading") : defaultValues ? t("update") : t("create")}
                </button>
            </div>
        </form>
    );
}

export default EventForm;
