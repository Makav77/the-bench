import { useState, useEffect } from 'react';
import { getChallenge, validateCompletion } from '../../api/challengeService';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ValidateCompletionsPage() {
    const { id } = useParams<{ id: string }>();
    const [challenge, setChallenge] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        getChallenge(id).then(setChallenge).catch(() => toast.error('Impossible de charger'));
    }, [id]);

    const handleValidate = async (compId: string, approved: boolean) => {
        if (!id) return;
        try {
            await validateCompletion(id, compId, { validated: approved });
            toast.success('Statut mis à jour');
            setChallenge(await getChallenge(id));
        } catch {
            toast.error('Erreur lors de la validation');
        }
    };

    if (!challenge) return <p>Loading…</p>;

    // on ne montre que les non validées
    const pending = challenge.completions.filter((c: any) => !c.validated);

    return (
        <div className="p-6 w-[60%] mx-auto">
            <h1 className="text-2xl font-bold mb-4">Valider les complétions</h1>
            {pending.length === 0
                ? <p>Aucune soumission en attente</p>
                : (
                    <ul className="space-y-4">
                        {pending.map((c: any) => (
                            <li key={c.id} className="border rounded p-4 bg-white shadow">
                                {c.text && <p className="mb-2">{c.text}</p>}
                                {c.imageUrl && <img src={c.imageUrl} alt="" className="mb-2 max-h-48 object-contain" />}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleValidate(c.id, true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded"
                                    >Valider</button>
                                    <button
                                        onClick={() => handleValidate(c.id, false)}
                                        className="bg-red-600 text-white px-4 py-2 rounded"
                                    >Rejeter</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            }
        </div>
    );
}
