import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export interface ChallengeFormData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    successCriteria: string;
}

interface ChallengeFormProps {
    defaultValues?: ChallengeFormData;
    onSubmit: (data: ChallengeFormData) => Promise<void>;
}

function formatDate(date: string): string {
    return date.split("T")[0];
}

function ChallengeForm({ defaultValues, onSubmit }: ChallengeFormProps) {
    const [form, setForm] = useState<ChallengeFormData>(() => ({
        title: defaultValues?.title || '',
        description: defaultValues?.description || '',
        startDate: defaultValues ? formatDate(defaultValues.startDate) : '',
        endDate: defaultValues ? formatDate(defaultValues.endDate) : '',
        successCriteria: defaultValues?.successCriteria || '',
    }));
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation("Community/ChallengeForm");

    useEffect(() => {
        if (defaultValues) {
            setForm({
                title: defaultValues.title,
                description: defaultValues.description,
                startDate: formatDate(defaultValues.startDate),
                endDate: formatDate(defaultValues.endDate),
                successCriteria: defaultValues.successCriteria,
            });
        }
    }, [defaultValues]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(f => ({
            ...f,
            [name]: value
        }));
        setError(null);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.title || !form.description || !form.startDate || !form.endDate || !form.successCriteria) {
            setError("All fields are required.");
            return;
        }

        if (new Date(form.startDate) >= new Date(form.endDate)) {
            setError("Start date must be before end date.");
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(form);
        } catch (error) {
            setError((error instanceof Error && error.message) ? error.message : "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

return (
    <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto space-y-4 p-4 bg-white rounded-2xl shadow w-full sm:w-auto"
    >
        {error && <p className="text-red-500">{error}</p>}

        <div>
            <label className="font-semibold">
                {t("title")}<span className="text-red-500">*</span>
            </label>
            <input
                name="title"
                type="text"
                maxLength={100}
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 sm:py-1 py-3 text-base"
            />
        </div>

        <div>
            <label className="font-semibold">
                {t("description")}<span className="text-red-500">*</span>
            </label>
            <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 sm:py-1 py-3 text-base"
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="font-semibold">
                    {t("startDate")}<span className="text-red-500">*</span>
                </label>
                <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 sm:py-1 py-3 text-base"
                />
            </div>
            <div>
                <label className="font-semibold">
                    {t("endDate")}<span className="text-red-500">*</span>
                </label>
                <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 sm:py-1 py-3 text-base"
                />
            </div>
        </div>

        <div>
            <label className="font-semibold">{t("successCriteria")}<span className="text-red-500">*</span></label>
            <input
                name="successCriteria"
                type="text"
                value={form.successCriteria}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 sm:py-1 py-3 text-base"
            />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2">
            <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded cursor-pointer max-sm:w-full max-sm:py-3 max-sm:text-base"
                onClick={() => navigate("/challenges")}
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
)

}

export default ChallengeForm;
